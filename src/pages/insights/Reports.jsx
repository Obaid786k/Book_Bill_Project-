import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { FileText, Download, Plus, X, Sparkles } from 'lucide-react';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { useToast } from '../../components/feedback/Toast';

const REPORTS = [
  { id: 'rev', name: 'Comprehensive Revenue Report', desc: 'Detailed breakdown of gross revenue, profit margins, and discounts applied.' },
  { id: 'gst', name: 'GST Liability & Filing Report', desc: 'Ready-to-file tax report with CGST, SGST, IGST split and HSN summaries.' },
  { id: 'sales', name: 'Sales by Item (Itemized)', desc: 'Volume and revenue generated per product/service in the catalog.' },
  { id: 'pay', name: 'Outstanding Payments Ledger', desc: 'List of all clients with pending or partial payments and days overdue.' },
  { id: 'inv', name: 'Inventory Movement', desc: 'Slow moving and fast moving items list to aid procurement.' }
];

export const Reports = () => {
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const { toast } = useToast();

  // Real CSV export isn't built yet — say so honestly.
  const handleExport = () => {
    toast.info("CSV export is coming soon.");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader />

      <div className="flex flex-col gap-3">
        {/* Custom Report Placeholder */}
        <div 
          onClick={() => setShowCustomBuilder(true)}
          className="bg-navy/5 border border-navy/10 hover:border-navy-lt/30 transition-colors rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold-dk flex items-center justify-center shrink-0">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-navy group-hover:text-gold-dk transition-colors">
                Build Custom Report <ComingSoonBadge />
              </h3>
              <p className="text-[13px] text-ink2 mt-1 leading-relaxed">Design your own report by selecting specific metrics, dates, and filters.</p>
            </div>
          </div>
        </div>

        {REPORTS.map(report => (
          <div key={report.id} className="bg-white border border-bb hover:border-navy-lt/30 transition-colors rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-navy">{report.name}</h3>
                <p className="text-[13px] text-ink2 mt-1 leading-relaxed">{report.desc}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="shrink-0"
              onClick={handleExport}
            >
              <Download size={16} /> Export CSV <ComingSoonBadge />
            </Button>
          </div>
        ))}
      </div>

      {showCustomBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="bg-paper rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative h-80">
            <button onClick={() => setShowCustomBuilder(false)} className="absolute top-4 right-4 text-ink3 hover:text-ink z-10">
              <X size={20} />
            </button>
            <ComingSoonPanel 
              icon={Sparkles}
              title="Custom Report Builder"
              description="Soon you will be able to drag and drop metrics to build reports perfectly tailored to your business needs."
              onDismiss={() => setShowCustomBuilder(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
