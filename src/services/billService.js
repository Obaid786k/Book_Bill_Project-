import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { cached, mutating } from '../lib/dataCache';
import { handleSupabaseError } from '../utils/handleSupabaseError';

const getBusinessId = () => useAuthStore.getState().user?.businessId;

// Maps a `bills` row (snake_case, DB shape) back to the flat shape every
// page already expects (meta.invoiceNo, customer.custName, etc.)
const toBillShape = (row) => ({
  id: row.id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  shop: row.shop,
  customer: row.customer,
  payment: row.payment,
  settings: row.settings,
  items: row.items,
  terms: row.terms,
  notes: row.notes,
  // Server-computed totals (finalize_bill / update_bill_details) — the source of truth.
  totals: {
    subtotal: Number(row.subtotal) || 0,
    cgst: Number(row.cgst_total) || 0,
    sgst: Number(row.sgst_total) || 0,
    igst: Number(row.igst_total) || 0,
    roundOff: Number(row.round_off) || 0,
    grand: Number(row.grand_total) || 0,
  },
  meta: {
    invoiceNo: row.invoice_no,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    terms: row.terms,
    notes: row.notes,
  },
});

// The row's own id/saved_at must come AFTER the payload spread — older
// drafts stored an `id` key inside the payload, which would otherwise
// overwrite the real draft id (making delete/restore target the wrong row).
const toDraftShape = (row) => ({
  ...row.payload,
  id: row.id,
  savedAt: row.saved_at,
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
  // New bill (no bill.id) → finalize_bill RPC: validates line items,
  // recomputes GST/totals server-side and issues the invoice number atomically.
  // Existing bill (bill.id — editing from Bill History, or re-printing) →
  // update_bill_details RPC: same validation/recompute, invoice_no frozen.
  saveBill: async (bill) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');

    if (bill.id) {
      const { data, error } = await supabase.rpc('update_bill_details', {
        p_bill_id: bill.id,
        p_bill: bill,
      });
      if (error) throw handleSupabaseError(error, { table: 'bills', action: 'update_bill_details' });
      return toBillShape(data);
    }

    const { data, error } = await supabase.rpc('finalize_bill', {
      p_business_id: businessId,
      p_bill: bill,
    });
    if (error) throw handleSupabaseError(error, { table: 'bills', action: 'finalize_bill' });
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
    if (error) throw handleSupabaseError(error, { table: 'bills', action: 'select' });
    return data.map(toBillShape);
  },

  updateBillStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('bills')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw handleSupabaseError(error, { table: 'bills', action: 'updateStatus' });
    return toBillShape(data);
  },

  // Issued invoices are cancelled, never deleted (GST rule; DELETE revoked in 0007).
  // The bill and its number stay; it prints with a CANCELLED watermark.
  cancelBill: async (id) => billService.updateBillStatus(id, 'Cancelled'),

  // ----- DRAFTS -----
  // The 8-draft cap is enforced server-side (a trigger deletes the oldest
  // beyond 8 automatically) — no client-side slicing needed anymore.
  // One bill = one draft: pass the draft's id to update it in place (it moves to newest).
  // If that draft no longer exists (deleted / pushed out by the cap) a new one is created.
  // Returns { id, drafts }.
  saveDraft: async (draft, draftId = null) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');
    if (draftId) {
      const { data, error } = await supabase
        .from('drafts')
        .update({ payload: draft, saved_at: new Date().toISOString() })
        .eq('id', draftId)
        .select('id');
      if (error) throw handleSupabaseError(error, { table: 'drafts', action: 'update' });
      if (data?.length) return { id: draftId, drafts: await billService.getDrafts() };
    }
    const { data, error } = await supabase
      .from('drafts')
      .insert({ business_id: businessId, payload: draft })
      .select('id')
      .single();
    if (error) throw handleSupabaseError(error, { table: 'drafts', action: 'insert' });
    return { id: data.id, drafts: await billService.getDrafts() };
  },

  getDrafts: async () => {
    const businessId = getBusinessId();
    if (!businessId) return [];
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('business_id', businessId)
      .order('saved_at', { ascending: false });
    if (error) throw handleSupabaseError(error, { table: 'drafts', action: 'select' });
    return data.map(toDraftShape);
  },

  deleteDraft: async (id) => {
    const { error } = await supabase.from('drafts').delete().eq('id', id);
    if (error) throw handleSupabaseError(error, { table: 'drafts', action: 'delete' });
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
    if (error) throw handleSupabaseError(error, { table: 'templates', action: 'select' });
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
    if (error) throw handleSupabaseError(error, { table: 'templates', action: 'insert' });
    return billService.getTemplates();
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw handleSupabaseError(error, { table: 'templates', action: 'delete' });
    return billService.getTemplates();
  }
};

// Speed: remember reads for a few minutes; any save/delete clears the memory (src/lib/dataCache.js).
billService.getBill = cached('bills.one', billService.getBill);
billService.listBills = cached('bills.list', billService.listBills);
billService.getDrafts = cached('drafts.list', billService.getDrafts);
billService.getTemplates = cached('templates.list', billService.getTemplates);
billService.saveBill = mutating(billService.saveBill);
billService.updateBillStatus = mutating(billService.updateBillStatus);
billService.saveDraft = mutating(billService.saveDraft);
billService.deleteDraft = mutating(billService.deleteDraft);
billService.saveTemplate = mutating(billService.saveTemplate);
billService.deleteTemplate = mutating(billService.deleteTemplate);
