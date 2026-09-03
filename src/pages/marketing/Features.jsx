import React from 'react';
import { Card } from '../../components/common/Card';
import { CheckCircle2 } from 'lucide-react';

const Features = () => {
  const featureList = [
    {
      title: "Smart Invoicing",
      description: "Create professional GST invoices with auto-calculated taxes (CGST/SGST/IGST). Includes support for customized place of supply and reverse charge.",
      features: ["Auto GST calculation", "Customizable templates", "One-click PDF generation", "WhatsApp sharing integration"]
    },
    {
      title: "Product Catalog",
      description: "Manage your inventory seamlessly. Add products with HSN/SAC codes, default tax rates, and keep track of pricing history.",
      features: ["Bulk import/export", "HSN code memory", "Smart search in billing", "Category management"]
    },
    {
      title: "Business Insights",
      description: "Understand your business health at a glance. Visual charts that actually make sense, accompanied by actionable observations.",
      features: ["Revenue trends", "Top selling products", "Tax liability reports", "Pending collections"]
    }
  ];

  return (
    <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-navy tracking-tight mb-4">Features</h1>
        <p className="text-lg text-ink2 max-w-2xl mx-auto">
          Everything you need to run your business efficiently, without the complexity of bloated ERP systems.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {featureList.map((section, idx) => (
          <Card key={idx} className="p-8 md:p-10 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-navy mb-3">{section.title}</h2>
              <p className="text-ink2 leading-relaxed mb-6">{section.description}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13.5px] text-ink font-medium">
                    <CheckCircle2 size={16} className="text-green" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Placeholder for feature screenshot */}
            <div className="flex-1 w-full aspect-video bg-row-alt rounded border border-bb2 flex items-center justify-center">
              <span className="text-ink3 text-[12px] uppercase tracking-wider font-bold">Screenshot Placeholder</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
