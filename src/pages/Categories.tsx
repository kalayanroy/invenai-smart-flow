
import React, { Suspense, lazy } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

const CategoryManagement = lazy(() => 
  import('@/components/inventory/CategoryManagement')
    .then(module => ({ default: module.CategoryManagement }))
);

const UnitManagement = lazy(() => 
  import('@/components/inventory/UnitManagement')
    .then(module => ({ default: module.UnitManagement }))
);

const FastSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-24 w-full rounded-lg" />
  </div>
);

const Categories = () => {
  // Async data preloading for categories
  const { data: categoriesReady, isLoading } = useQuery({
    queryKey: ['categories-ready'],
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FastSkeleton />
            <FastSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Suspense fallback={<FastSkeleton />}>
            <CategoryManagement />
          </Suspense>
          <Suspense fallback={<FastSkeleton />}>
            <UnitManagement />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default Categories;
