
import React, { Suspense } from 'react';
import { AsyncProductLoader } from './AsyncProductLoader';

// Wrapper component with better error boundaries and loading states
const ProductTableOptimized = () => {
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Initializing inventory...</span>
        </div>
      }>
        <AsyncProductLoader />
      </Suspense>
    </div>
  );
};

export { ProductTableOptimized };
