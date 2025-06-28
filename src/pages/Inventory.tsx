
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProductTableOptimized } from '@/components/dashboard/ProductTableOptimized';

const Inventory = () => {
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
