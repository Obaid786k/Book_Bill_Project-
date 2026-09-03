import React from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

const mockTopSelling = [
  { name: 'Paracetamol 500mg', sales: 1200 },
  { name: 'Consultation Fee', sales: 850 },
  { name: 'Aashirvaad Atta', sales: 620 },
  { name: 'Amul Butter', sales: 490 }
];

const mockRevByCategory = [
  { name: 'Services', value: 45000 },
  { name: 'Digital Services', value: 35000 },
  { name: 'Pharmacy', value: 12000 },
  { name: 'Groceries', value: 8000 }
];

const COLORS = ['#0A2540', '#0047AB', '#0077C8', '#40E0D0'];

export const ProductAnalytics = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Product Analytics</h1>
        <p className="text-sm text-ink2 mt-1">Insights on your inventory and service performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value="12" subtitle="Active in catalog" trend="up" />
        <StatCard title="Active Categories" value="4" subtitle="Across all products" />
        <StatCard title="Average Price" value="₹2,242" subtitle="Across catalog" />
        <StatCard title="Highest Price" value="₹15,000" subtitle="Website Development" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Selling Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-navy">Top Selling Items</h3>
            <p className="text-[13px] text-ink3">By volume sold (last 30 days)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTopSelling} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#111827' }} width={120} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                <Bar dataKey="sales" fill="#0A2540" radius={[0, 4, 4, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-4 border-t border-bb2 flex items-start gap-3 text-green">
            <TrendingUp size={18} className="mt-0.5 shrink-0" />
            <p className="text-[13.5px] text-ink font-medium leading-relaxed">
              <strong>Paracetamol</strong> is your highest volume mover. Ensure you have enough stock before the weekend rush.
            </p>
          </div>
        </Card>

        {/* Revenue by Category */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-navy">Revenue by Category</h3>
            <p className="text-[13px] text-ink3">Gross revenue distribution</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockRevByCategory} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {mockRevByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-4 border-t border-bb2 flex items-start gap-3 text-gold">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p className="text-[13.5px] text-ink font-medium leading-relaxed">
              <strong>Services</strong> and <strong>Digital Services</strong> drive 80% of your revenue. Consider bundling products with services to increase average order value.
            </p>
          </div>
        </Card>

        {/* Least Selling Actionable Insight */}
        <Card className="p-6 md:col-span-2 bg-row-alt border-dashed">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-2">Slow-Moving Inventory Alert</h3>
              <p className="text-[14px] text-ink2 leading-relaxed mb-4">
                <strong>Tata Salt 1kg</strong> and <strong>Dettol Handwash</strong> have seen a 40% drop in sales this week.
              </p>
              <div className="bg-white border border-bb p-4 rounded-md">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-lt mb-1 block">Recommendation</span>
                <p className="text-sm text-ink">Consider applying a small discount on these items or moving them closer to the billing counter to clear stock faster.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductAnalytics;
