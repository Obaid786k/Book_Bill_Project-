import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { SettingsBar } from '../../modules/billing/components/SettingsBar';
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
import { useToast } from '../../components/feedback/Toast';
import { recalc, autoTax } from '../../utils/gstCalc';
import { Edit2, Check } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import '../../styles/invoice.css'; // Original CSS (Print locked)
import '../../styles/invoice-screen-comfort.css'; // Phase 15 Screen Comfort Overrides

const INITIAL_SHOP = {
  shopName: "",
  tagline: "",
  shopAddress: "",
  shopPhone: "",
  shopEmail: "",
  shopGstin: "",
  shopState: "Uttar Pradesh"
};

const INITIAL_CUSTOMER = {
  custName: "Ramesh Kumar",
  custAddress: "45, Civil Lines, Lucknow, UP - 226001",
  custPhone: "+91 91234 56789",
  custGstin: "",
  custState: "Uttar Pradesh"
};

const INITIAL_PAYMENT = {
  payMode: "Cash",
  upiId: "",
  bankAcc: "",
  ifsc: ""
};

const INITIAL_SETTINGS = {
  gstOn: true,
  tt: "intra",
  copyType: "Original for Recipient",
  rcm: "No",
  ewayBill: ""
};

const getDates = () => {
  const t = new Date();
  const d = new Date(t);
  d.setDate(d.getDate() + 7);
  const fmt = date => date.toISOString().split('T')[0];
  return { invoiceDate: fmt(t), dueDate: fmt(d) };
};

const INITIAL_META = {
  invoiceNo: "INV-0001",
  ...getDates(),
  terms: "1. Goods once sold will not be taken back or exchanged.\n2. Payment due within 7 days from invoice date.\n3. Subject to Lucknow jurisdiction only.",
  notes: "Thank you for shopping with us!"
};

const INITIAL_ITEM = { id: Date.now(), name: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0, disc: 0, gp: '18' };

