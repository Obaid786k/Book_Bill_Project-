import { supabase } from '../lib/supabaseClient';
import { handleSupabaseError } from '../utils/handleSupabaseError';

// Fetches the profile + business row for the currently logged-in user,
// shaped exactly like the old mock's user object so nothing else in the
// app (authStore, pages) needs to change.
// Profile + the business "setup done" flag in ONE request (was two round trips).
const PROFILE_SELECT = 'full_name, is_super_admin, business_id, business:businesses!profiles_business_id_fkey(has_completed_setup)';

const buildUserShape = async (authUser) => {
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', authUser.id)
    .single();

  // If the joined read is ever rejected (relationship error), fall back to the plain read.
  if (profileError && ['PGRST200', 'PGRST201'].includes(profileError.code)) {
    ({ data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, is_super_admin, business_id')
      .eq('id', authUser.id)
      .single());
  }

  // Self-heal: If profile is missing (PGRST116 or multiple rows coercion error on 0 rows),
  // it means the user was created before the trigger or manually.
  if (profileError && (profileError.code === 'PGRST116' || profileError.message.includes('coerce'))) {
    // Create the missing profile/business rows server-side (direct client
    // inserts into these tables are not permitted). See 0006 migration.
    const { error: healErr } = await supabase.rpc('ensure_user_profile');
    if (healErr) console.warn('[authService] ensure_user_profile failed:', healErr);
    
    // Fetch again
    const retry = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', authUser.id)
      .single();
    
    profile = retry.data;
    profileError = retry.error;
  }

  if (profileError) throw handleSupabaseError(profileError, { table: 'profiles', action: 'select' });

  let hasCompletedSetup = profile.business?.has_completed_setup || false;
  // Safety net: if the joined value didn't come back, ask the old way.
  if (profile.business_id && !profile.business) {
    const { data: business } = await supabase
      .from('businesses')
      .select('has_completed_setup')
      .eq('id', profile.business_id)
      .single();
    hasCompletedSetup = business?.has_completed_setup || false;
  }

  // Name/photo fallbacks: saved profile -> Google / sign-up metadata -> email.
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    pendingEmail: authUser.new_email || null,
    name: profile.full_name || meta.full_name || meta.name || (authUser.email || '').split('@')[0],
    avatarUrl: meta.avatar_url || meta.picture || null,
    // Role from the database: profiles.is_super_admin (default false; set true in Supabase).
    isAdmin: !!profile.is_super_admin,
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
