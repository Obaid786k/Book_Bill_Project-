import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate, useBlocker } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { SettingsBar } from '../../modules/billing/components/SettingsBar';
import { COPY_TYPES, normalizeCopyType } from '../../modules/billing/copyTypes';
import { InvoiceHeader } from '../../modules/billing/components/InvoiceHeader';
import { InfoGrid } from '../../modules/billing/components/InfoGrid';
import { PosBar } from '../../modules/billing/components/PosBar';
import { ItemsTable } from '../../modules/billing/components/ItemsTable';
import { BillFoot } from '../../modules/billing/components/BillFoot';
import { SignRow } from '../../modules/billing/components/SignRow';
import { DraftsStrip } from '../../modules/billing/components/DraftsStrip';
import { billService } from '../../services/billService';
import { shopService } from '../../services/shopService';
import { settingsService } from '../../services/settingsService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Dialog } from '../../components/common/Dialog';
import { useToast } from '../../components/feedback/Toast';
import { recalc, autoTax, formatCurrency } from '../../utils/gstCalc';
import { STATES } from '../../utils/constants';
import { localDateStr } from '../../utils/date';
import { Edit2, Check, Ban, Plus, Zap, X, CheckCircle2 } from 'lucide-react';
import { isValidGstin, stateFromGstin } from '../../utils/gstin';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { rememberBill, buildSuggestions, findCustomer } from '../../utils/recall';
import { useQueryClient } from '@tanstack/react-query';
import { ALERT_KEYS } from '../../hooks/useAlerts';
import { PageHeader } from '../../components/common/PageHeader';
import '../../styles/invoice.css'; // Original CSS (Print locked)
import '../../styles/invoice-screen-comfort.css'; // Phase 15 Screen Comfort Overrides

const FALLBACK_STATE = "Uttar Pradesh";
const DEFAULT_TERMS = "• Goods once sold will not be taken back or exchanged.\n• E. & O.E. (errors and omissions excepted).\n• Subject to local jurisdiction.";

// Shop fields start blank and are filled from the business profile on load.
const INITIAL_SHOP = {
  shopName: "",
  tagline: "",
  shopAddress: "",
  shopPhone: "",
  shopEmail: "",
  shopGstin: "",
  shopState: ""
};

const INITIAL_CUSTOMER = {
  custName: "",
  custAddress: "",
  custPhone: "",
  custGstin: "",
  custState: ""
};

// payMode starts blank so the business profile's default can be applied.
const INITIAL_PAYMENT = {
  payMode: "",
  upiId: "",
  bankAcc: "",
  ifsc: ""
};

const INITIAL_SETTINGS = {
  gstOn: true,
  tt: "intra",
  copyType: COPY_TYPES[0],
  rcm: "No",
  ewayBill: "",
  priceMode: "exclusive", // 'inclusive' = rates already contain GST
  composition: false,     // composition dealer → "Bill of Supply"
  paymentStatus: null     // 'Paid' | 'Pending'; null = automatic from the payment mode
};

// Counter payments are usually received on the spot; bank/cheque are collected later.
const defaultPayStatus = (payMode) => (['Bank Transfer', 'Cheque'].includes(payMode) ? 'Pending' : 'Paid');

// Local dates (not UTC), computed fresh each time a bill starts.
const getDates = () => {
  const t = new Date();
  const d = new Date(t);
  d.setDate(d.getDate() + 7);
  return { invoiceDate: localDateStr(t), dueDate: localDateStr(d) };
};

const INITIAL_INVOICE_NO = ""; // header shows "Auto" until the real next number loads

const INITIAL_META = {
  invoiceNo: INITIAL_INVOICE_NO,
  terms: "",
  notes: "Thank you for shopping with us!"
};

// Only real shop fields from a template (never terms/payment keys).
const pickShop = (p) => Object.fromEntries(
  Object.keys(INITIAL_SHOP).filter(k => p[k] !== undefined).map(k => [k, p[k]])
);

const DRAFT_CAP = 8; // enforced by the enforce_draft_cap() trigger

const INITIAL_ITEM = { id: Date.now(), name: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0, disc: 0, gp: '18' };

const PREF_COPY_TYPE = { original: COPY_TYPES[0], duplicate: COPY_TYPES[1], triplicate: COPY_TYPES[2] };

// Older onboarding saved lowercase payment modes.
const normalizePayMode = (mode) => ({ cash: 'Cash', upi: 'UPI', bank: 'Bank Transfer' }[mode] || mode || '');

const isValidState = (s) => STATES.some(x => x.n === s);

const normalizeSettings = (s) => ({ ...INITIAL_SETTINGS, ...s, copyType: normalizeCopyType(s?.copyType) });

const toNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Drops completely empty rows and coerces numeric fields so the server never
// receives blank strings. Returns the 1-based row number of the first row that
// has a value but no item name (the server rejects those).
const prepareItems = (items) => {
  const kept = [];
  let missingNameRow = null;
  let zeroQtyRow = null;
  items.forEach((it, idx) => {
    const name = String(it.name || '').trim();
    const hasValue = toNum(it.rate) > 0;
    if (!name && !hasValue) return;
    if (!name && missingNameRow === null) missingNameRow = idx + 1;
    if (name && toNum(it.qty) <= 0 && zeroQtyRow === null) zeroQtyRow = idx + 1;
    kept.push({
      ...it,
      name,
      qty: toNum(it.qty),
      rate: toNum(it.rate),
      disc: Math.min(100, toNum(it.disc)),
      gp: String(toNum(it.gp)),
    });
  });
  return { items: kept, missingNameRow, zeroQtyRow };
};

