
import React, { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load dashboard components with better chunking
const MetricsOverview = lazy(() => import('@/components/dashboard/MetricsOverview').then(module => ({ default: module.MetricsOverview })));
const InventoryChart = lazy(() => import('@/components/dashboard/InventoryChart').then(module => ({ default: module.InventoryChart })));
const ProductTable = lazy(() => import('@/components/dashboard/ProductTableMemoized').then(module => ({ default: module.ProductTable })));
const AlertsPanel = lazy(() => import('@/components/dashboard/AlertsPanel').then(module => ({ default: module.AlertsPanel })));
const AIInsights = lazy(() => import('@/components/dashboard/AIInsights').then(module => ({ default: module.AIInsights })));
const PurchaseSection = lazy(() => import('@/components/inventory/PurchaseSection').then(module => ({ default: module.PurchaseSection })));
const SalesSection = lazy(() => import('@/components/inventory/SalesSection').then(module => ({ default: module.SalesSection })));
const SalesReturnSection = lazy(() => import('@/components/inventory/SalesReturnSection').then(module => ({ default: module.SalesReturnSection })));
const StockManagement = lazy(() => import('@/components/inventory/StockManagement').then(module => ({ default: module.StockManagement })));
const CategoryManagement = lazy(() => import('@/components/inventory/CategoryManagement').then(module => ({ default: module.CategoryManagement })));
const UnitManagement = lazy(() => import('@/components/inventory/UnitManagement').then(module => ({ default: module.UnitManagement })));
const BackupRestore = lazy(() => import('@/components/inventory/BackupRestore').then(module => ({ default: module.BackupRestore })));
const POSSystem = lazy(() => import('@/components/pos/POSSystem').then(module => ({ default: module.POSSystem })));

// Enhanced skeleton with better UX
const ComponentSkeleton = React.memo(() => (
  <div className="space-y-4 animate-pulse">
    <div className="flex space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-32 w-full rounded-lg" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
    </div>
  </div>
));

ComponentSkeleton.displayName = 'ComponentSkeleton';

// Memoized tab trigger component
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
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9 gap-2">
            <TabTriggerMemo value="dashboard" className="text-xs lg:text-sm">Dashboard</TabTriggerMemo>
            <TabTriggerMemo value="inventory" className="text-xs lg:text-sm">Inventory</TabTriggerMemo>
            <TabTriggerMemo value="purchases" className="text-xs lg:text-sm">Purchases</TabTriggerMemo>
            <TabTriggerMemo value="sales" className="text-xs lg:text-sm">Sales</TabTriggerMemo>
            <TabTriggerMemo value="returns" className="text-xs lg:text-sm">Returns</TabTriggerMemo>
            <TabTriggerMemo value="stock" className="text-xs lg:text-sm">Stock</TabTriggerMemo>
            <TabTriggerMemo value="categories" className="text-xs lg:text-sm">Categories</TabTriggerMemo>
            <TabTriggerMemo value="settings" className="text-xs lg:text-sm">Settings</TabTriggerMemo>
            <TabTriggerMemo value="pos" className="text-xs lg:text-sm">POS</TabTriggerMemo>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Suspense fallback={<ComponentSkeleton />}>
              <MetricsOverview />
            </Suspense>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Suspense fallback={<ComponentSkeleton />}>
                  <InventoryChart />
                </Suspense>
              </div>
              <div className="space-y-6">
                <Suspense fallback={<ComponentSkeleton />}>
                  <AlertsPanel />
                </Suspense>
                <Suspense fallback={<ComponentSkeleton />}>
                  <AIInsights />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <Suspense fallback={<ComponentSkeleton />}>
              <ProductTable />
            </Suspense>
          </TabsContent>

          <TabsContent value="purchases">
            <Suspense fallback={<ComponentSkeleton />}>
              <PurchaseSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="sales">
            <Suspense fallback={<ComponentSkeleton />}>
              <SalesSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="returns">
            <Suspense fallback={<ComponentSkeleton />}>
              <SalesReturnSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="stock">
            <Suspense fallback={<ComponentSkeleton />}>
              <StockManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ComponentSkeleton />}>
                <CategoryManagement />
              </Suspense>
              <Suspense fallback={<ComponentSkeleton />}>
                <UnitManagement />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Suspense fallback={<ComponentSkeleton />}>
              <BackupRestore />
            </Suspense>
          </TabsContent>

          <TabsContent value="pos">
            <Suspense fallback={<ComponentSkeleton />}>
              <POSSystem />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
});

StockDashboard.displayName = 'StockDashboard';

