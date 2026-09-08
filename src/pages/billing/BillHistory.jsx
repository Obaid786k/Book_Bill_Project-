import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../services/billService';
import { formatCurrency, recalc } from '../../utils/gstCalc';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';
import { Dialog } from '../../components/common/Dialog';
import { useToast } from '../../components/feedback/Toast';
import { Clock, FileText, CheckCircle, AlertCircle, Edit2, Trash2 } from 'lucide-react';

export const BillHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    billService.listBills().then(setBills);
  }, []);

  const columns = [
    { header: "Invoice No", accessor: "meta.invoiceNo", sortable: true },
    { header: "Date", accessor: "meta.invoiceDate", sortable: true },
    { header: "Customer", accessor: "customer.custName", sortable: true },
    { 
      header: "Amount", 
      accessor: (row) => formatCurrency(recalc(row.items, row.settings?.gstOn, row.settings?.tt).totals.grand),
      sortable: false
    },
    { 
      header: "Status", 
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true
    }
  ];

  const actions = (row) => (
    <div className="flex gap-2 justify-end">
      <Button 
        variant="ghost" size="sm"
        onClick={() => { setSelectedBill(row); setActiveTab('details'); }}
      >
        View
      </Button>
      <Button variant="ghost" size="sm" onClick={() => navigate('/billing/new', { state: { loadBillId: row.id } })}>
        <Edit2 size={14} className="mr-1" /> Edit
      </Button>
      <Button variant="ghost" size="sm" className="text-red hover:text-red hover:bg-red-bg" onClick={() => setDeleteId(row.id)}>
        <Trash2 size={14} />
      </Button>
    </div>
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    const previous = bills;
    setBills(bills.filter(b => b.id !== deleteId)); // optimistic
    setDeleteId(null);
    try {
      await billService.deleteBill(deleteId);
      toast('✅ Bill deleted successfully.');
    } catch {
      setBills(previous); // revert on failure
      toast('❌ Failed to delete bill. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Bill History</h1>
          <p className="text-sm text-ink2 mt-1">View and manage all finalized bills.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Invoices" 
          value={bills.length} 
          icon={FileText} 
        />
        <StatCard 
          title="Paid Invoices" 
          value={bills.filter(b => b.status === 'Paid').length} 
          icon={CheckCircle} 
        />
        <StatCard 
          title="Unpaid/Pending" 
          value={bills.filter(b => b.status === 'Unpaid' || b.status === 'Pending').length} 
          icon={AlertCircle} 
        />
      </div>

      <div className="no-print">
        <DataTable 
          data={bills} 
          columns={columns} 
          actions={actions}
          emptyMessage="No bills generated yet."
        />
      </div>

      <Dialog
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        title={selectedBill ? `Invoice ${selectedBill.meta.invoiceNo}` : ''}
        className="max-w-2xl"
      >
        {selectedBill && (
          <>
            <div className="flex border-b border-bb2 -mx-5 px-5 mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-navy text-navy' : 'border-transparent text-ink2 hover:text-ink'}`}
              >
                Invoice Details
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-3 px-4 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-navy text-navy' : 'border-transparent text-ink2 hover:text-ink'}`}
              >
                Timeline <ComingSoonBadge />
              </button>
            </div>

            <div className="bg-bg rounded-[6px] p-4 min-h-[160px]">
              {activeTab === 'details' && (
                <div>
                  <h3 className="text-sm font-bold text-navy mb-2">Customer</h3>
                  <p className="text-[13px] text-ink mb-6">{selectedBill.customer.custName}</p>
                  <h3 className="text-sm font-bold text-navy mb-2">Summary</h3>
                  <p className="text-[13px] text-ink">Total Amount: {formatCurrency(recalc(selectedBill.items, selectedBill.settings?.gstOn, selectedBill.settings?.tt).totals.grand)}</p>
                </div>
              )}
              {activeTab === 'timeline' && (
                <ComingSoonPanel
                  icon={Clock}
                  title="Invoice Timeline"
                  description="Soon you will be able to track every edit, payment, and status change applied to this invoice."
                />
              )}
            </div>
          </>
        )}
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        itemName="this invoice"
      />
    </div>
  );
};

export default BillHistory;
