// "Recall" for New Bill: remembers values typed on earlier bills so they can be suggested
// again (customers, phone, GSTIN, UPI, IFSC, HSN). Kept in this browser only,
// per business, for RECALL_DAYS. Merged with customers found in saved bills.
// Bank account numbers are NEVER stored in the browser — they are suggested only
// from saved bills (database, protected by RLS).

const RECALL_DAYS = 7;
const MAX_CUSTOMERS = 30;
const MAX_VALUES = 12;
const key = (businessId) => `bb_recall_${businessId || 'anon'}`;
const fresh = (at) => Date.now() - at < RECALL_DAYS * 86_400_000;
const norm = (v) => String(v || '').trim();

const read = (businessId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(key(businessId)) || '{}');
    return {
      customers: (raw.customers || []).filter((c) => fresh(c.at)),
      fields: Object.fromEntries(Object.entries(raw.fields || {}).map(([k, list]) => [k, (list || []).filter((x) => fresh(x.at))])),
    };
  } catch {
    return { customers: [], fields: {} };
  }
};

const write = (businessId, data) => {
  try { localStorage.setItem(key(businessId), JSON.stringify(data)); } catch { /* storage full / blocked */ }
};

const pushValue = (list = [], value, at) => {
  const v = norm(value);
  if (!v) return list;
  return [{ v, at }, ...list.filter((x) => x.v.toLowerCase() !== v.toLowerCase())].slice(0, MAX_VALUES);
};

// Call after a bill is printed or a draft is saved.
export const rememberBill = (businessId, { customer = {}, payment = {}, items = [] }) => {
  const data = read(businessId);
  const at = Date.now();
  const name = norm(customer.custName);
  if (name) {
    const entry = {
      custName: name,
      custAddress: norm(customer.custAddress),
      custPhone: norm(customer.custPhone),
      custGstin: norm(customer.custGstin),
      custState: norm(customer.custState),
      at,
    };
    data.customers = [entry, ...data.customers.filter((c) => c.custName.toLowerCase() !== name.toLowerCase())].slice(0, MAX_CUSTOMERS);
  }
  const f = data.fields;
  f.custPhone = pushValue(f.custPhone, customer.custPhone, at);
  f.custGstin = pushValue(f.custGstin, customer.custGstin, at);
  f.upiId = pushValue(f.upiId, payment.upiId, at);
  delete f.bankAcc; // removes any bank numbers saved by the earlier version
  f.ifsc = pushValue(f.ifsc, payment.ifsc, at);
  items.forEach((it) => { f.hsn = pushValue(f.hsn, it.hsn, at); });
  write(businessId, data);
};

// Suggestions = remembered values + customers from saved bills (newest first, no duplicates).
export const buildSuggestions = (businessId, bills = []) => {
  const data = read(businessId);
  const seen = new Set();
  const customers = [];
  const add = (c) => {
    const name = norm(c?.custName);
    if (!name || seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());
    customers.push({ ...c, custName: name });
  };
  data.customers.forEach(add);
  bills.forEach((b) => add(b.customer));

  const values = (field, extra = []) => {
    const out = [];
    const s = new Set();
    [...(data.fields[field] || []).map((x) => x.v), ...extra].forEach((v) => {
      const t = norm(v);
      if (t && !s.has(t.toLowerCase())) { s.add(t.toLowerCase()); out.push(t); }
    });
    return out.slice(0, MAX_VALUES);
  };

  return {
    customers: customers.slice(0, MAX_CUSTOMERS),
    custPhone: values('custPhone', customers.map((c) => c.custPhone)),
    custGstin: values('custGstin', customers.map((c) => c.custGstin)),
    upiId: values('upiId', bills.map((b) => b.payment?.upiId)),
    bankAcc: values('__none__', bills.map((b) => b.payment?.bankAcc)), // from saved bills only
    ifsc: values('ifsc', bills.map((b) => b.payment?.ifsc)),
    hsn: values('hsn'),
  };
};

export const findCustomer = (suggestions, name) => {
  const n = norm(name).toLowerCase();
  return n ? suggestions?.customers?.find((c) => c.custName.toLowerCase() === n) || null : null;
};
