import React from 'react';
import { Card } from '../../../components/common/Card';

export const DashboardSkeleton = () => {
  const pulse = "animate-pulse bg-bb2 rounded";
  
  return (
    <div className="flex flex-col gap-6">
      {/* Quick Actions Skeleton */}
      <div className="flex gap-3 py-2">
        {[1, 2, 3, 4].map(i => <div key={i} className={`${pulse} h-[34px] w-[110px] rounded-[5px]`}></div>)}
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-5 flex flex-col h-[110px]">
            <div className={`${pulse} h-3 w-1/2 mb-4`}></div>
            <div className={`${pulse} h-6 w-3/4 mb-2`}></div>
            <div className={`${pulse} h-2 w-1/3 mt-auto`}></div>
          </Card>
        ))}
      </div>
      
      {/* Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i} className="flex flex-col h-[280px]">
            <div className="p-4 border-b border-bb flex justify-between">
              <div className={`${pulse} h-4 w-1/4`}></div>
              <div className={`${pulse} h-3 w-12`}></div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {[1, 2, 3, 4].map(j => <div key={j} className={`${pulse} h-8 w-full`}></div>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
