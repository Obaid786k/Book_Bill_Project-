import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ArrowRight, CheckCircle2, FileText, PieChart, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Dashboard from '../dashboard/Dashboard';

const mockDataMonthly = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 59000 },
  { name: 'Jun', revenue: 75000 },
];

const mockDataWeekly = [
  { name: 'W1', revenue: 12000 },
  { name: 'W2', revenue: 15000 },
  { name: 'W3', revenue: 14000 },
  { name: 'W4', revenue: 18000 },
];

const Home = () => {
  const [chartView, setChartView] = useState('monthly');
  const chartData = chartView === 'monthly' ? mockDataMonthly : mockDataWeekly;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-navy tracking-tight mb-6 leading-tight">
          Bill your next customer <br className="hidden md:block"/> in under a minute.
        </h1>
        <p className="text-lg text-ink2 mb-10 max-w-2xl mx-auto leading-relaxed">
          Auto tax calculation, saved products, and one-tap printing — everything set up so you spend less time billing and more time serving customers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button variant="primary" className="px-8 py-3 text-[14px]">
              Start for free
            </Button>
          </Link>
          <Link to="/billing/new">
            <Button variant="outline" className="px-8 py-3 text-[14px]">
              See a real invoice
            </Button>
          </Link>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="w-full bg-bg rounded-xl border border-bb2 shadow-2xl overflow-hidden relative flex flex-col">
            {/* Live Component Preview (Scaled down & read-only) */}
            <div className="w-full overflow-hidden bg-bg pointer-events-none select-none p-6 pb-12">
              <div style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                <Dashboard isPreview={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 bg-paper px-6 md:px-12 border-y border-bb2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy mb-4">Built for kiranas, pharmacies, and service professionals.</h2>
            <p className="text-ink2">Real tools for your daily counter, without the confusing menus.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 shadow-sm">
              <div className="w-12 h-12 bg-navy-lt/10 rounded-full flex items-center justify-center text-navy mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">Print-Ready GST Billing</h3>
              <p className="text-[13.5px] text-ink2 leading-relaxed">
                Generate perfect bills with auto-calculated taxes, HSN codes, and rounding. Save drafts, switch between Cash Memo and Tax Invoice, and print directly in A4 format.
              </p>
            </Card>
            
            <Card className="p-8 shadow-sm">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6">
                <PieChart size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">Automatic Business Insights</h3>
              <p className="text-[13.5px] text-ink2 leading-relaxed">
                Your billing data automatically generates visual charts for daily revenue, top-selling items, and outstanding collections—so you always know exactly where your business stands.
              </p>
            </Card>
            
            <Card className="p-8 shadow-sm">
              <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center text-green mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">Smart Product Catalog</h3>
              <p className="text-[13.5px] text-ink2 leading-relaxed">
                Add products once, bill them forever. Autocomplete items by name instantly to keep your checkout counter moving fast.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 md:px-12 bg-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy mb-4">Insights straight from your bills</h2>
            <p className="text-ink2">We automatically turn your daily invoices into clear reports.</p>
          </div>

          <Card className="p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold text-navy">Revenue Trend</h3>
                <p className="text-[13px] text-ink3">Gross revenue over time</p>
              </div>
              <div className="flex bg-row-alt p-1 rounded-md border border-bb2">
                <button 
                  onClick={() => setChartView('weekly')}
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${chartView === 'weekly' ? 'bg-white shadow-sm text-navy' : 'text-ink2 hover:text-navy'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setChartView('monthly')}
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${chartView === 'monthly' ? 'bg-white shadow-sm text-navy' : 'text-ink2 hover:text-navy'}`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '13px', fontWeight: '500', color: '#111827' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#0A2540" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 pt-6 border-t border-bb2 flex items-start gap-3">
              <div className="mt-0.5 text-green">
                <TrendingUp size={18} />
              </div>
              <p className="text-[14px] text-ink font-medium leading-relaxed">
                Revenue is up <span className="text-green font-bold">18%</span> this {chartView === 'monthly' ? 'month' : 'week'} compared to the previous period. Business Insights surfaces trends like this automatically.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy mb-12">Loved by growing businesses</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-8 text-left bg-row-alt border-none shadow-none">
              <div className="text-gold mb-4 flex gap-1">
                {'★★★★★'}
              </div>
              <p className="text-ink text-[14px] leading-relaxed mb-6 italic">
                "Bill Book changed how we handle our retail counter. It's so fast we never have lines anymore."
              </p>
              <div className="font-bold text-navy text-[13px]">— Placeholder User A</div>
            </Card>
            <Card className="p-8 text-left bg-row-alt border-none shadow-none">
              <div className="text-gold mb-4 flex gap-1">
                {'★★★★★'}
              </div>
              <p className="text-ink text-[14px] leading-relaxed mb-6 italic">
                "Finally, a billing software that doesn't look like it was built in 1995. Clean, fast, and exactly what I needed."
              </p>
              <div className="font-bold text-navy text-[13px]">— Placeholder User B</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-navy text-paper text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Start billing the right way today.</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join local distributors, restaurants, and retail stores managing their invoices and inventory with Bill Book.
          </p>
          <Link to="/signup">
            <Button variant="primary" className="px-8 py-3 text-[14px] shadow-lg">
              Create your free account <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
