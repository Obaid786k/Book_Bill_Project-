import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto font-body text-ink">
      <h1 className="text-3xl font-bold text-navy mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-[14px] leading-relaxed text-ink2">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us when you create an account, generate an invoice, or communicate with us. This includes your name, email address, business details, and billing information.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to operate, maintain, and improve our services. Specifically, we use your data to facilitate invoice generation, provide business analytics, and offer customer support.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">3. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">4. Third-Party Services</h2>
        <p>
          We may share your information with trusted third-party service providers who assist us in operating our application, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
        </p>
        
        <h2 className="text-xl font-bold text-navy mt-8 mb-4">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us via our Contact page.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
