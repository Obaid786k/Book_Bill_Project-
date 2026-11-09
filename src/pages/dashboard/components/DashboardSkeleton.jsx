import React from 'react';

const block = 'animate-pulse bg-bb2 rounded';

// Loading shape of the dashboard (same order as the real page).
export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading dashboard">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-1">
      <div className="space-y-2">
        <div className={`${block} h-4 w-56`} />
        <div className={`${block} h-7 w-64`} />
      </div>
      <div className="flex gap-2">
        <div className={`${block} h-10 w-32`} />
        <div className={`${block} h-10 w-28`} />
      </div>
    </div>
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {[0, 1, 2, 3].map((i) => <div key={i} className={`${block} h-[104px] rounded-[12px]`} />)}
    </div>
    <div className={`${block} h-[290px] rounded-[12px]`} />
    <div className="flex flex-wrap gap-4">
      <div className={`${block} h-[240px] rounded-[12px] flex-[2_1_420px]`} />
      <div className={`${block} h-[240px] rounded-[12px] flex-[1_1_300px]`} />
    </div>
  </div>
);
