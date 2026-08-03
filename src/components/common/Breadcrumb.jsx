import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Dashboard doesn't show breadcrumb per spec
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center text-[12.5px] text-ink3 mb-4 mt-2 no-print">
      <Link to="/dashboard" className="hover:text-navy transition-colors flex items-center">
        <Home size={14} className="mr-1" />
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        const customLabels = {
          'insights': 'Business Insights'
        };
        const rawValue = customLabels[value] || value;
        const formattedValue = rawValue.charAt(0).toUpperCase() + rawValue.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="mx-1 opacity-50" />
            {isLast ? (
              <span className="font-semibold text-ink2">{formattedValue}</span>
            ) : (
              <Link to={to} className="hover:text-navy transition-colors">
                {formattedValue}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
