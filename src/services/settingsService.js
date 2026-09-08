import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { handleSupabaseError } from '../utils/handleSupabaseError';

const getBusinessId = () => useAuthStore.getState().user?.businessId;

const fetchRow = async () => {
  const businessId = getBusinessId();
  if (!businessId) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  if (error) throw handleSupabaseError(error, { table: 'businesses', action: 'select' });
  return data;
};

const updateRow = async (dbFields) => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business found for current user');
  const { error } = await supabase
    .from('businesses')
    .update(dbFields)
    .eq('id', businessId);
  if (error) throw handleSupabaseError(error, { table: 'businesses', action: 'update' });
  return true;
};

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
  // NOTE: once billService.saveBill moves to the finalize_bill() RPC
  // (Phase 3 — billing core), that RPC generates the next invoice number
  // internally and this separate call won't be needed from NewBill.jsx
  // anymore. Kept working standalone here in the meantime.
  incrementInvoiceSequence: async () => {
    const businessId = getBusinessId();
    if (!businessId) return null;
    const { data, error } = await supabase.rpc('generate_next_invoice_no', { p_business_id: businessId });
    if (error) throw handleSupabaseError(error, { table: 'businesses', action: 'generate_next_invoice_no' });
    return data;
  },

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
  changePassword: async (_oldPassword, newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'updateUserPassword' });
    return true;
  }
};
