import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../services/billService';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';
import { useToast } from '../../components/feedback/Toast';

export const DraftManager = () => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const loadDrafts = () => {
    billService.getDrafts().then(setDrafts);
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = (idx) => {
    setDeleteId(idx);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    await billService.deleteDraft(deleteId);
    setDeleteId(null);
    loadDrafts();
    toast('✅ Draft deleted.');
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

  const actions = (row, idx) => (
    <div className="flex gap-2 justify-end">
      <Button 
        variant="ghost" size="sm"
        onClick={() => navigate('/billing/new')}
      >
        Continue
      </Button>
      <Button 
        variant="ghost-danger" size="sm"
        onClick={() => handleDelete(idx)}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Drafts</h1>
          <p className="text-sm text-ink2 mt-1">Manage unfinished bills.</p>
        </div>
      </div>

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
      />
    </div>
  );
};

export default DraftManager;
