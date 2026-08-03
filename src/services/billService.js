import { SEED_TPLS } from '../utils/constants';

const LS_BILLS = "bill_book_bills";
const LS_DRF = "ig_drf_v3";
const LS_TPL = "ig_tpl_v3";

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const billService = {
  // ----- BILLS -----
  saveBill: async (bill) => {
    await delay();
    const bills = billService.listBillsSync();
    
    // Ensure items are snapshots
    const snapshotBill = {
      ...bill,
      id: bill.id || `BILL-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      items: bill.items.map(it => ({ ...it })) // snapshot rule
    };
    
    const existingIdx = bills.findIndex(b => b.id === snapshotBill.id);
    if (existingIdx >= 0) {
      bills[existingIdx] = snapshotBill;
    } else {
      snapshotBill.createdAt = new Date().toISOString();
      snapshotBill.status = snapshotBill.status || 'Pending';
      bills.unshift(snapshotBill);
    }
    
    localStorage.setItem(LS_BILLS, JSON.stringify(bills));
    return snapshotBill;
  },

  getBill: async (id) => {
    await delay();
    const bills = billService.listBillsSync();
    return bills.find(b => b.id === id) || null;
  },

  listBills: async () => {
    await delay();
    return billService.listBillsSync();
  },

  updateBillStatus: async (id, status) => {
    await delay();
    const bills = billService.listBillsSync();
    const idx = bills.findIndex(b => b.id === id);
    if (idx >= 0) {
      bills[idx].status = status;
      bills[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(LS_BILLS, JSON.stringify(bills));
      return bills[idx];
    }
    throw new Error('Bill not found');
  },

  listBillsSync: () => {
    try { return JSON.parse(localStorage.getItem(LS_BILLS)) || []; }
    catch { return []; }
  },

  // ----- DRAFTS -----
  saveDraft: async (draft) => {
    await delay();
    let drafts = billService.getDraftsSync();
    
    // Draft cap of 8
    drafts.unshift({
      ...draft,
      savedAt: new Date().toISOString(),
    });
    
    if (drafts.length > 8) {
      drafts = drafts.slice(0, 8);
    }
    
    localStorage.setItem(LS_DRF, JSON.stringify(drafts));
    return drafts;
  },

  getDrafts: async () => {
    await delay();
    return billService.getDraftsSync();
  },

  deleteDraft: async (idx) => {
    await delay();
    let drafts = billService.getDraftsSync();
    drafts.splice(idx, 1);
    localStorage.setItem(LS_DRF, JSON.stringify(drafts));
    return drafts;
  },

  getDraftsSync: () => {
    try { return JSON.parse(localStorage.getItem(LS_DRF)) || []; }
    catch { return []; }
  },

  // ----- TEMPLATES -----
  getTemplates: async () => {
    await delay();
    return billService.getTemplatesSync();
  },

  saveTemplate: async (template) => {
    await delay();
    let tpls = billService.getTemplatesSync();
    tpls.unshift({
      ...template,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
      seeded: false
    });
    localStorage.setItem(LS_TPL, JSON.stringify(tpls));
    return tpls;
  },

  deleteTemplate: async (id) => {
    await delay();
    let tpls = billService.getTemplatesSync();
    tpls = tpls.filter(t => t.id !== id);
    localStorage.setItem(LS_TPL, JSON.stringify(tpls));
    return tpls;
  },

  getTemplatesSync: () => {
    try { 
      let tpls = localStorage.getItem(LS_TPL);
      if (!tpls) {
        // Seed templates if missing
        const seeded = SEED_TPLS.map(t => ({ ...t, seeded: true, createdAt: "" }));
        localStorage.setItem(LS_TPL, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(tpls);
    } catch { 
      return []; 
    }
  }
};
