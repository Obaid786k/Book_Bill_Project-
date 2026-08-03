import React from 'react';

const Terms = () => {
  return (
    <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto font-body text-ink">
      <h1 className="text-3xl font-bold text-navy mb-8">Terms of Service</h1>
      
      <div className="space-y-6 text-[14px] leading-relaxed text-ink2">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Bill Book, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">2. Description of Service</h2>
        <p>
          Bill Book provides users with tools for generating GST-compliant invoices, managing inventory, and tracking business analytics. The service may be updated or modified at our discretion.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">3. User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to use the service for lawful business purposes only.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">4. Limitation of Liability</h2>
        <p>
          In no event shall Bill Book be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">5. Modifications</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify users of any significant changes by posting a notice on our website or sending an email.
        </p>
      </div>
    </div>
  );
};

export default Terms;
