
import React, { Suspense, lazy } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';

const PurchaseSection = lazy(() => 
  import('@/components/inventory/PurchaseSection')
    .then(module => ({ default: module.PurchaseSection }))
);

const FastSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-24 w-full rounded-lg" />
  </div>
);

const Purchases = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<FastSkeleton />}>
          <PurchaseSection />
        </Suspense>
      </main>
    </div>
  );
};

export default Purchases;
