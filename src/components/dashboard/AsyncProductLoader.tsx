
import React, { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load the virtualized table only when needed
const VirtualizedProductTable = React.lazy(() => 
  import('./VirtualizedProductTable').then(module => ({ 
    default: module.VirtualizedProductTable 
  }))
);

// Simplified loading skeleton
const ProductTableSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Loading Products...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <div className="flex space-x-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Error boundary component
const ErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <Card>
    <CardContent className="p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load products</h3>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={retry} variant="outline">
        Try Again
      </Button>
    </CardContent>
  </Card>
);

export const AsyncProductLoader = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Start loading immediately
  useEffect(() => {
    setShouldLoad(true);
  }, []);

  // Simple loading state without prefetch complexity
  if (!shouldLoad) {
    return <ProductTableSkeleton />;
  }

  return (
    <Suspense fallback={<ProductTableSkeleton />}>
      <VirtualizedProductTable />
    </Suspense>
  );
};
