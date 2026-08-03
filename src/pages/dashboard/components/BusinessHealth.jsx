import React from 'react';
import { StatCard } from '../../../components/common/StatCard';
import { Card } from '../../../components/common/Card';
import { Link } from 'react-router-dom';
import { TrendingUp, FileText, Clock, AlertCircle } from 'lucide-react';

export const BusinessHealth = ({ data }) => {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      {data.alerts && data.alerts.length > 0 && (
        <Link to="/billing/history" className="block">
          <Card className="bg-white border-l-4 border-l-red border-y-bb border-r-bb border-y border-r p-3.5 flex items-center justify-between hover:shadow-md transition-all group overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-red-bg flex items-center justify-center text-red shrink-0">
                <AlertCircle size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-navy">Attention Needed</span>
                <span className="text-[13px] text-ink2 mt-0.5">{data.alerts[0].message}</span>
              </div>
            </div>
            <span className="text-[12px] font-semibold text-red opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
              View Details &rarr;
            </span>
          </Card>
        </Link>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/insights/revenue" className="block transition-transform hover:-translate-y-1">
          <StatCard 
            title="Today's Revenue" 
            value={`₹${data.todayRevenue.toLocaleString()}`} 
            icon={TrendingUp} 
            trend={{ isPositive: true, value: '+12% from yesterday' }}
            className="h-full hover:border-navy-lt/30 transition-colors cursor-pointer"
          />
        </Link>
        <Link to="/insights/bills" className="block transition-transform hover:-translate-y-1">
          <StatCard 
            title="Bills Today" 
            value={data.billsToday} 
            icon={FileText} 
            className="h-full hover:border-navy-lt/30 transition-colors cursor-pointer"
          />
        </Link>
        <Link to="/insights/payments" className="block transition-transform hover:-translate-y-1">
          <StatCard 
            title="Pending Payments" 
            value={`₹${data.pendingPayments.toLocaleString()}`} 
            icon={Clock} 
            trend={{ isPositive: false, value: 'Action required' }}
            className="h-full hover:border-navy-lt/30 transition-colors cursor-pointer"
          />
        </Link>
        <Link to="/insights/payments" className="block transition-transform hover:-translate-y-1">
          <StatCard 
            title="Outstanding Amount" 
            value={`₹${data.outstandingAmount.toLocaleString()}`} 
            icon={AlertCircle} 
            className="h-full hover:border-navy-lt/30 transition-colors cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
};
