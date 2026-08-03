import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { Plus, PackagePlus, History, Edit3 } from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <Button variant="primary" onClick={() => navigate('/billing/new')}>
        <Plus size={16} /> New Bill
      </Button>
      <Button variant="secondary" onClick={() => navigate('/products')}>
        <PackagePlus size={16} /> Add Product
      </Button>
      <Button variant="outline" onClick={() => navigate('/billing/history')}>
        <History size={16} /> View History
      </Button>
      <Button variant="ghost" onClick={() => navigate('/billing/drafts')}>
        <Edit3 size={16} /> Continue Draft
      </Button>
    </div>
  );
};
