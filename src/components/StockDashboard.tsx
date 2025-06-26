
import React, { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load dashboard components
const MetricsOverview = lazy(() => import('@/components/dashboard/MetricsOverview').then(module => ({ default: module.MetricsOverview })));
const InventoryChart = lazy(() => import('@/components/dashboard/InventoryChart').then(module => ({ default: module.InventoryChart })));
const ProductTable = lazy(() => import('@/components/dashboard/ProductTable').then(module => ({ default: module.ProductTable })));
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

const ComponentSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-3/4" />
  </div>
);

export const StockDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9 gap-2">
            <TabsTrigger value="dashboard" className="text-xs lg:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs lg:text-sm">Inventory</TabsTrigger>
            <TabsTrigger value="purchases" className="text-xs lg:text-sm">Purchases</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs lg:text-sm">Sales</TabsTrigger>
            <TabsTrigger value="returns" className="text-xs lg:text-sm">Returns</TabsTrigger>
            <TabsTrigger value="stock" className="text-xs lg:text-sm">Stock</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs lg:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs lg:text-sm">Settings</TabsTrigger>
            <TabsTrigger value="pos" className="text-xs lg:text-sm">POS</TabsTrigger>
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
};
