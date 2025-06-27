
import { useState, useEffect } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export const useLocalStorage = () => {
  const setItem = <T>(key: string, value: T, expiryMinutes: number = 30) => {
    try {
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryMinutes * 60 * 1000)
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      console.log(`Cached ${key} for ${expiryMinutes} minutes`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getItem = <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
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

      const cacheItem: CacheItem<any> = JSON.parse(item);
      return Date.now() < cacheItem.expiry;
    } catch (error) {
      return false;
    }
  };

  return {
    setItem,
    getItem,
    removeItem,
    clearCache,
    isCacheValid
  };
};
