import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { cached, mutating } from '../lib/dataCache';
import { handleSupabaseError } from '../utils/handleSupabaseError';

const getBusinessId = () => useAuthStore.getState().user?.businessId;

// One cached read of the business row serves every settings page.
const fetchRow = cached('business.row', async () => {
  const businessId = getBusinessId();
  if (!businessId) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  if (error) throw handleSupabaseError(error, { table: 'businesses', action: 'select' });
  return data;
});

const updateRow = mutating(async (dbFields) => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business found for current user');
  const { error } = await supabase
    .from('businesses')
    .update(dbFields)
    .eq('id', businessId);
  if (error) throw handleSupabaseError(error, { table: 'businesses', action: 'update' });
  return true;
});

export const settingsService = {
  // Business Profile
  getBusinessProfile: async () => {
    const row = await fetchRow();
    if (!row) return { shopName: '', tagline: '', shopAddress: '', shopState: '', shopPhone: '', shopEmail: '' };
    return {
      shopName: row.business_name,
      tagline: row.tagline,
      shopAddress: row.address,
      shopState: row.state,
      shopPhone: row.phone,
      shopEmail: row.email,
    };
  },
  saveBusinessProfile: async (data) => updateRow({
    business_name: data.shopName,
    tagline: data.tagline,
    address: data.shopAddress,
    state: data.shopState,
    phone: data.shopPhone,
    email: data.shopEmail,
  }),

  // Invoice Preferences
  getInvoicePreferences: async () => {
    const row = await fetchRow();
    if (!row) return { defaultTaxType: 'inclusive', defaultCopyType: 'original', defaultTerms: '', invoiceSequence: 'INV-0001' };
    return {
      defaultTaxType: row.default_tax_type,
      defaultCopyType: row.default_copy_type,
      defaultTerms: row.default_terms,
      invoiceSequence: row.invoice_sequence,
    };
  },
  saveInvoicePreferences: async (data) => updateRow({
    default_tax_type: data.defaultTaxType,
    default_copy_type: data.defaultCopyType,
    default_terms: data.defaultTerms,
    invoice_sequence: data.invoiceSequence,
  }),
  // Invoice numbers are issued only inside finalize_bill() (see billService);
  // generate_next_invoice_no() is internal and not callable from the client.

  // GST Settings
  getGSTSettings: async () => {
    const row = await fetchRow();
    if (!row) return { shopGstin: '', defaultHsnBehavior: 'optional' };
    return { shopGstin: row.gstin, defaultHsnBehavior: row.default_hsn_behavior };
  },
  saveGSTSettings: async (data) => updateRow({
    gstin: data.shopGstin,
    default_hsn_behavior: data.defaultHsnBehavior,
  }),

  // Payment Settings
  getPaymentSettings: async () => {
    const row = await fetchRow();
    if (!row) return { payMode: 'Cash', upiId: '', bankAcc: '', ifsc: '' };
    return { payMode: row.pay_mode, upiId: row.upi_id, bankAcc: row.bank_acc, ifsc: row.ifsc };
  },
  savePaymentSettings: async (data) => updateRow({
    pay_mode: data.payMode,
    upi_id: data.upiId,
    bank_acc: data.bankAcc,
    ifsc: data.ifsc,
  }),

  // Notification Settings
  getNotificationSettings: async () => {
    const row = await fetchRow();
    if (!row) return { emailAlerts: true, smsAlerts: false, dailySummary: true, stockAlerts: true };
    return {
      emailAlerts: row.email_alerts,
      smsAlerts: row.sms_alerts,
      dailySummary: row.daily_summary,
      stockAlerts: row.stock_alerts,
    };
  },
  saveNotificationSettings: async (data) => updateRow({
    email_alerts: data.emailAlerts,
    sms_alerts: data.smsAlerts,
    daily_summary: data.dailySummary,
    stock_alerts: data.stockAlerts,
  }),

  // Security Settings
  // Logged-in password change: re-verifies the CURRENT password before
  // setting the new one, so an unattended open session can't be used to
  // take over the account. Other devices are signed out afterwards.
  changePassword: async (oldPassword, newPassword) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) throw handleSupabaseError(userError || { code: 'session_not_found' }, { table: 'auth', action: 'getUser' });

    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword });
    if (verifyError) {
      const err = new Error('Current password is incorrect.');
      err.field = 'oldPassword';
      throw err;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'updateUserPassword' });

    // Best-effort: end sessions on other devices; never fail the change over it.
    await supabase.auth.signOut({ scope: 'others' }).catch(() => {});
    return true;
  },

  // Password-recovery flow only (ResetPassword page). The user proved
  // ownership via the emailed one-time link, so there is no current password.
  setRecoveredPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'updateUserPassword' });
    return true;
  }
};
