
import React, { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Optimized lazy loading with better chunking strategy
const MetricsOverview = lazy(() => 
  import('@/components/dashboard/MetricsOverview')
    .then(module => ({ default: module.MetricsOverview }))
);

const InventoryChart = lazy(() => 
  import('@/components/dashboard/InventoryChart')
    .then(module => ({ default: module.InventoryChart }))
);

// Use the new optimized product table
const ProductTableOptimized = lazy(() => 
  import('@/components/dashboard/ProductTableOptimized')
    .then(module => ({ default: module.ProductTableOptimized }))
);

const AlertsPanel = lazy(() => 
  import('@/components/dashboard/AlertsPanel')
    .then(module => ({ default: module.AlertsPanel }))
);

const AIInsights = lazy(() => 
  import('@/components/dashboard/AIInsights')
    .then(module => ({ default: module.AIInsights }))
);

// Lazy load other components only when needed
const PurchaseSection = lazy(() => 
  import('@/components/inventory/PurchaseSection')
    .then(module => ({ default: module.PurchaseSection }))
);

const SalesSection = lazy(() => 
  import('@/components/inventory/SalesSection')
    .then(module => ({ default: module.SalesSection }))
);

const SalesReturnSection = lazy(() => 
  import('@/components/inventory/SalesReturnSection')
    .then(module => ({ default: module.SalesReturnSection }))
);

const StockManagement = lazy(() => 
  import('@/components/inventory/StockManagement')
    .then(module => ({ default: module.StockManagement }))
);

const CategoryManagement = lazy(() => 
  import('@/components/inventory/CategoryManagement')
    .then(module => ({ default: module.CategoryManagement }))
);

const UnitManagement = lazy(() => 
  import('@/components/inventory/UnitManagement')
    .then(module => ({ default: module.UnitManagement }))
);

const BackupRestore = lazy(() => 
  import('@/components/inventory/BackupRestore')
    .then(module => ({ default: module.BackupRestore }))
);

const POSSystem = lazy(() => 
  import('@/components/pos/POSSystem')
    .then(module => ({ default: module.POSSystem }))
);

// Optimized skeleton with minimal rendering
const FastSkeleton = React.memo(() => (
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
));

FastSkeleton.displayName = 'FastSkeleton';

// Highly optimized tab trigger component
const TabTriggerMemo = React.memo(({ value, children, className }: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <TabsTrigger value={value} className={className}>
    {children}
  </TabsTrigger>
));

TabTriggerMemo.displayName = 'TabTriggerMemo';

export const StockDashboard = React.memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9 gap-1 h-auto p-1">
            <TabTriggerMemo value="dashboard" className="text-xs lg:text-sm px-2 py-1">Dashboard</TabTriggerMemo>
            <TabTriggerMemo value="inventory" className="text-xs lg:text-sm px-2 py-1">Inventory</TabTriggerMemo>
            <TabTriggerMemo value="purchases" className="text-xs lg:text-sm px-2 py-1">Purchases</TabTriggerMemo>
            <TabTriggerMemo value="sales" className="text-xs lg:text-sm px-2 py-1">Sales</TabTriggerMemo>
            <TabTriggerMemo value="returns" className="text-xs lg:text-sm px-2 py-1">Returns</TabTriggerMemo>
            <TabTriggerMemo value="stock" className="text-xs lg:text-sm px-2 py-1">Stock</TabTriggerMemo>
            <TabTriggerMemo value="categories" className="text-xs lg:text-sm px-2 py-1">Categories</TabTriggerMemo>
            <TabTriggerMemo value="settings" className="text-xs lg:text-sm px-2 py-1">Settings</TabTriggerMemo>
            <TabTriggerMemo value="pos" className="text-xs lg:text-sm px-2 py-1">POS</TabTriggerMemo>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 mt-4">
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
          </TabsContent>

          <TabsContent value="inventory" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <ProductTableOptimized />
            </Suspense>
          </TabsContent>

          <TabsContent value="purchases" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <PurchaseSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="sales" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <SalesSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="returns" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <SalesReturnSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="stock" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <StockManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Suspense fallback={<FastSkeleton />}>
                <CategoryManagement />
              </Suspense>
              <Suspense fallback={<FastSkeleton />}>
                <UnitManagement />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <BackupRestore />
            </Suspense>
          </TabsContent>

          <TabsContent value="pos" className="mt-4">
            <Suspense fallback={<FastSkeleton />}>
              <POSSystem />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
});

StockDashboard.displayName = 'StockDashboard';
