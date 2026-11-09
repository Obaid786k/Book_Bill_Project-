import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { insightsService } from '../../services/insightsService';
import { inr } from '../../components/charts/chartTheme';
import { RevenueTrendCard } from '../dashboard/components/RevenueTrendCard';

const pulse = 'animate-pulse bg-bb2 rounded-[12px]';

export const Overview = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    insightsService.getOverview().then(setData);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="!mb-1" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {data ? (
          <>
            <StatCard title="Total revenue" value={inr(data.totalRevenue)} subtitle="vs last month" trend={data.revenueGrowth} />
            <StatCard title="Bills generated" value={data.billsGenerated} subtitle="vs last month" trend={data.billsGrowth} />
            <StatCard title="Avg bill value" value={inr(data.avgBillValue)} subtitle="vs last month" trend={data.avgBillGrowth} />
            <StatCard title="Outstanding" value={inr(data.outstanding)} subtitle="vs last month" trend={data.outstandingGrowth} />
          </>
        ) : [1, 2, 3, 4].map((i) => <div key={i} className={`${pulse} h-[108px]`} />)}
      </div>

      {/* Same revenue chart, range and compare as the Dashboard */}
      <RevenueTrendCard />
    </div>
  );
};

export default Overview;
