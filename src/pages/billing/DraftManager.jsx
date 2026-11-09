import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ALERT_KEYS } from '../../hooks/useAlerts';
import { billService } from '../../services/billService';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';
import { useToast } from '../../components/feedback/Toast';

export const DraftManager = () => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const loadDrafts = () => {
    billService.getDrafts().then((ds) => {
      setDrafts(ds);
      queryClient.setQueryData(ALERT_KEYS.drafts, ds); // sidebar badge + bell
    })
      .catch(() => toast.error('Could not load drafts. Please refresh the page.'));
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId === null || isDeleting) return;
    setIsDeleting(true);
    try {
      await billService.deleteDraft(deleteId);
      setDeleteId(null);
      loadDrafts();
      toast.success('Draft deleted.');
    } catch {
      toast.error('Failed to delete draft. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: "Draft Name", accessor: "draftName", sortable: true },
    { 
      header: "Saved At", 
      accessor: (row) => new Date(row.savedAt).toLocaleString('en-IN'), 
      sortable: true 
    },
    { header: "Items Count", accessor: (row) => row.items?.length || 0, sortable: true }
  ];

  const actions = (row) => (
    <div className="flex gap-2 justify-end">
      <Button 
        variant="ghost" size="sm"
        onClick={() => navigate('/billing/new', { state: { restoreDraftId: row.id } })}
      >
        Continue
      </Button>
      <Button 
        variant="ghost-danger" size="sm"
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader />

      <DataTable 
        data={drafts} 
        columns={columns} 
        actions={actions}
        emptyMessage="No saved drafts."
      />

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DraftManager;
