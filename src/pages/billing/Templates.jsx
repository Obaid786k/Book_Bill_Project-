import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';
import { useToast } from '../../components/feedback/Toast';
import { billService } from '../../services/billService';
import { PlusCircle, LayoutTemplate } from 'lucide-react';

export const Templates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState([]);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  
  // State for saving new template
  const [tplName, setTplName] = useState('');
  const [nameError, setNameError] = useState('');
  const currentBillState = location.state?.currentBillState || null;

  useEffect(() => {
    billService.getTemplates().then(setTemplates);
  }, []);

  const handleLoad = (id) => {
    navigate('/billing/new', { state: { loadTemplateId: id } });
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTemplateId || isDeletingTemplate) return;
    setIsDeletingTemplate(true);
    try {
      const tpls = await billService.deleteTemplate(deleteTemplateId);
      setTemplates(tpls);
      setDeleteTemplateId(null);
      toast('✅ Template deleted.');
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  const handleSaveCurrentBill = async () => {
    if (!currentBillState || isSavingTemplate) return;
    if (!tplName.trim()) {
      setNameError('Please enter a template name.');
      return;
    }
    setNameError('');
    
    const { shop, meta, payment, settings } = currentBillState;
    const tpl = {
      name: tplName.trim(),
      profile: { ...shop, terms: meta.terms, payMode: payment.payMode, bankAcc: payment.bankAcc, ifsc: payment.ifsc, upiId: payment.upiId },
      settings: { gstOn: settings.gstOn, tt: settings.tt, payMode: payment.payMode }
    };
    
    setIsSavingTemplate(true);
    try {
      const tpls = await billService.saveTemplate(tpl);
      setTemplates(tpls);
      setTplName('');
      toast('✅ Template saved successfully.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const seeded = templates.filter(t => t.seeded);
  const user = templates.filter(t => !t.seeded);

  const renderCard = (t) => {
    const dt = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "";
    return (
      <div key={t.id} className="bg-paper border border-bb rounded-lg p-5 flex items-start gap-4 transition-all hover:border-navy hover:shadow-md">
        <div className="flex-shrink-0 text-2xl bg-row-alt p-3 rounded-md">
          {t.icon || "📄"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink text-[15px]">{t.name}</h3>
          <p className="text-[12.5px] text-ink2 mt-1 truncate">
            {t.profile?.shopName || "No Shop Name"}{dt ? " · " + dt : ""}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleLoad(t.id)}>
            Load Template
          </Button>
          {!t.seeded && (
            <Button variant="danger" size="sm" onClick={() => setDeleteTemplateId(t.id)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Template Manager</h1>
          <p className="text-sm text-ink2 mt-1">Manage, create, and load billing templates.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/billing/new')}>
          Back to New Bill
        </Button>
      </div>

      {currentBillState && (
        <div className="bg-navy-lt/10 border border-navy/20 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h2 className="text-[15px] font-bold text-navy flex items-center gap-2 mb-1">
              <PlusCircle size={18} /> Save Current Bill as Template
            </h2>
            <p className="text-[13px] text-ink2">
              Save the business profile, settings, and terms from your current session for future reuse.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto flex gap-2">
            <div className="flex flex-col gap-1 w-full md:w-64">
              <input 
                type="text" 
                className={`w-full border rounded-md px-3 py-2 text-[13.5px] font-body outline-none focus:border-navy transition-colors ${nameError ? 'border-red' : 'border-bb'}`}
                placeholder="e.g. My Pharmacy" 
                maxLength="40"
                value={tplName}
                onChange={(e) => { setTplName(e.target.value); if (nameError) setNameError(''); }}
              />
              {nameError && <p className="text-[11px] text-red font-medium">{nameError}</p>}
            </div>
            <Button variant="primary" onClick={handleSaveCurrentBill} isLoading={isSavingTemplate}>
              Save
            </Button>
          </div>
        </div>
      )}

      {!templates.length && (
        <div className="text-center p-12 bg-paper border border-bb rounded-xl text-ink2">
          <LayoutTemplate size={48} className="mx-auto mb-4 opacity-50 text-navy" />
          <h3 className="text-lg font-bold text-ink mb-1">No templates found</h3>
          <p className="text-sm">You haven't created any templates yet.</p>
        </div>
      )}

      {seeded.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[1px] text-ink3 mb-4">Default Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seeded.map(renderCard)}
          </div>
        </div>
      )}

      {user.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[1px] text-ink3 mb-4">My Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.map(renderCard)}
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteTemplateId !== null}
        onClose={() => setDeleteTemplateId(null)}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to remove this template permanently?"
        isDeleting={isDeletingTemplate}
      />
    </div>
  );
};

export default Templates;
