import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-navy"
        >
          <span className="bg-gold text-paper rounded flex items-center justify-center w-8 h-8 text-[16px] font-mono shadow-sm">₹</span> 
          Bill Book
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10 shadow-lg border-bb2 bg-white">
          <Outlet />
        </Card>
        
        <div className="mt-8 text-center text-[12px] text-ink3">
          <p>© {new Date().getFullYear()} Bill Book. Safe & Secure.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
