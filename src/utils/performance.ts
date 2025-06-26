
// Performance optimization utilities

// Debounce function for input handlers
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll handlers
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Image lazy loading utility
export const createImageLoader = () => {
  const imageCache = new Set<string>();
  
  return {
    preloadImage: (src: string): Promise<void> => {
      if (imageCache.has(src)) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    
    isImageCached: (src: string): boolean => {
      return imageCache.has(src);
    }
  };
};

// Memory cleanup utility - simplified version that doesn't try to modify readonly refs
export const cleanupRefs = (...refs: React.RefObject<any>[]) => {
  // Note: React refs are automatically cleaned up by React's garbage collection
  // This function is kept for API compatibility but doesn't perform direct cleanup
  // as ref.current is read-only
  refs.forEach(ref => {
    if (ref.current && typeof ref.current.cleanup === 'function') {
      ref.current.cleanup();
    }
  });
};
