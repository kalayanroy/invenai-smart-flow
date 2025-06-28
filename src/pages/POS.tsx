
import React, { Suspense, lazy } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

const POSSystem = lazy(() => 
  import('@/components/pos/POSSystem')
    .then(module => ({ default: module.POSSystem }))
);

const FastSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-24 w-full rounded-lg" />
  </div>
);

const POS = () => {
  // Async data preloading for POS
  const { data: posReady, isLoading } = useQuery({
    queryKey: ['pos-ready'],
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
          <POSSystem />
        </Suspense>
      </main>
    </div>
  );
};

export default POS;
