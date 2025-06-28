
import React, { Suspense } from 'react';
import { ProductTableFast } from './ProductTableFast';

// Wrapper component to handle lazy loading and error boundaries
const ProductTableOptimized = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    }>
      <ProductTableFast />
    </Suspense>
  );
};

export { ProductTableOptimized };
