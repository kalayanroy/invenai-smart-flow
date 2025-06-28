
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProductTableOptimized } from '@/components/dashboard/ProductTableOptimized';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const Inventory = () => {
  // Async data loading with React Query for inventory data
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ['inventory-data'],
    queryFn: async () => {
      // Simulate async data loading - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 100));
      return { loaded: true };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading inventory data</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <ProductTableOptimized />
      </main>
    </div>
  );
};

export default Inventory;