export const NewBill = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isBillingDirty, setBillingDirty, pendingNavPath, setPendingNavPath } = useUIStore();
  const queryClient = useQueryClient();
  const [shop, setShop] = useState(INITIAL_SHOP);
  const [customer, setCustomer] = useState(INITIAL_CUSTOMER);
  const [payment, setPayment] = useState(INITIAL_PAYMENT);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [meta, setMeta] = useState(() => ({ ...INITIAL_META, ...getDates() }));
  const [items, setItems] = useState([{ ...INITIAL_ITEM, id: 1 }, { ...INITIAL_ITEM, id: 2 }, { ...INITIAL_ITEM, id: 3 }]);

  const [drafts, setDrafts] = useState([]);
  // Keep the sidebar drafts badge and the bell in sync with this page's list.
  const syncDrafts = (ds) => {
    setDrafts(ds);
    queryClient.setQueryData(ALERT_KEYS.drafts, ds);
  };

  const [editBillId, setEditBillId] = useState(null);
  const [billStatus, setBillStatus] = useState(null); // status of the saved bill being shown
  const [tplDialog, setTplDialog] = useState({ open: false, name: '', error: '', saving: false });
  const [showDirtyDialog, setShowDirtyDialog] = useState(false);

  // Generic confirmation state
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, data: null });
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // True once the form was populated from a bill/draft/template, so the
  // business-profile defaults never overwrite those values.
  const sourceLoadedRef = useRef(false);
  // Business-profile defaults, re-applied when starting a new invoice.
  const profileDefaultsRef = useRef({ settings: INITIAL_SETTINGS, payMode: 'Cash', terms: DEFAULT_TERMS });
  // GST Settings → "HSN Code Behavior". 'mandatory' blocks printing GST bills
  // with items that have no HSN/SAC code.
  const hsnBehaviorRef = useRef('optional');
  // True only while the screen exactly matches the saved bill (just saved, or
  // just loaded from Bill History). Then a re-print needs no new save.
  // NOT the same as "not dirty": a restored draft is clean but unsaved.
  const savedCleanRef = useRef(false);
  // Settings from a loaded template, applied on top of the profile defaults.
  const templateSettingsRef = useRef(null);
  // User picked the tax type by hand → a state change must not override it.
  const ttManualRef = useRef(false);
  // The ONE draft of the bill on screen (restored or saved from here). Saving again updates
  // it instead of adding another; it is deleted once the bill is printed.
  const draftIdRef = useRef(null);
  const [activeDraftId, setActiveDraftId] = useState(null);
  const setDraftId = (id) => { draftIdRef.current = id; setActiveDraftId(id); };
  // Editing an issued invoice: ask once before the first save overwrites it.
  const editConfirmedRef = useRef(false);
  // Increases when the user adds a row -> items table focuses and scrolls to it.
  const [addTick, setAddTick] = useState(0);
  // After a successful print: "INV-0015 saved" bar with New bill / Reprint / Bill History.
  const [printedInfo, setPrintedInfo] = useState(null);
  // Suggestions for customer / payment / HSN fields from earlier bills.
  const businessId = useAuthStore((st) => st.user?.businessId);
  const [suggestions, setSuggestions] = useState(() => buildSuggestions(businessId, []));
  const refreshSuggestions = () => {
    billService.listBills()
      .then((bills) => setSuggestions(buildSuggestions(businessId, bills)))
      .catch(() => setSuggestions(buildSuggestions(businessId, [])));
  };
  const remember = (extra = {}) => {
    rememberBill(businessId, { customer, payment, items, ...extra });
    refreshSuggestions();
  };
  // Bottom quick bar (Add item, shortcuts, total): hidden by default, opened by the user,
  // hides itself after a few idle seconds (stays open while the mouse/keyboard is on it).
  const QUICK_BAR_IDLE_MS = 5000;
  const [quickBarOpen, setQuickBarOpen] = useState(false);
  const [quickBarHold, setQuickBarHold] = useState(false);
  useEffect(() => {
    if (!quickBarOpen || quickBarHold) return undefined;
    const t = setTimeout(() => setQuickBarOpen(false), QUICK_BAR_IDLE_MS);
    return () => clearTimeout(t);
  }, [quickBarOpen, quickBarHold, addTick]);
  const [deleteDraftId, setDeleteDraftId] = useState(null);

  const isCancelled = billStatus === 'Cancelled';
  const payStatus = settings.paymentStatus || defaultPayStatus(payment.payMode);

  // Derived calculations
  const { processedItems, totals } = recalc(items, settings.gstOn, settings.tt, settings.priceMode);

  // Dirty state is set by real user edits only (see markDirty below).
  const markDirty = () => {
    savedCleanRef.current = false;
    setPrintedInfo(null);
    setBillingDirty(true);
  };

  // Browser Back/Forward and any other in-app link while there are unsaved
  // changes → same "Unsaved Changes" dialog. Reads the store directly so a
  // navigation right after setBillingDirty(false) is never blocked.
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    useUIStore.getState().isBillingDirty && currentLocation.pathname !== nextLocation.pathname
  );
  useEffect(() => {
    if (blocker.state === 'blocked') setShowDirtyDialog(true);
  }, [blocker.state]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isBillingDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBillingDirty]);

  // Handle external navigation attempt
  useEffect(() => {
    if (pendingNavPath) {
      setShowDirtyDialog(true);
    }
  }, [pendingNavPath]);

  // One-time loads when the page opens: drafts list, business defaults, next invoice number.
  useEffect(() => {
    billService.getDrafts().then(setDrafts).catch(() => {}); // strip just won't show
    // Suggestions from earlier bills (customers, phone, GSTIN, UPI, bank, HSN).
    const bid = useAuthStore.getState().user?.businessId;
    billService.listBills()
      .then((bills) => setSuggestions(buildSuggestions(bid, bills)))
      .catch(() => {});

    // Load shop profile and apply the business's billing defaults
    shopService.getProfile().then(p => {
      const profileState = isValidState(p.shopState) ? p.shopState : FALLBACK_STATE;
      const taxType = p.defaultTaxType;
      const defaults = {
        settings: {
          ...INITIAL_SETTINGS,
          gstOn: taxType !== 'none' && taxType !== 'composition',
          priceMode: taxType === 'inclusive' ? 'inclusive' : 'exclusive',
          composition: taxType === 'composition',
          copyType: PREF_COPY_TYPE[p.defaultCopyType] || COPY_TYPES[0],
        },
        payMode: normalizePayMode(p.payMode) || 'Cash',
        terms: p.defaultTerms || DEFAULT_TERMS,
      };
      profileDefaultsRef.current = defaults;
      hsnBehaviorRef.current = p.defaultHsnBehavior || 'optional';

      // Blank shop/payment fields are always filled from the profile.
      setShop(prev => ({
        shopName: prev.shopName || p.shopName || '',
        tagline: prev.tagline || p.tagline || '',
        shopAddress: prev.shopAddress || p.shopAddress || '',
        shopPhone: prev.shopPhone || p.shopPhone || '',
        shopEmail: prev.shopEmail || p.shopEmail || '',
        shopGstin: prev.shopGstin || p.shopGstin || '',
        shopState: prev.shopState || profileState
      }));
      setPayment(prev => ({
        ...prev,
        payMode: prev.payMode || defaults.payMode,
        upiId: prev.upiId || p.upiId || '',
        bankAcc: prev.bankAcc || p.bankAcc || '',
        ifsc: prev.ifsc || p.ifsc || ''
      }));

      // Settings & terms defaults only for a genuinely new invoice.
      if (!sourceLoadedRef.current) {
        setMeta(prev => ({ ...prev, terms: prev.terms || defaults.terms }));
        setSettings(s => normalizeSettings({
          ...defaults.settings, tt: autoTax(profileState, ''), rcm: s.rcm, ewayBill: s.ewayBill,
          ...(templateSettingsRef.current || {}),
        }));
      }
    }).catch(() => {
      // Profile failing: form still works with sensible fallbacks
      setShop(prev => ({ ...prev, shopState: prev.shopState || FALLBACK_STATE }));
      setPayment(prev => ({ ...prev, payMode: prev.payMode || 'Cash' }));
      setMeta(prev => ({ ...prev, terms: prev.terms || DEFAULT_TERMS }));
    });

    settingsService.getInvoicePreferences().then(pref => {
      if (pref.invoiceSequence) {
        setMeta(prev => ({ ...prev, invoiceNo: prev.invoiceNo === INITIAL_INVOICE_NO ? pref.invoiceSequence : prev.invoiceNo }));
      }
    }).catch(() => {}); // preferences failing: default invoice number used instead

    // Cleanup dirty state on absolute unmount
    return () => {
      useUIStore.getState().reset();
    };
  }, []);

  // A bill / draft / template opened from another page (Bill History, Drafts, Templates).
  // The request is cleared right away so it runs once.
  const navState = location.state;
  useEffect(() => {
    const { loadBillId, restoreDraftId, loadTemplateId } = navState || {};
    if (!loadBillId && !restoreDraftId && !loadTemplateId) return;
    navigate(location.pathname, { replace: true, state: {} });

    if (loadBillId) {
      billService.getBill(loadBillId).then(bill => {
        if (!bill) { toast.error('Could not load bill. Please try again.'); return; }
        sourceLoadedRef.current = true;
        savedCleanRef.current = true;
        ttManualRef.current = true;          // keep the bill's own tax type
        setDraftId(null);
        setEditBillId(bill.id);
        setBillStatus(bill.status);
        editConfirmedRef.current = false;
        if (bill.shop && Object.keys(bill.shop).length) setShop(prev => ({ ...prev, ...bill.shop }));
        if (bill.customer) setCustomer({ ...INITIAL_CUSTOMER, ...bill.customer });
        if (bill.payment) setPayment({ ...INITIAL_PAYMENT, ...bill.payment });
        setSettings(normalizeSettings({
          ...(bill.settings || {}),
          paymentStatus: bill.status === 'Paid' || bill.status === 'Pending' ? bill.status : bill.settings?.paymentStatus ?? null,
        }));
        if (bill.meta) setMeta({ ...INITIAL_META, ...bill.meta, dueDate: bill.meta.dueDate || getDates().dueDate, billName: bill.settings?.billName || '' });
        if (bill.items) setItems(bill.items);
        toast.success(bill.status === 'Cancelled' ? 'Cancelled bill opened (view only).' : 'Bill loaded for editing.');
      }).catch(() => toast.error('Could not load bill. Please try again.'));
    }

    if (restoreDraftId) {
      billService.getDrafts().then(ds => {
        setDrafts(ds);
        if (ds.some(d => d.id === restoreDraftId)) {
          setConfirmState({ isOpen: true, type: 'RESTORE_DRAFT', data: restoreDraftId });
        }
      }).catch(() => {});
    }

    if (loadTemplateId) {
      billService.getTemplates().then(tpls => {
        const t = tpls.find(x => x.id === loadTemplateId);
        if (!t) return;
        const p = t.profile || {};
        // Default (seeded) templates hold DEMO shop/bank details — never put
        // them on a real invoice. Only the user's own templates carry
        // their own shop and payment details.
        if (!t.seeded) {
          setShop(prev => ({ ...prev, ...pickShop(p) }));
          if (p.payMode) setPayment(prev => ({ ...prev, payMode: normalizePayMode(p.payMode), bankAcc: p.bankAcc || '', ifsc: p.ifsc || '', upiId: p.upiId || '' }));
        }
        templateSettingsRef.current = t.settings || {};
        if (t.settings) setSettings(prev => normalizeSettings({ ...prev, ...t.settings }));
        if (p.terms) setMeta(prev => ({ ...prev, terms: p.terms }));
        toast.success('Template loaded.');
      }).catch(() => toast.error('Could not load template. Please try again.'));
    }
  }, [navState, location.pathname, navigate, toast]);

  // Update print scaling classes on body
  useEffect(() => {
    const rc = items.length;
    document.body.classList.toggle("rows-md", rc > 9 && rc <= 14);
    document.body.classList.toggle("rows-lg", rc > 14);
    document.body.classList.toggle("gst-off", !settings.gstOn);
    document.body.classList.toggle("tax-intra", settings.tt === "intra");
    document.body.classList.toggle("tax-inter", settings.tt === "inter");
  }, [items.length, settings.gstOn, settings.tt]);

  // Handlers
  const handleShopChange = (key, value) => {
    markDirty();
    setShop(prev => ({ ...prev, [key]: value }));
    if (key === 'shopState' && !ttManualRef.current) {
      const newTt = autoTax(value, customer.custState);
      setSettings(s => ({ ...s, tt: newTt }));
    }
  };

  const handleCustomerChange = (key, value) => {
    markDirty();
    // Picked a known customer: fill their other details (only boxes that are still empty).
    if (key === 'custName') {
      const known = findCustomer(suggestions, value);
      if (known) {
        const fill = {};
        ['custAddress', 'custPhone', 'custGstin', 'custState'].forEach((k) => {
          if (!String(customer[k] || '').trim() && known[k]) fill[k] = known[k];
        });
        setCustomer(prev => ({ ...prev, custName: value, ...fill }));
        if (fill.custState && !ttManualRef.current) {
          setSettings(st => ({ ...st, tt: autoTax(shop.shopState, fill.custState) }));
        }
        return;
      }
    }
    // A valid customer GSTIN tells us their state (first two digits).
    let custState = key === 'custState' ? value : null;
    if (key === 'custGstin' && isValidGstin(value)) {
      const st = stateFromGstin(value);
      if (st && st !== customer.custState) custState = st;
    }
    setCustomer(prev => ({ ...prev, [key]: value, ...(custState !== null ? { custState } : {}) }));
    if (custState !== null && !ttManualRef.current) {
      setSettings(s => ({ ...s, tt: autoTax(shop.shopState, custState) }));
    }
  };

  const handlePaymentChange = (key, value) => {
    markDirty();
    setPayment(p => ({ ...p, [key]: value }));
  };

  const handleSettingsChange = (key, value) => {
    markDirty();
    if (key === 'tt') ttManualRef.current = true;
    setSettings(s => ({ ...s, [key]: value }));
  };

  const handleMetaChange = (key, value) => {
    markDirty();
    setMeta(m => ({ ...m, [key]: value }));
  };

  const commitTitle = () => {
    if (tempTitle !== (meta.billName || '')) markDirty();
    setMeta(m => ({ ...m, billName: tempTitle }));
    setIsEditingTitle(false);
  };

  const handleItemChange = (id, key, value) => {
    markDirty();
    setItems(prev => prev.map(item => item.id === id ? { ...item, [key]: value } : item));
  };

  const handleAddItem = () => {
    markDirty();
    setItems(prev => [...prev, { ...INITIAL_ITEM, id: Date.now() }]);
    setAddTick(t => t + 1);
  };

  const handleRemoveItem = (id) => {
    markDirty();
    setItems(prev => {
      if (prev.length === 1) return [{ ...INITIAL_ITEM, id: Date.now() }];
      return prev.filter(item => item.id !== id);
    });
  };

  // Due date only for unpaid bills; the bill name rides in settings (bills have no name column).
  const captureState = () => ({
    id: editBillId,
    shop, customer, payment, items,
    settings: { ...settings, paymentStatus: payStatus, billName: meta.billName || '' },
    meta: { ...meta, dueDate: payStatus === 'Pending' ? meta.dueDate : '' },
  });

  // Draft payloads must NOT carry an `id` key (it would clash with the draft
  // row's own id). The bill being edited, if any, is kept as `billId`.
  const captureDraft = (name) => ({
    billId: editBillId,
    shop, customer, payment, settings, items,
    meta: { ...meta, billName: name !== undefined ? name : meta.billName },
  });

  const defaultDraftName = () => `${meta.invoiceNo || 'Draft'} · ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  // The database keeps only the newest 8 drafts — warn before one is replaced.
  const hasOwnDraft = () => !!draftIdRef.current && drafts.some(d => d.id === draftIdRef.current);
  const draftCapReached = () => drafts.length >= DRAFT_CAP && !hasOwnDraft();
  const oldestDraftName = () => drafts[drafts.length - 1]?.draftName || 'oldest draft';

  const handleManualSaveDraft = async (capConfirmed = false) => {
    // Printed and unchanged: the bill itself is saved, a draft would only be a duplicate.
    if (editBillId && savedCleanRef.current) {
      toast.info('This bill is already saved. No draft needed.');
      return;
    }
    if (!capConfirmed && draftCapReached()) {
      setConfirmState({ isOpen: true, type: 'DRAFT_CAP', data: 'manual' });
      return;
    }
    // Force latest billName if it's currently being edited in tempTitle
    const currentName = isEditingTitle ? tempTitle : meta.billName;
    const draft = captureDraft(currentName);
    draft.draftName = currentName || defaultDraftName();

    try {
      const updating = hasOwnDraft();
      const { id, drafts: ds } = await billService.saveDraft(draft, draftIdRef.current);
      setDraftId(id);
      syncDrafts(ds);
      remember();
      setBillingDirty(false); // Clean state after explicit save
      toast.success(updating ? 'Draft updated.' : 'Saved to drafts.');
    } catch (err) {
      toast.error(`${err.message || 'Could not save draft. Please try again.'}`);
    }
  };

  const handleNewInvoiceClick = () => {
    // Nothing unsaved (empty form, just printed, or a draft that is still saved) → start fresh.
    if (!useUIStore.getState().isBillingDirty) {
      resetForm();
      toast.success('Started new invoice.');
      return;
    }
    setConfirmState({ isOpen: true, type: 'NEW_INVOICE' });
  };

  const resetForm = () => {
    editConfirmedRef.current = false;
    setPrintedInfo(null);
    const defaults = profileDefaultsRef.current;
    sourceLoadedRef.current = false;
    savedCleanRef.current = false;
    templateSettingsRef.current = null;
    ttManualRef.current = false;
    setDraftId(null);
    setEditBillId(null);
    setBillStatus(null);
    setItems([{ ...INITIAL_ITEM, id: 1 }, { ...INITIAL_ITEM, id: 2 }, { ...INITIAL_ITEM, id: 3 }]);
    setCustomer(INITIAL_CUSTOMER);
    setSettings({ ...defaults.settings, tt: autoTax(shop.shopState, '') });
    setPayment(p => ({ ...p, payMode: defaults.payMode }));
    setMeta(m => ({
      ...m,
      ...getDates(),
      terms: defaults.terms,
      notes: INITIAL_META.notes,
      billName: '',
      invoiceNo: INITIAL_INVOICE_NO
    }));
    settingsService.getInvoicePreferences().then(pref => {
      setMeta(m => ({ ...m, invoiceNo: pref.invoiceSequence || INITIAL_INVOICE_NO }));
    }).catch(() => {});
  };

  const handleDirtyAction = async (action, capConfirmed = false) => {
    if (action === 'draft' && !capConfirmed && draftCapReached()) {
      setConfirmState({ isOpen: true, type: 'DRAFT_CAP', data: 'dirty' });
      return;
    }
    if (action === 'draft') {
      const draft = captureDraft();
      draft.draftName = meta.billName || defaultDraftName();
      try {
        const updating = hasOwnDraft();
        const { drafts: ds } = await billService.saveDraft(draft, draftIdRef.current);
        syncDrafts(ds);
        toast.success(updating ? 'Draft updated.' : 'Saved to drafts.');
      } catch (err) {
        // Keep the user on the invoice so nothing is lost
        toast.error(`${err.message || 'Could not save draft. Please try again.'}`);
        return;
      }
    }

    setBillingDirty(false);
    setShowDirtyDialog(false);
    setConfirmState({ isOpen: false, type: null, data: null });

    // Clear data for safety before navigating away
    resetForm();

    // Back button / in-app link caught by useBlocker → continue that navigation.
    if (blocker.state === 'blocked') {
      blocker.proceed();
      return;
    }

    if (pendingNavPath) {
      if (pendingNavPath === '/logout') {
        // Bill is saved/discarded — now the normal "Log out?" confirm.
        useUIStore.getState().setLogoutConfirmOpen(true);
      } else if (pendingNavPath === '__BACK__') {
        navigate(-1);
      } else {
        navigate(pendingNavPath);
      }
      setPendingNavPath(null);
    } else {
      if (action === 'discard' || action === 'draft') {
        toast.success('Started new invoice.');
      }
    }
  };

  const handleRestoreDraftClick = (draftId) => {
    setConfirmState({ isOpen: true, type: 'RESTORE_DRAFT', data: draftId });
  };

  const handleRestoreDraftConfirm = () => {
    const draftId = confirmState.data;
    const d = drafts.find(x => x.id === draftId);
    if (!d) return;

    sourceLoadedRef.current = true;
    savedCleanRef.current = false; // a draft may differ from the saved bill
    ttManualRef.current = true;    // keep the draft's tax type
    setDraftId(d.id);
    setEditBillId(d.billId || null);
    setBillStatus(null);
    if (d.shop) setShop({ ...INITIAL_SHOP, ...d.shop });
    if (d.customer) setCustomer({ ...INITIAL_CUSTOMER, ...d.customer });
    if (d.payment) setPayment({ ...INITIAL_PAYMENT, ...d.payment });
    if (d.settings) setSettings(normalizeSettings(d.settings));
    if (d.meta) setMeta({ ...d.meta, billName: d.meta.billName || (d.draftName?.includes('·') ? '' : d.draftName) });
    if (d.items) setItems(d.items);
    setBillingDirty(false);
    setConfirmState({ isOpen: false, type: null, data: null });
    toast.success('Draft restored.');
  };

  const handleDeleteDraft = async (draftId) => {
    setDeleteDraftId(null);
    if (draftIdRef.current === draftId) setDraftId(null);
    try {
      const ds = await billService.deleteDraft(draftId);
      syncDrafts(ds);
      toast.success('Draft deleted.');
    } catch {
      toast.error('Failed to delete draft. Please try again.');
    }
  };

  // Validates line items; returns the cleaned list, or null (after showing a
  // toast) when the bill can't be saved as-is.
  const validateItems = () => {
    const { items: cleanItems, missingNameRow, zeroQtyRow } = prepareItems(items);
    if (missingNameRow) {
      toast.error(`Row ${missingNameRow} has a rate but no item name. Add a name or remove the row.`);
      return null;
    }
    if (zeroQtyRow) {
      toast.error(`Row ${zeroQtyRow} has quantity 0. Enter a quantity or remove the row.`);
      return null;
    }
    if (!meta.invoiceDate) {
      toast.error('Pick the invoice date.');
      return null;
    }
    if (payStatus === 'Pending' && meta.dueDate && meta.dueDate < meta.invoiceDate) {
      toast.error('Due date cannot be before the invoice date.');
      return null;
    }
    if ((settings.gstOn || settings.composition) && shop.shopGstin && !isValidGstin(shop.shopGstin)) {
      toast.error('Your GSTIN looks wrong. It must be 15 characters, like 09ABCDE1234F1Z5.');
      return null;
    }
    if (settings.gstOn && customer.custGstin && !isValidGstin(customer.custGstin)) {
      toast.error('Customer GSTIN looks wrong. Fix it or leave it empty.');
      return null;
    }
    if (cleanItems.length === 0) {
      toast.error('Add at least one item before printing.');
      return null;
    }
    if (settings.gstOn && hsnBehaviorRef.current === 'mandatory') {
      const missingHsn = cleanItems.find(it => !String(it.hsn || '').trim());
      if (missingHsn) {
        toast.error(`"${missingHsn.name}" needs an HSN/SAC code (required in GST Settings).`);
        return null;
      }
    }
    return cleanItems;
  };

  // Saves the bill (new → finalize_bill, already saved → update_bill_details),
  // renders the authoritative invoice number, then prints.
  // asNew: save as a brand-new invoice (used when the bill being edited no
  // longer exists, e.g. an old draft of a removed bill).
  const finalizeAndPrint = async ({ asNew = false } = {}) => {
    const cleanItems = validateItems();
    if (!cleanItems) return;

    setIsFinalizing(true);
    try {
      const savedBill = await billService.saveBill({ ...captureState(), id: asNew ? null : editBillId, items: cleanItems });

      // flushSync: the printed page must show the saved invoice number and
      // cleaned rows — window.print() runs before a normal re-render would.
      flushSync(() => {
        setItems(cleanItems);
        setMeta(prev => ({ ...prev, invoiceNo: savedBill.meta.invoiceNo }));
        // Re-printing now updates this bill instead of creating a duplicate.
        setEditBillId(savedBill.id);
        setBillStatus(savedBill.status);
      });

      remember({ items: cleanItems });

      // Reset dirty state since it's finalized
      setBillingDirty(false);
      savedCleanRef.current = true;

      // Status the user chose (Paid / Pending). New bills get it from finalize_bill (0009);
      // edits, or a server without 0009, get it with one extra update.
      let finalStatus = savedBill.status;
      if (savedBill.status !== 'Cancelled' && savedBill.status !== payStatus) {
        try {
          const updated = await billService.updateBillStatus(savedBill.id, payStatus);
          finalStatus = updated.status;
          setBillStatus(updated.status);
        } catch {
          toast.error(`Bill saved, but it is still marked ${savedBill.status}. Change it in Bill History.`);
        }
      }

      // A restored draft is now a real bill — remove the draft.
      if (draftIdRef.current) {
        const draftId = draftIdRef.current;
        setDraftId(null);
        billService.deleteDraft(draftId).then(syncDrafts).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.bills });
      setPrintedInfo({ invoiceNo: savedBill.meta.invoiceNo, status: finalStatus, amount: savedBill.totals?.grand ?? totals.grand });

      window.print();
    } catch (err) {
      if (err.reason === 'BB_BILL_NOT_FOUND' && !asNew) {
        setEditBillId(null);
        setBillStatus(null);
        setConfirmState({ isOpen: true, type: 'SAVE_AS_NEW', data: null });
        return;
      }
      toast.error(`${err.message || 'Could not save the bill. Please try again.'}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handlePrintClick = async () => {
    if (isFinalizing) return;

    // Already saved and unchanged, or cancelled (read-only) → just print again, no new save.
    if (editBillId && (savedCleanRef.current || isCancelled)) {
      window.print();
      return;
    }

    const cleanItems = validateItems();
    if (!cleanItems) return;

    if (editBillId && !editConfirmedRef.current) {
      setConfirmState({ isOpen: true, type: 'EDIT_ISSUED', data: null });
      return;
    }

    const hasItems = cleanItems.some(it => it.rate > 0);
    if (!hasItems) {
      setConfirmState({ isOpen: true, type: 'PRINT_ZERO', data: null });
      return;
    }
    if (cleanItems.length > 18) {
      setConfirmState({ isOpen: true, type: 'PRINT_PAGES', data: null });
      return;
    }

    await finalizeAndPrint();
  };

  const handlePrintConfirm = async () => {
    if (isFinalizing) return;
    setConfirmState({ isOpen: false, type: null, data: null });
    toast.info('Preparing to print...');
    await finalizeAndPrint();
  };

  // Saved from a popup on this page, so the bill in progress is never lost.
  const handleSaveAsTemplate = () => {
    setTplDialog({ open: true, name: '', error: '', saving: false });
  };

  const handleTemplateSave = async () => {
    const name = tplDialog.name.trim();
    if (!name) {
      setTplDialog(d => ({ ...d, error: 'Please enter a template name.' }));
      return;
    }
    setTplDialog(d => ({ ...d, error: '', saving: true }));
    try {
      await billService.saveTemplate({
        name,
        profile: { ...shop, terms: meta.terms, payMode: payment.payMode, bankAcc: payment.bankAcc, ifsc: payment.ifsc, upiId: payment.upiId },
        settings: { gstOn: settings.gstOn, tt: settings.tt, payMode: payment.payMode, priceMode: settings.priceMode, composition: settings.composition },
      });
      setTplDialog({ open: false, name: '', error: '', saving: false });
      toast.success('Template saved.');
    } catch (err) {
      setTplDialog(d => ({ ...d, saving: false }));
      toast.error(`${err.message || 'Failed to save template. Please try again.'}`);
    }
  };

  // Ctrl/Cmd+S = save draft, Ctrl/Cmd+P = save & print (our flow, not the browser's raw print).
  const anyDialogOpen = showDirtyDialog || confirmState.isOpen || !!confirmState.type || tplDialog.open || deleteDraftId !== null;
  const shortcutsRef = useRef(null);
  useEffect(() => {
    shortcutsRef.current = {
      save: () => { if (!anyDialogOpen && !isCancelled) handleManualSaveDraft(); },
      add: () => { if (!anyDialogOpen && !isCancelled) handleAddItem(); },
      newBill: () => { if (!anyDialogOpen) handleNewInvoiceClick(); },
      print: () => { if (!anyDialogOpen) handlePrintClick(); },
    };
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'n') { e.preventDefault(); shortcutsRef.current?.newBill(); return; }
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'enter') { e.preventDefault(); shortcutsRef.current?.add(); return; }
      if (k === 's') { e.preventDefault(); shortcutsRef.current?.save(); }
      if (k === 'p') { e.preventDefault(); shortcutsRef.current?.print(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Which kind of bill is on screen: an issued invoice (from Bill History), a draft, or a new bill.
  const activeDraft = drafts.find(d => d.id === activeDraftId) || null;
  const mode = editBillId ? 'issued' : activeDraft ? 'draft' : 'new';
  const draftSavedLabel = (() => {
    if (!activeDraft?.savedAt) return '';
    const d = new Date(activeDraft.savedAt);
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === new Date().toDateString() ? `today ${time}` : `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${time}`;
  })();
  const defaultTitle = mode === 'issued'
    ? `Edit bill · ${meta.invoiceNo}`
    : mode === 'draft'
      ? `Draft · ${activeDraft.draftName}`
      : (meta.invoiceNo ? `New bill · ${meta.invoiceNo}` : 'New bill');
  const CHIP = 'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11.5px] font-semibold';
  const modeChip = mode === 'issued'
    ? (isCancelled
      ? <span className={`${CHIP} bg-red-bg text-red`}>Cancelled invoice {meta.invoiceNo}</span>
      : <span className={`${CHIP} bg-navy/[.08] text-navy`}>Editing issued invoice {meta.invoiceNo}{billStatus ? ` · ${billStatus}` : ''}{activeDraft ? ` · draft saved ${draftSavedLabel}` : ''}</span>)
    : mode === 'draft'
      ? <span className={`${CHIP} bg-gold-bg text-gold`}>Draft · saved {draftSavedLabel}</span>
      : null;
  const printLabel = mode === 'issued' ? (isCancelled ? 'Reprint' : 'Update & print') : 'Print / Save PDF';

  const wmText = billStatus === 'Cancelled' ? "CANCELLED" : ({
    [COPY_TYPES[0]]: "ORIGINAL",
    [COPY_TYPES[1]]: "DUPLICATE",
    [COPY_TYPES[2]]: "TRIPLICATE"
  }[settings.copyType] || "ORIGINAL");

  return (
    <div className="relative">
      <div className="mx-auto" style={{ maxWidth: '960px' }}>
        <PageHeader
          title={isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                aria-label="Bill name"
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitTitle(); }}
                onBlur={commitTitle}
                className="text-[19px] md:text-[24px] font-bold text-navy-900 bg-transparent border-b-2 border-navy outline-none px-1 py-0.5 w-56 md:w-72"
              />
              <button
                type="button"
                onClick={commitTitle}
                aria-label="Save bill name"
                className="p-1.5 bg-navy text-white rounded-full hover:opacity-90 transition-opacity"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setTempTitle(meta.billName || meta.invoiceNo || 'New bill'); setIsEditingTitle(true); }}
              className="flex items-center gap-2 group text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              aria-label="Rename bill"
            >
              <h1 className="text-[19px] md:text-[24px] font-bold text-navy-900 leading-tight group-hover:text-navy transition-colors">
                {meta.billName || defaultTitle}
              </h1>
              <span className="p-1.5 rounded-full bg-row-alt text-ink3 group-hover:bg-navy/10 group-hover:text-navy transition-colors">
                <Edit2 size={14} />
              </span>
            </button>
          )}
          meta={modeChip}
          actions={
            <>
              <Button variant="ghost" onClick={handleSaveAsTemplate}>Save as template</Button>
              <Button variant="outline" onClick={() => handleManualSaveDraft()} disabled={isCancelled}>Save draft</Button>
              <Button variant="outline" onClick={handleNewInvoiceClick}>New invoice</Button>
              <Button variant="primary" onClick={handlePrintClick} isLoading={isFinalizing}>{printLabel}</Button>
            </>
          }
        />
      </div>

      {printedInfo && !isCancelled && (
        <div className="no-print max-w-[960px] mx-auto mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-green/30 bg-[#E7F3EC] px-4 py-2.5 animate-fade-in" role="status">
          <span className="flex items-center gap-2 text-[13.5px] text-ink min-w-[200px] flex-1">
            <CheckCircle2 size={18} className="text-green shrink-0" />
            <span><b>{printedInfo.invoiceNo} saved</b> · {printedInfo.status} · <b className="tabular-nums">{formatCurrency(printedInfo.amount)}</b></span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/billing/history')}>View in Bill History</Button>
            <Button variant="outline" onClick={() => window.print()}>Reprint</Button>
            <Button variant="navy" onClick={handleNewInvoiceClick} title="Alt+N">
              <Plus size={15} /> New bill <kbd className="ml-1 text-[10.5px] font-semibold opacity-75 font-sans">Alt+N</kbd>
            </Button>
          </div>
        </div>
      )}

      <DraftsStrip
        drafts={drafts}
        onRestore={handleRestoreDraftClick}
        onDelete={(id) => setDeleteDraftId(id)}
      />

      {isCancelled && (
        <div className="no-print max-w-[960px] mx-auto mt-3 flex flex-wrap items-center gap-3 rounded-[12px] border border-red/30 bg-red-bg px-4 py-2.5 text-[13px] text-red" role="status">
          <Ban size={16} className="shrink-0" />
          <span className="flex-1 min-w-[200px]"><b>This invoice is cancelled.</b> It can be viewed and reprinted, but not changed.</span>
          <Button variant="outline" onClick={handleNewInvoiceClick}>Start new invoice</Button>
        </div>
      )}

      <SettingsBar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        disabled={isCancelled}
      />

      <div className="paper" id="paper">
        <div className="wm">{wmText}</div>
        {/* A cancelled bill is view-only: inert blocks typing/clicks without changing how it looks or prints. */}
        <div inert={isCancelled || undefined}>
          <InvoiceHeader
            shop={shop}
            meta={meta}
            settings={settings}
            isSaved={!!editBillId}
            showDueDate={payStatus === 'Pending'}
            onShopChange={handleShopChange}
            onMetaChange={handleMetaChange}
          />

        <InfoGrid
          customer={customer}
          payment={payment}
          settings={settings}
          payStatus={payStatus}
          onPayStatusChange={(v) => handleSettingsChange('paymentStatus', v)}
          onCustomerChange={handleCustomerChange}
          onPaymentChange={handlePaymentChange}
          onSettingsChange={handleSettingsChange}
          suggestions={suggestions}
        />

        <PosBar
          settings={settings}
          shopState={shop.shopState}
          custState={customer.custState}
        />

        <ItemsTable
          items={processedItems}
          settings={settings}
          onItemChange={handleItemChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          focusTick={addTick}
          hsnSuggestions={suggestions.hsn}
        />

        <BillFoot
          totals={totals}
          settings={settings}
          meta={meta}
          onMetaChange={handleMetaChange}
        />

        <SignRow shopName={shop.shopName} />
        </div>
      </div>

      {/* Quick bar under the invoice (screen only, not sticky). Closed = a small button. */}
      {!isCancelled && (
        <div className="no-print max-w-[960px] mx-auto pt-2 pb-1 pointer-events-none">
          {quickBarOpen ? (
            <div
              onMouseEnter={() => setQuickBarHold(true)}
              onMouseLeave={() => setQuickBarHold(false)}
              onFocus={() => setQuickBarHold(true)}
              onBlur={() => setQuickBarHold(false)}
              className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 bg-paper/95 backdrop-blur border border-bb2 rounded-[12px] shadow-[0_-4px_16px_rgba(15,28,46,.08)] px-4 py-2.5 animate-fade-in"
            >
              <Button variant="outline" onClick={handleAddItem} className="font-semibold">
                <Plus size={16} /> Add item
              </Button>
              <span className="hidden md:inline text-[11.5px] text-ink3">
                <kbd className="font-sans font-semibold text-ink2">Ctrl+Enter</kbd> add item · <kbd className="font-sans font-semibold text-ink2">Enter</kbd> next row · <kbd className="font-sans font-semibold text-ink2">Ctrl+S</kbd> save draft · <kbd className="font-sans font-semibold text-ink2">Ctrl+P</kbd> print
              </span>
              <span className="ml-auto text-[12.5px] text-ink2 tabular-nums">
                {items.filter(it => String(it.name || '').trim()).length} items · Total <b className="text-[16px] text-navy-900">{formatCurrency(totals.grand)}</b>
              </span>
              <button
                type="button"
                onClick={() => { setQuickBarOpen(false); setQuickBarHold(false); }}
                aria-label="Hide quick bar"
                title="Hide"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink3 hover:text-ink hover:bg-row-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setQuickBarOpen(true)}
                aria-label="Show quick bar"
                title="Quick bar: add item, shortcuts and total"
                className="pointer-events-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-paper border border-bb2 shadow-[0_4px_14px_rgba(15,28,46,.12)] text-[12.5px] font-semibold text-navy hover:bg-row-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                <Zap size={14} /> Quick bar
              </button>
            </div>
          )}
        </div>
      )}

      <Dialog
        isOpen={showDirtyDialog}
        onClose={() => { setShowDirtyDialog(false); setPendingNavPath(null); if (blocker.state === 'blocked') blocker.reset(); }}
        title="Unsaved changes"
      >
        <p className="text-[13px] text-ink2 leading-relaxed">You have unsaved changes on this invoice. What would you like to do?</p>
        <div className="flex flex-wrap justify-end gap-2 mt-5">
          <Button variant="outline" onClick={() => { setShowDirtyDialog(false); setPendingNavPath(null); if (blocker.state === 'blocked') blocker.reset(); }}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDirtyAction('discard')}>Discard changes</Button>
          <Button variant="primary" onClick={() => handleDirtyAction('draft')}>Save to drafts</Button>
        </div>
      </Dialog>

      <Dialog
        isOpen={confirmState.type === 'NEW_INVOICE'}
        onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
        title="Start new invoice"
      >
        <p className="text-[13px] text-ink2 leading-relaxed">This invoice has unsaved changes. What would you like to do with it?</p>
        <div className="flex flex-wrap justify-end gap-2 mt-5">
          <Button variant="outline" onClick={() => setConfirmState({ isOpen: false, type: null, data: null })}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDirtyAction('discard')}>Discard current</Button>
          <Button variant="primary" onClick={() => handleDirtyAction('draft')}>Save to drafts</Button>
        </div>
      </Dialog>

      {confirmState.type === 'RESTORE_DRAFT' && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
          onConfirm={handleRestoreDraftConfirm}
          title="Restore Draft"
          message={`Restore draft "${drafts.find(d => d.id === confirmState.data)?.draftName}"? The current invoice will be replaced.`}
          confirmText="Yes, Restore"
        />
      )}

      {confirmState.type === 'PRINT_ZERO' && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
          onConfirm={handlePrintConfirm}
          title="Zero Value Items"
          message="All items have zero value. Print anyway?"
          confirmText="Print Anyway"
          isLoading={isFinalizing}
        />
      )}

      {confirmState.type === 'PRINT_PAGES' && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
          onConfirm={handlePrintConfirm}
          title="Large Invoice"
          message={`${prepareItems(items).items.length} items may span 2 pages on A4. Continue?`}
          confirmText="Continue to Print"
          isLoading={isFinalizing}
        />
      )}

      {confirmState.type === 'EDIT_ISSUED' && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
          onConfirm={() => {
            editConfirmedRef.current = true;
            setConfirmState({ isOpen: false, type: null, data: null });
            handlePrintClick();
          }}
          title="Update issued invoice?"
          message={`This will change invoice ${meta.invoiceNo}, which was already issued (same number, new details). If the customer already has the old copy, share the updated one. Continue?`}
          confirmText="Update & print"
        />
      )}

      {confirmState.type === 'SAVE_AS_NEW' && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
          onConfirm={() => { setConfirmState({ isOpen: false, type: null, data: null }); finalizeAndPrint({ asNew: true }); }}
          title="Invoice No Longer Exists"
          message="The invoice you were editing no longer exists. Save this as a new invoice with the next number?"
          confirmText="Save as New Invoice"
          isLoading={isFinalizing}
        />
      )}

      <Dialog
        isOpen={tplDialog.open}
        onClose={() => setTplDialog({ open: false, name: '', error: '', saving: false })}
        title="Save as template"
      >
        <p className="text-[13px] text-ink2 leading-relaxed mb-3">Save the business details, settings and terms from this bill to reuse later.</p>
        <label htmlFor="tpl-name" className="block text-[13px] font-bold text-navy mb-1.5">Template name</label>
        <input
          id="tpl-name"
          autoFocus
          type="text"
          maxLength="40"
          placeholder="e.g. My Pharmacy"
          value={tplDialog.name}
          onChange={(e) => setTplDialog(d => ({ ...d, name: e.target.value, error: '' }))}
          onKeyDown={(e) => { if (e.key === 'Enter') handleTemplateSave(); }}
          className={`w-full border rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white ${tplDialog.error ? 'border-red' : 'border-bb'}`}
        />
        {tplDialog.error && <p className="text-[12px] text-red mt-1.5" role="alert">{tplDialog.error}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={() => setTplDialog({ open: false, name: '', error: '', saving: false })}>Cancel</Button>
          <Button variant="primary" onClick={handleTemplateSave} isLoading={tplDialog.saving}>Save template</Button>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteDraftId !== null}
        onClose={() => setDeleteDraftId(null)}
        onConfirm={() => handleDeleteDraft(deleteDraftId)}
        title="Delete draft"
        message={`Delete draft "${drafts.find(d => d.id === deleteDraftId)?.draftName || ''}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {confirmState.type === 'DRAFT_CAP' && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
          onConfirm={() => {
            const from = confirmState.data;
            setConfirmState({ isOpen: false, type: null, data: null });
            if (from === 'dirty') handleDirtyAction('draft', true);
            else handleManualSaveDraft(true);
          }}
          title="Draft Limit Reached"
          message={`You already have ${DRAFT_CAP} drafts. The oldest draft "${oldestDraftName()}" will be replaced. Continue?`}
          confirmText="Save Draft"
        />
      )}
    </div>
  );
};

export default NewBill;
