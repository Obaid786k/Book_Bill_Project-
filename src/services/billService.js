import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { normalizeError } from '../lib/normalizeError';

const getBusinessId = () => useAuthStore.getState().user?.businessId;

// Maps a `bills` row (snake_case, DB shape) back to the flat shape every
// page already expects (meta.invoiceNo, customer.custName, etc.)
const toBillShape = (row) => ({
  id: row.id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  customer: row.customer,
  payment: row.payment,
  settings: row.settings,
  items: row.items,
  terms: row.terms,
  notes: row.notes,
  meta: {
    invoiceNo: row.invoice_no,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    terms: row.terms,
    notes: row.notes,
  },
});

const toDraftShape = (row) => ({
  id: row.id,
  savedAt: row.saved_at,
  ...row.payload,
});

const toTemplateShape = (row) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  profile: row.profile,
  settings: row.settings,
  seeded: row.seeded,
});

export const billService = {
  // ----- BILLS -----
  // Creates a new bill (always the case today — no caller currently passes
  // bill.id) via the finalize_bill RPC, which validates line items,
  // recomputes GST/totals server-side, and generates the invoice number
  // atomically. If bill.id is ever passed in future, routes to
  // update_bill_details instead (full edit — invoice_no is frozen either way).
  saveBill: async (bill) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');

    if (bill.id) {
      const { data, error } = await supabase.rpc('update_bill_details', {
        p_bill_id: bill.id,
        p_bill: bill,
      });
      if (error) throw normalizeError(error);
      return toBillShape(data);
    }

    const { data, error } = await supabase.rpc('finalize_bill', {
      p_business_id: businessId,
      p_bill: bill,
    });
    if (error) throw normalizeError(error);
    return toBillShape(data);
  },

  getBill: async (id) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return toBillShape(data);
  },

  listBills: async () => {
    const businessId = getBusinessId();
    if (!businessId) return [];
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw normalizeError(error);
    return data.map(toBillShape);
  },

  updateBillStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('bills')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw normalizeError(error);
    return toBillShape(data);
  },

  // Full content edit (items/customer/totals etc. — invoice_no is frozen
  // regardless). Not wired to any page yet — the frontend has no Edit UI
  // on Bill History today, only the backend capability exists so far.
  updateBillDetails: async (id, bill) => {
    const { data, error } = await supabase.rpc('update_bill_details', {
      p_bill_id: id,
      p_bill: bill,
    });
    if (error) throw normalizeError(error);
    return toBillShape(data);
  },

  // Not wired to any page yet — same as above, backend-ready only.
  deleteBill: async (id) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) throw normalizeError(error);
    return true;
  },

  // ----- DRAFTS -----
  // The 8-draft cap is enforced server-side (a trigger deletes the oldest
  // beyond 8 automatically) — no client-side slicing needed anymore.
  saveDraft: async (draft) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');
    const { error } = await supabase
      .from('drafts')
      .insert({ business_id: businessId, payload: draft });
    if (error) throw normalizeError(error);
    return billService.getDrafts();
  },

  getDrafts: async () => {
    const businessId = getBusinessId();
    if (!businessId) return [];
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('business_id', businessId)
      .order('saved_at', { ascending: false });
    if (error) throw normalizeError(error);
    return data.map(toDraftShape);
  },

  deleteDraft: async (id) => {
    const { error } = await supabase.from('drafts').delete().eq('id', id);
    if (error) throw normalizeError(error);
    return billService.getDrafts();
  },

  // ----- TEMPLATES -----
  // System templates (business_id null) are seeded once directly in the
  // database migration — no frontend seeding needed anymore.
  getTemplates: async () => {
    const businessId = getBusinessId();
    let query = supabase.from('templates').select('*');
    query = businessId
      ? query.or(`business_id.is.null,business_id.eq.${businessId}`)
      : query.is('business_id', null);
    const { data, error } = await query.order('seeded', { ascending: false });
    if (error) throw normalizeError(error);
    return data.map(toTemplateShape);
  },

  saveTemplate: async (template) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');
    const { error } = await supabase.from('templates').insert({
      business_id: businessId,
      name: template.name,
      icon: template.icon || '',
      profile: template.profile || {},
      settings: template.settings || {},
    });
    if (error) throw normalizeError(error);
    return billService.getTemplates();
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw normalizeError(error);
    return billService.getTemplates();
  }
};
