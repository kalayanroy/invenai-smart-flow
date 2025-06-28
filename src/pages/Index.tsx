
import React, { Suspense, lazy } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

// Lazy load dashboard components
const MetricsOverview = lazy(() => 
  import('@/components/dashboard/MetricsOverview')
    .then(module => ({ default: module.MetricsOverview }))
);

const InventoryChart = lazy(() => 
  import('@/components/dashboard/InventoryChart')
    .then(module => ({ default: module.InventoryChart }))
);

const AlertsPanel = lazy(() => 
  import('@/components/dashboard/AlertsPanel')
    .then(module => ({ default: module.AlertsPanel }))
);

const AIInsights = lazy(() => 
  import('@/components/dashboard/AIInsights')
    .then(module => ({ default: module.AIInsights }))
);

const FastSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-24 w-full rounded-lg" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  </div>
);

const Index = () => {
  // Async data preloading for dashboard
  const { data: dashboardReady, isLoading } = useQuery({
    queryKey: ['dashboard-ready'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
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
        <div className="space-y-4">
          <Suspense fallback={<FastSkeleton />}>
            <MetricsOverview />
          </Suspense>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Suspense fallback={<FastSkeleton />}>
                <InventoryChart />
              </Suspense>
            </div>
            <div className="space-y-4">
              <Suspense fallback={<FastSkeleton />}>
                <AlertsPanel />
              </Suspense>
              <Suspense fallback={<FastSkeleton />}>
                <AIInsights />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
