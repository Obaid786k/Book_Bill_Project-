import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { Receipt, Package } from 'lucide-react';
import { clsx } from 'clsx';

export const RecentActivity = ({ data }) => {
  const navigate = useNavigate();

  if (!data) return null;

  const renderStatusBadge = (status) => {
    const statusStyles = {
      'Paid': 'bg-green/10 text-green',
      'Pending': 'bg-yellow-500/10 text-yellow-600',
      'Overdue': 'bg-red-bg text-red',
      'Draft': 'bg-bb2 text-ink2'
    };
    return (
      <span className={clsx("px-2 py-0.5 rounded text-[11px] font-bold", statusStyles[status] || statusStyles['Draft'])}>
        {status}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-navy-lt/30">
        <div className="p-4 border-b border-bb bg-paper flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-navy">Recent Bills</h3>
          <button onClick={() => navigate('/billing/history')} className="text-[12px] text-ink2 hover:text-navy font-semibold">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg text-[11px] text-ink3 font-bold uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBills.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-0">
                    <EmptyState 
                      icon={Receipt} 
                      title="No recent bills" 
                      description="You haven't generated any bills recently." 
                    />
                  </td>
                </tr>
              ) : (
                data.recentBills.map((bill, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => navigate('/billing/history')}
                    className="border-b border-bb hover:bg-row-alt transition-colors duration-150 text-[13px] cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{bill.id}</div>
                      <div className="text-[11.5px] text-ink2">{bill.customer} • {bill.date}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">₹{bill.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{renderStatusBadge(bill.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-navy-lt/30">
        <div className="p-4 border-b border-bb bg-paper flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-navy">Recent Products</h3>
          <button onClick={() => navigate('/products')} className="text-[12px] text-ink2 hover:text-navy font-semibold">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg text-[11px] text-ink3 font-bold uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.recentProducts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-0">
                    <EmptyState 
                      icon={Package} 
                      title="No recent products" 
                      description="You haven't added any products recently." 
                    />
                  </td>
                </tr>
              ) : (
                data.recentProducts.map((product, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => navigate('/products')}
                    className="border-b border-bb hover:bg-row-alt transition-colors duration-150 text-[13px] cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{product.name}</div>
                      <div className="text-[11.5px] text-ink2">{product.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink2">{product.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
