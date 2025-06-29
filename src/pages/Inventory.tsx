
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProductTableOptimized } from '@/components/dashboard/ProductTableOptimized';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Inventory = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        }>
          <ProductTableOptimized />
        </Suspense>
      </main>
    </div>
  );
};

export default Inventory;
