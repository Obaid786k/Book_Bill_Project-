import React, { Suspense, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useToast } from '../components/feedback/Toast';
import { Globe } from 'lucide-react';
import { clsx } from 'clsx';

const MarketingLayout = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if(email) {
      toast("Thanks for subscribing! We'll keep you updated.");
      setEmail('');
    }
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={clsx(
          "transition-colors",
          isActive ? "text-navy font-bold" : "hover:text-navy"
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-bg font-body text-ink flex flex-col">
      {/* Marketing Header */}
      <header className="h-[60px] bg-paper border-b border-bb2 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <Link to="/" className="font-bold text-[18px] tracking-tight flex items-center gap-2">
          <span className="bg-gold text-paper rounded flex items-center justify-center w-7 h-7 text-[15px] font-mono">₹</span> 
          Bill Book
        </Link>
        
        <nav className="hidden md:flex items-center gap-10 lg:gap-12 text-[13.5px] font-medium text-ink2">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="hidden sm:flex">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh]" />}><Outlet /></Suspense>
      </main>
      
      {/* Marketing Footer */}
      <footer className="bg-paper border-t border-bb2 py-11 px-6 md:px-12 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="font-bold text-[18px] text-navy tracking-tight flex items-center gap-2">
              <span className="bg-gold text-paper rounded flex items-center justify-center w-7 h-7 text-[15px] font-mono">₹</span> 
              Bill Book
            </div>
            <p className="text-[14px] font-semibold text-navy">
              Billing, simplified.
            </p>
            <p className="text-[13px] text-ink3 leading-relaxed max-w-xs">
              Modern billing and inventory management for the next generation of Indian businesses.
            </p>
          </div>
          
          {/* Column 2: Product */}
          <div className="flex flex-col gap-4">
            <span className="font-bold text-navy uppercase tracking-wider text-[11px]">Product</span>
            <Link to="/features" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">Features</Link>
            <Link to="/pricing" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">Pricing</Link>
            <Link to="/faq" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">FAQ</Link>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-4">
            <span className="font-bold text-navy uppercase tracking-wider text-[11px]">Company</span>
            <Link to="#" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">About</Link>
            <Link to="/contact" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">Contact</Link>
            <Link to="/privacy" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[13.5px] text-ink2 hover:text-navy transition-colors">Terms & Conditions</Link>
          </div>

          {/* Column 4: Get Started */}
          <div className="flex flex-col gap-4">
            <span className="font-bold text-navy uppercase tracking-wider text-[11px]">Stay Updated</span>
            <p className="text-[13px] text-ink2 mb-2">Get the latest news and updates directly in your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bg border border-bb2 text-ink placeholder:text-ink3 px-3 py-2 rounded text-[13px] outline-none focus:border-navy transition-colors"
                required
              />
              <Button type="submit" variant="primary" className="py-2 mt-1">Subscribe</Button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-bb2 flex flex-col md:flex-row items-center justify-between gap-4 text-[12.5px] text-ink3">
          <div>© {new Date().getFullYear()} Bill Book. All rights reserved.</div>
          <div className="flex items-center gap-4 text-ink2">
            <a href="#" className="hover:text-navy transition-colors"><Globe size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
