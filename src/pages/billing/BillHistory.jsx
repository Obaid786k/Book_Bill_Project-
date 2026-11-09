import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ALERT_KEYS } from '../../hooks/useAlerts';
import { billService } from '../../services/billService';
import { formatCurrency } from '../../utils/gstCalc';
import { localDateStr } from '../../utils/date';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Dialog } from '../../components/common/Dialog';
import { useToast } from '../../components/feedback/Toast';
import { Clock, FileText, CheckCircle, AlertCircle, Edit2, XCircle } from 'lucide-react';

// Overdue is not stored: a Pending bill whose due date has passed.
const displayStatus = (bill) => (
  bill.status === 'Pending' && bill.meta.dueDate && bill.meta.dueDate < localDateStr() ? 'Overdue' : bill.status
);

export const BillHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const refreshAlerts = () => queryClient.invalidateQueries({ queryKey: ALERT_KEYS.bills });
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    billService.listBills().then(setBills)
      .catch(() => toast.error('Could not load bills. Please refresh the page.'));
  }, [toast]);

  const handleToggleStatus = async (row) => {
    const nextStatus = row.status === 'Paid' ? 'Pending' : 'Paid';
    const previous = bills;
    setBills(bills.map(b => b.id === row.id ? { ...b, status: nextStatus } : b)); // optimistic
    try {
      await billService.updateBillStatus(row.id, nextStatus);
      refreshAlerts();
      toast.success(`Invoice ${row.meta.invoiceNo} marked as ${nextStatus}.`);
    } catch {
      setBills(previous); // revert on failure
      toast.error('Failed to update status. Please try again.');
    }
  };

  const columns = [
    { header: "Invoice No", accessor: "meta.invoiceNo", sortable: true },
    { header: "Date", accessor: "meta.invoiceDate", sortable: true },
    { header: "Customer", accessor: "customer.custName", sortable: true },
    { 
      header: "Amount", 
      accessor: (row) => formatCurrency(row.totals.grand),
      sortable: false
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={displayStatus(row)} />,
      sortable: true
    }
  ];

  const actions = (row) => {
    const isCancelled = row.status === 'Cancelled';
    return (
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost" size="sm"
          onClick={() => { setSelectedBill(row); setActiveTab('details'); }}
        >
          View
        </Button>
        {!isCancelled && (
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row)}>
            <CheckCircle size={14} className="mr-1" /> {row.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => navigate('/billing/new', { state: { loadBillId: row.id } })}>
          <Edit2 size={14} className="mr-1" /> {isCancelled ? 'Open' : 'Edit'}
        </Button>
        {!isCancelled && (
          <Button variant="ghost" size="sm" className="text-red hover:text-red hover:bg-red-bg" title="Cancel invoice" onClick={() => setCancelId(row.id)}>
            <XCircle size={14} />
          </Button>
        )}
      </div>
    );
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    const previous = bills;
    setBills(bills.map(b => b.id === cancelId ? { ...b, status: 'Cancelled' } : b)); // optimistic
    setCancelId(null);
    try {
      await billService.cancelBill(cancelId);
      refreshAlerts();
      toast.success('Invoice cancelled.');
    } catch (err) {
      setBills(previous); // revert on failure
      toast.error(`${err.message || 'Failed to cancel invoice. Please try again.'}`);
    }
  };

  return (
    <div className="p-6">
      <PageHeader />

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
          title="Pending / Overdue"
          value={bills.filter(b => b.status === 'Pending').length}
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
                  <p className="text-[13px] text-ink">Total Amount: {formatCurrency(selectedBill.totals.grand)}</p>
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

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Invoice"
        message="Cancel this invoice? It stays in your history with a CANCELLED mark, its number is never reused, and it can't be edited again."
        confirmText="Yes, Cancel Invoice"
      />
    </div>
  );
};

export default BillHistory;
