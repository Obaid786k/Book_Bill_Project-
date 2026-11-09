import React from 'react';

export const AdminError = ({ message }) => (
  <p className="p-4 rounded-lg bg-red-bg text-red text-[13px] font-medium">{message}</p>
);

export const AdminHeader = ({ title, description, children }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-display font-bold text-ink">{title}</h1>
      <p className="text-sm text-ink2 mt-1">{description}</p>
    </div>
    {children}
  </div>
);
