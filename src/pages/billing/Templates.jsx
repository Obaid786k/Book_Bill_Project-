import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';
import { useToast } from '../../components/feedback/Toast';
import { billService } from '../../services/billService';
import { LayoutTemplate } from 'lucide-react';

// New templates are saved from New Bill → "Save as Template" (popup there).
export const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);

  useEffect(() => {
    billService.getTemplates().then(setTemplates)
      .catch(() => toast.error('Could not load templates. Please refresh the page.'));
  }, [toast]);

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
      toast.success('Template deleted.');
    } catch {
      toast.error('Failed to delete template. Please try again.');
    } finally {
      setIsDeletingTemplate(false);
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
      <PageHeader actions={<Button variant="outline" onClick={() => navigate('/billing/new')}>
          Back to New Bill
        </Button>} />

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
