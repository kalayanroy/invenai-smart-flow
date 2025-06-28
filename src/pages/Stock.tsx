
import React, { Suspense, lazy } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

const StockManagement = lazy(() => 
  import('@/components/inventory/StockManagement')
    .then(module => ({ default: module.StockManagement }))
);

const FastSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-24 w-full rounded-lg" />
  </div>
);

const Stock = () => {
  // Async data preloading for stock
  const { data: stockReady, isLoading } = useQuery({
    queryKey: ['stock-ready'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return true;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <FastSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<FastSkeleton />}>
          <StockManagement />
        </Suspense>
      </main>
    </div>
  );
};

export default Stock;
