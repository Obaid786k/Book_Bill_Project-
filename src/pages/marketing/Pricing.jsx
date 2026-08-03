import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CheckCircle2 } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-navy tracking-tight mb-4">Pricing</h1>
        <p className="text-lg text-ink2 max-w-2xl mx-auto">
          Simple, transparent pricing. Start for free and upgrade when you need to.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <Card className="p-8 md:p-10 border-navy border-t-4 relative">
          <div className="absolute top-0 right-8 px-3 py-1 bg-navy text-white text-[10px] font-bold uppercase tracking-wider rounded-b">
            Most Popular
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Free Plan</h2>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold text-navy">₹0</span>
            <span className="text-ink2">/ forever</span>
          </div>
          <p className="text-[13.5px] text-ink2 mb-8">
            Perfect for small businesses and freelancers just getting started with organized billing.
          </p>
          <ul className="flex flex-col gap-4 mb-8">
            {['Up to 50 bills per month', 'Basic GST calculations', 'Print & PDF exports', 'Email support'].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-[14px] text-ink">
                <CheckCircle2 size={18} className="text-green flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="primary" className="w-full py-3">Get Started</Button>
        </Card>

        {/* Premium Tier */}
        <Card className="p-8 md:p-10 bg-row-alt border-bb2">
          <h2 className="text-2xl font-bold text-ink2 mb-2">Premium</h2>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold text-ink2">---</span>
          </div>
          <p className="text-[13.5px] text-ink3 mb-8">
            Advanced features for high-volume businesses. Coming soon.
          </p>
          <ul className="flex flex-col gap-4 mb-8 opacity-60">
            {['Unlimited bills', 'Advanced Analytics', 'Multi-user access', 'Priority support'].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-[14px] text-ink">
                <CheckCircle2 size={18} className="text-ink3 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full py-3" disabled>Coming Soon</Button>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;
