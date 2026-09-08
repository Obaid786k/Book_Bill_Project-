import { supabase } from '../lib/supabaseClient';
import { handleSupabaseError } from '../utils/handleSupabaseError';

// Fetches the profile + business row for the currently logged-in user,
// shaped exactly like the old mock's user object so nothing else in the
// app (authStore, pages) needs to change.
const buildUserShape = async (authUser) => {
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, is_super_admin, business_id')
    .eq('id', authUser.id)
    .single();

  // Self-heal: If profile is missing (PGRST116 or multiple rows coercion error on 0 rows),
  // it means the user was created before the trigger or manually.
  if (profileError && (profileError.code === 'PGRST116' || profileError.message.includes('coerce'))) {
    // Attempt to manually create missing rows (user was created before trigger was set up)
    const { error: insertProfileErr } = await supabase.from('profiles').insert({ id: authUser.id, full_name: authUser.user_metadata?.full_name || '' });
    if (insertProfileErr) console.warn('[authService] self-heal profile insert failed:', insertProfileErr);
    
    const { error: insertBizErr } = await supabase.from('businesses').insert({ owner_id: authUser.id });
    if (insertBizErr) console.warn('[authService] self-heal business insert failed:', insertBizErr);
    
    // Fetch again
    const retry = await supabase
      .from('profiles')
      .select('full_name, is_super_admin, business_id')
      .eq('id', authUser.id)
      .single();
    
    profile = retry.data;
    profileError = retry.error;
  }

  if (profileError) throw handleSupabaseError(profileError, { table: 'profiles', action: 'select' });

  let hasCompletedSetup = false;
  if (profile.business_id) {
    const { data: business } = await supabase
      .from('businesses')
      .select('has_completed_setup')
      .eq('id', profile.business_id)
      .single();
    hasCompletedSetup = business?.has_completed_setup || false;
  }

  return {
    id: authUser.id,
    email: authUser.email,
    name: profile.full_name || '',
    isAdmin: profile.is_super_admin || false,
    hasCompletedSetup,
    businessId: profile.business_id || null,
  };
};

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'login' });
    return buildUserShape(data.user);
  },

  signup: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/email-confirmed`
      },
    });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'signup' });
    // No session yet until email is verified (depending on project settings) —
    // return a minimal shape; the page already routes to /verify-email next.
    return {
      id: data.user?.id,
      email,
      name,
      isAdmin: false,
      hasCompletedSetup: false,
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'logout' });
  },

  checkEmailStatus: async (email) => {
    if (!email) return { exists: false, is_confirmed: false };
    try {
      const { data, error } = await supabase.rpc('check_user_verification_status', {
        p_email: email.trim().toLowerCase(),
      });
      if (error) {
        console.warn('[authService] check_user_verification_status RPC warning:', error.message);
        return { exists: false, is_confirmed: false, rpcMissing: true };
      }
      return data || { exists: false, is_confirmed: false };
    } catch {
      return { exists: false, is_confirmed: false };
    }
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'resetPassword' });
    return true;
  },

  resendVerification: async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmed`,
      },
    });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'resendVerification' });
    return true;
  },

  // Restores a session on page load/refresh (called once from authStore's
  // initialize()). Returns the same shape as login(), or null if no session.
  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return buildUserShape(session.user);
  },

  // Lets authStore react to sign-in/sign-out from another tab, token
  // refresh, etc. Returns the unsubscribe function.
  onAuthStateChange: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => subscription.unsubscribe();
  },
};