export const NewBill = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { setBillingDirty, pendingNavPath, setPendingNavPath } = useUIStore();
  const { logout } = useAuthStore();
  const [shop, setShop] = useState(INITIAL_SHOP);
  const [customer, setCustomer] = useState(INITIAL_CUSTOMER);
  const [payment, setPayment] = useState(INITIAL_PAYMENT);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [meta, setMeta] = useState(INITIAL_META);
  const [items, setItems] = useState([{ ...INITIAL_ITEM, id: 1 }, { ...INITIAL_ITEM, id: 2 }, { ...INITIAL_ITEM, id: 3 }]);
  
  const [drafts, setDrafts] = useState([]);
  
  const [editBillId, setEditBillId] = useState(null);
  
  // Generic confirmation state
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, data: null });
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Derived calculations
  const { processedItems, totals } = recalc(items, settings.gstOn, settings.tt);

  // Dirty State Tracker
  useEffect(() => {
    const isDirty = items.length > 3 || 
                    items.some(i => i.name) || 
                    customer.custName !== INITIAL_CUSTOMER.custName || 
                    shop.shopName !== INITIAL_SHOP.shopName;
    setBillingDirty(isDirty);

    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items, customer.custName, shop.shopName, setBillingDirty]);

  // Handle external navigation attempt
  const [showDirtyDialog, setShowDirtyDialog] = useState(false);
  useEffect(() => {
    if (pendingNavPath) {
      setShowDirtyDialog(true);
    }
  }, [pendingNavPath]);

  // Load drafts/templates/bills on mount
  useEffect(() => {
    if (location.state?.loadBillId) {
      billService.getBill(location.state.loadBillId).then(bill => {
        if (bill) {
          setEditBillId(bill.id);
          if (bill.shop) setShop(bill.shop);
          if (bill.customer) setCustomer(bill.customer);
          if (bill.payment) setPayment(bill.payment);
          if (bill.settings) setSettings(bill.settings);
          if (bill.meta) setMeta({ ...bill.meta, billName: bill.meta.billName || '' });
          if (bill.items) setItems(bill.items);
          
          navigate(location.pathname, { replace: true, state: {} });
          toast('✅ Bill loaded for editing.');
        }
      });
    }

    billService.getDrafts().then(ds => {
      setDrafts(ds);

      // Arrived here from Drafts manager's "Continue" button
      if (location.state?.restoreDraftId && ds.some(d => d.id === location.state.restoreDraftId)) {
        setConfirmState({ isOpen: true, type: 'RESTORE_DRAFT', data: location.state.restoreDraftId });
        navigate(location.pathname, { replace: true, state: {} });
      }
    });
    billService.getTemplates().then(tpls => {
      if (location.state?.loadTemplateId) {
        const t = tpls.find(x => x.id === location.state.loadTemplateId);
        if (t) {
          const p = t.profile || {};
          setShop(prev => ({ ...prev, ...p }));
          if (p.payMode) setPayment(prev => ({ ...prev, payMode: p.payMode, bankAcc: p.bankAcc || '', ifsc: p.ifsc || '', upiId: p.upiId || '' }));
          if (t.settings) setSettings(prev => ({ ...prev, ...t.settings }));
          if (p.terms) setMeta(prev => ({ ...prev, terms: p.terms }));
          
          navigate(location.pathname, { replace: true, state: {} });
          toast('✅ Template loaded successfully.');
        }
      }
    });
    
    // Load shop profile
    shopService.getProfile().then(p => {
      setShop(prev => ({
        shopName: prev.shopName || p.shopName || '',
        tagline: prev.tagline || p.tagline || '',
        shopAddress: prev.shopAddress || p.shopAddress || '',
        shopPhone: prev.shopPhone || p.shopPhone || '',
        shopEmail: prev.shopEmail || p.shopEmail || '',
        shopGstin: prev.shopGstin || p.shopGstin || '',
        shopState: prev.shopState || p.shopState || 'Uttar Pradesh'
      }));
      setPayment(prev => ({
        ...prev,
        payMode: prev.payMode || p.payMode || 'Cash',
        upiId: prev.upiId || p.upiId || '',
        bankAcc: prev.bankAcc || p.bankAcc || '',
        ifsc: prev.ifsc || p.ifsc || ''
      }));
      if (p.defaultTerms) {
        setMeta(prev => ({ ...prev, terms: prev.terms || p.defaultTerms }));
      }
      if (p.defaultTaxType) {
        setSettings(s => ({ ...s, tt: s.tt || (p.defaultTaxType === 'exclusive' ? 'exclusive' : 'intra') }));
      }
    });

    settingsService.getInvoicePreferences().then(pref => {
      if (pref.invoiceSequence) {
        setMeta(prev => ({ ...prev, invoiceNo: prev.invoiceNo === 'INV-0001' ? pref.invoiceSequence : prev.invoiceNo }));
      }
    });

    // Cleanup dirty state on absolute unmount
    return () => {
      useUIStore.getState().reset();
    };
  }, [location.state, location.pathname, navigate, toast]);

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
    setShop(prev => ({ ...prev, [key]: value }));
    if (key === 'shopState') {
      const newTt = autoTax(value, customer.custState);
      setSettings(s => ({ ...s, tt: newTt }));
    }
  };

  const handleCustomerChange = (key, value) => {
    setCustomer(prev => ({ ...prev, [key]: value }));
    if (key === 'custState') {
      const newTt = autoTax(shop.shopState, value);
      setSettings(s => ({ ...s, tt: newTt }));
    }
  };

  const handleItemChange = (id, key, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [key]: value } : item));
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, { ...INITIAL_ITEM, id: Date.now() }]);
  };

  const handleRemoveItem = (id) => {
    setItems(prev => {
      if (prev.length === 1) return [{ ...INITIAL_ITEM, id: Date.now() }];
      return prev.filter(item => item.id !== id);
    });
  };

  const captureState = () => ({
    id: editBillId,
    shop, customer, payment, settings, meta, items
  });

  const handleManualSaveDraft = async () => {
    const draft = captureState();
    // Force latest billName if it's currently being edited in tempTitle
    const currentName = isEditingTitle ? tempTitle : meta.billName;
    draft.draftName = currentName || `${meta.invoiceNo || 'Draft'} · ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    draft.meta = { ...draft.meta, billName: currentName };
    
    await billService.saveDraft(draft);
    setDrafts(await billService.getDrafts());
    setBillingDirty(false); // Clean state after explicit save
    toast('✅ Saved to drafts successfully.');
  };

  const handleNewInvoiceClick = () => {
    setConfirmState({ isOpen: true, type: 'NEW_INVOICE' });
  };

  const resetForm = () => {
    setItems([{ ...INITIAL_ITEM, id: 1 }, { ...INITIAL_ITEM, id: 2 }, { ...INITIAL_ITEM, id: 3 }]);
    setCustomer(c => ({ ...c, custName: '', custAddress: '', custPhone: '', custGstin: '', custState: 'Uttar Pradesh' }));
    setSettings(INITIAL_SETTINGS);
    setPayment(p => ({ ...p, payMode: 'Cash' }));
    settingsService.getInvoicePreferences().then(pref => {
      setMeta(m => ({
        ...m,
        invoiceNo: pref.invoiceSequence || "INV-0001",
        ...getDates(),
        notes: '',
        billName: ''
      }));
    });
  };

  const handleDirtyAction = async (action) => {
    if (action === 'draft') {
      const draft = captureState();
      draft.draftName = meta.billName || `${meta.invoiceNo || 'Draft'} · ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      await billService.saveDraft(draft);
      setDrafts(await billService.getDrafts());
      toast('✅ Saved to drafts.');
    }
    
    setBillingDirty(false);
    setShowDirtyDialog(false);
    setConfirmState({ isOpen: false, type: null, data: null });
    
    // Clear data for safety before navigating away
    resetForm();

    if (pendingNavPath) {
      if (pendingNavPath === '/logout') {
        navigate('/');
        setTimeout(() => {
          logout();
        }, 50);
      } else {
        navigate(pendingNavPath);
      }
      setPendingNavPath(null);
    } else {
      if (action === 'discard' || action === 'draft') {
        toast('✅ Started new invoice.');
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
    
    if (d.shop) setShop(d.shop);
    if (d.customer) setCustomer(d.customer);
    if (d.payment) setPayment(d.payment);
    if (d.settings) setSettings(d.settings);
    if (d.meta) setMeta({ ...d.meta, billName: d.meta.billName || (d.draftName?.includes('·') ? '' : d.draftName) });
    if (d.items) setItems(d.items);
    setConfirmState({ isOpen: false, type: null, data: null });
    toast('✅ Draft restored successfully.');
  };

  const handleDeleteDraft = async (draftId) => {
    const ds = await billService.deleteDraft(draftId);
    setDrafts(ds);
    toast('✅ Draft deleted.');
  };

  const handlePrintClick = async () => {
    if (isFinalizing) return;

    const hasItems = items.some(it => parseFloat(it.rate) > 0);
    if (!hasItems) {
      setConfirmState({ isOpen: true, type: 'PRINT_ZERO', data: null });
      return;
    }
    if (items.length > 18) {
      setConfirmState({ isOpen: true, type: 'PRINT_PAGES', data: null });
      return;
    }

    setIsFinalizing(true);
    try {
      // Save to history — finalize_bill (called inside saveBill) generates
      // the invoice number and increments the sequence atomically, so
      // there's no separate increment call needed here anymore.
      const finalBill = captureState();
      const savedBill = await billService.saveBill(finalBill);
      setMeta(prev => ({ ...prev, invoiceNo: savedBill.meta.invoiceNo }));

      // Reset dirty state since it's finalized
      setBillingDirty(false);

      window.print();
    } finally {
      setIsFinalizing(false);
    }
  };

  const handlePrintConfirm = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    setConfirmState({ isOpen: false, type: null, data: null });
    
    toast('🖨️ Preparing to print...');
    
    try {
      // Save to history first to get the authoritative invoice number
      const finalBill = captureState();
      const savedBill = await billService.saveBill(finalBill);
      setMeta(prev => ({ ...prev, invoiceNo: savedBill.meta.invoiceNo }));

      // Reset dirty state since it's finalized
      setBillingDirty(false);

      // Print only after the real invoice number is fetched and state updated
      window.print();
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSaveAsTemplate = () => {
    navigate('/billing/templates', { state: { currentBillState: captureState() } });
  };

  const wmText = {
    "Original for Recipient": "ORIGINAL",
    "Duplicate for Supplier": "DUPLICATE",
    "Triplicate for Transporter": "TRIPLICATE"
  }[settings.copyType] || "ORIGINAL";

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 no-print mx-auto" style={{ maxWidth: '900px' }}>
        <div>
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setMeta(m => ({ ...m, billName: tempTitle })); setIsEditingTitle(false); } }}
                  onBlur={() => { setMeta(m => ({ ...m, billName: tempTitle })); setIsEditingTitle(false); }}
                  className="text-2xl font-display font-bold text-ink bg-transparent border-b-2 border-navy outline-none px-1 py-0.5 w-64"
                />
                <button 
                  onClick={() => { setMeta(m => ({ ...m, billName: tempTitle })); setIsEditingTitle(false); }} 
                  className="p-1.5 bg-navy text-white rounded-full hover:bg-navy-hover transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setTempTitle(meta.billName || meta.invoiceNo || 'New Bill'); setIsEditingTitle(true); }}>
                <h1 className="text-2xl font-display font-bold text-ink group-hover:text-navy transition-colors">
                  {meta.billName || (meta.invoiceNo ? `New Bill: ${meta.invoiceNo}` : 'New Bill')}
                </h1>
                <button className="p-1.5 rounded-full bg-row-alt text-ink3 group-hover:bg-navy/10 group-hover:text-navy transition-colors">
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-ink2 mt-1">Create, preview, and print invoices.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button variant="outline" onClick={handleSaveAsTemplate}>Save as Template</Button>
          <Button variant="outline" onClick={handleManualSaveDraft}>Save Draft</Button>
          <Button variant="outline" onClick={handleNewInvoiceClick}>New Invoice</Button>
          <Button variant="primary" onClick={handlePrintClick} isLoading={isFinalizing}>Print / Save PDF</Button>
        </div>
      </div>
      
      <DraftsStrip
        drafts={drafts}
        onRestore={handleRestoreDraftClick}
        onDelete={handleDeleteDraft}
      />

      <div className="no-print">
        <SettingsBar 
          settings={settings} 
          onSettingsChange={(k, v) => setSettings(s => ({ ...s, [k]: v }))} 
        />
      </div>
      
      <div className="paper" id="paper">
          <div className="wm">{wmText}</div>
          <InvoiceHeader 
            shop={shop} 
            meta={meta} 
            settings={settings} 
            onShopChange={handleShopChange}
            onMetaChange={(k, v) => setMeta(m => ({ ...m, [k]: v }))}
          />
        
        <InfoGrid 
          customer={customer} 
          payment={payment} 
          settings={settings} 
          onCustomerChange={handleCustomerChange}
          onPaymentChange={(k, v) => setPayment(p => ({ ...p, [k]: v }))}
          onSettingsChange={(k, v) => setSettings(s => ({ ...s, [k]: v }))}
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
        />
        
        <BillFoot 
          totals={totals} 
          settings={settings} 
          meta={meta} 
          onMetaChange={(k, v) => setMeta(m => ({ ...m, [k]: v }))} 
        />
        
        <SignRow shopName={shop.shopName} />
      </div>

      {showDirtyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-ink mb-2">Unsaved Changes</h3>
              <p className="text-[14.5px] text-ink2 leading-relaxed">
                You have unsaved changes on this invoice. What would you like to do?
              </p>
            </div>
            <div className="p-4 bg-row-alt flex justify-end gap-3 rounded-b-xl border-t border-bb">
              <Button variant="secondary" onClick={() => { setShowDirtyDialog(false); setPendingNavPath(null); }}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDirtyAction('discard')}>
                Discard Changes
              </Button>
              <Button variant="primary" onClick={() => handleDirtyAction('draft')}>
                Save to Drafts
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmState.type === 'NEW_INVOICE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-ink mb-2">Start New Invoice</h3>
              <p className="text-[14.5px] text-ink2 leading-relaxed">
                What would you like to do with the current invoice?
              </p>
            </div>
            <div className="p-4 bg-row-alt flex justify-end gap-3 rounded-b-xl border-t border-bb">
              <Button variant="secondary" onClick={() => setConfirmState({ isOpen: false, type: null, data: null })}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDirtyAction('discard')}>
                Discard Current
              </Button>
              <Button variant="primary" onClick={() => handleDirtyAction('draft')}>
                Save to Drafts
              </Button>
            </div>
          </div>
        </div>
      )}

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
          message={`${items.length} items may span 2 pages on A4. Continue?`}
          confirmText="Continue to Print"
          isLoading={isFinalizing}
        />
      )}
    </div>
  );
};

export default NewBill;
