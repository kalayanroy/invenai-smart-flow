
import { useState, useEffect } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Simple compression function to reduce storage size
const compress = (data: any): string => {
  const jsonString = JSON.stringify(data);
  // Remove unnecessary whitespace and compress common patterns
  return jsonString
    .replace(/\s+/g, ' ')
    .replace(/,\s*}/g, '}')
    .replace(/{\s*/g, '{')
    .replace(/\[\s*/g, '[')
    .replace(/\s*\]/g, ']');
};

const decompress = (compressedData: string): any => {
  return JSON.parse(compressedData);
};

// Get storage size in bytes
const getStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// Clear old cache items to free up space
const clearOldCacheItems = () => {
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (const key in localStorage) {
    if (key.startsWith('inventory_')) {
      try {
        const item = JSON.parse(localStorage[key]);
        if (item.expiry && now > item.expiry) {
          keysToRemove.push(key);
        }
      } catch (error) {
        // Invalid cache item, remove it
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed expired cache item: ${key}`);
  });
};

export const useLocalStorage = () => {
  const setItem = <T>(key: string, value: T, expiryMinutes: number = 30) => {
    try {
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryMinutes * 60 * 1000)
      };
      
      const compressedData = compress(cacheItem);
      
      try {
        localStorage.setItem(key, compressedData);
        console.log(`Cached ${key} for ${expiryMinutes} minutes (${compressedData.length} bytes)`);
      } catch (quotaError) {
        if (quotaError instanceof DOMException && quotaError.name === 'QuotaExceededError') {
          console.warn(`Storage quota exceeded for ${key}. Attempting to clear old cache items...`);
          
          // Clear expired items first
          clearOldCacheItems();
          
          // Try again after clearing expired items
          try {
            localStorage.setItem(key, compressedData);
            console.log(`Successfully cached ${key} after clearing expired items`);
          } catch (secondError) {
            // If still failing, clear this specific cache type to make room
            console.warn(`Still failing to cache ${key}. Clearing cache for this type...`);
            localStorage.removeItem(key);
            
            // Try one more time
            try {
              localStorage.setItem(key, compressedData);
              console.log(`Successfully cached ${key} after clearing existing cache`);
            } catch (finalError) {
              console.error(`Failed to cache ${key} even after clearing space. Data too large for localStorage.`);
              // Don't throw error, just continue without caching
            }
          }
        } else {
          throw quotaError;
        }
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Don't throw error, continue without caching
    }
  };

  const getItem = <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = decompress(item);
      
      // Check if cache has expired
      if (Date.now() > cacheItem.expiry) {
        localStorage.removeItem(key);
        console.log(`Cache expired for ${key}`);
        return null;
      }

      console.log(`Retrieved cached ${key}`);
      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      // Remove corrupted cache item
      localStorage.removeItem(key);
      return null;
    }
  };

  const removeItem = (key: string) => {
    try {
      localStorage.removeItem(key);
      console.log(`Removed cached ${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  const clearCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('inventory_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const isCacheValid = (key: string): boolean => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return false;

      const cacheItem: CacheItem<any> = decompress(item);
      return Date.now() < cacheItem.expiry;
    } catch (error) {
      return false;
    }
  };

  const getStorageInfo = () => {
    const size = getStorageSize();
    const maxSize = 5 * 1024 * 1024; // Assume 5MB limit
    return {
      usedBytes: size,
      usedMB: (size / (1024 * 1024)).toFixed(2),
      percentageUsed: ((size / maxSize) * 100).toFixed(1)
    };
  };

  return {
    setItem,
    getItem,
    removeItem,
    clearCache,
    isCacheValid,
    getStorageInfo
  };
};
