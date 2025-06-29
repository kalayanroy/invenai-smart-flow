
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  stock: number;
  reorderPoint: number;
  price: string;
  purchasePrice: string;
  sellPrice: string;
  openingStock: number;
  unit: string;
  status: string;
  aiRecommendation: string;
  image?: string;
  createdAt: string;
}

const CACHE_KEY = 'products_async';
const CACHE_EXPIRY_MINUTES = 10;

// Async product fetcher with better error handling
const fetchProducts = async (): Promise<Product[]> => {
  console.log('Fetching products asynchronously...');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  const mappedProducts = (data || []).map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode || '',
    category: product.category,
    stock: product.stock,
    reorderPoint: product.reorder_point,
    price: product.price,
    purchasePrice: product.purchase_price,
    sellPrice: product.sell_price,
    openingStock: product.opening_stock,
    unit: product.unit,
    status: product.status,
    aiRecommendation: product.ai_recommendation || '',
    image: product.image,
    createdAt: product.created_at
  }));

  console.log(`Loaded ${mappedProducts.length} products asynchronously`);
  return mappedProducts;
};

export const useProductsAsync = () => {
  const queryClient = useQueryClient();
  const { setItem, getItem, removeItem, isCacheValid } = useLocalStorage();

  // Main products query with advanced caching
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: CACHE_EXPIRY_MINUTES * 60 * 1000,
    gcTime: (CACHE_EXPIRY_MINUTES + 5) * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Cache products locally for offline access
  useEffect(() => {
    if (products.length > 0) {
      try {
        setItem(CACHE_KEY, products, CACHE_EXPIRY_MINUTES);
      } catch (error) {
        console.warn('Failed to cache products locally:', error);
      }
    }
  }, [products, setItem]);

  // Add product with optimistic updates
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'status' | 'aiRecommendation' | 'createdAt'>) => {
    try {
      console.log('Adding product:', productData.name);

      const newProduct = {
        id: productData.sku,
        name: productData.name,
        sku: productData.sku,
        barcode: productData.barcode || null,
        category: productData.category,
        stock: productData.openingStock || 0,
        reorder_point: Math.max(10, Math.floor((productData.openingStock || 0) * 0.2)),
        price: productData.sellPrice,
        purchase_price: productData.purchasePrice,
        sell_price: productData.sellPrice,
        opening_stock: productData.openingStock || 0,
        unit: productData.unit,
        status: 'In Stock',
        ai_recommendation: 'Recently added product',
        image: productData.image
      };

      // Optimistic update
      queryClient.setQueryData(['products'], (old: Product[] = []) => [
        {
          ...newProduct,
          reorderPoint: newProduct.reorder_point,
          purchasePrice: newProduct.purchase_price,
          sellPrice: newProduct.sell_price,
          openingStock: newProduct.opening_stock,
          aiRecommendation: newProduct.ai_recommendation,
          createdAt: new Date().toISOString()
        } as Product,
        ...old
      ]);

      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['products'] });
        throw error;
      }

      // Invalidate cache and refetch
      removeItem(CACHE_KEY);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }, [queryClient, removeItem]);

  // Update product with optimistic updates
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      console.log('Updating product:', id);

      // Optimistic update
      queryClient.setQueryData(['products'], (old: Product[] = []) =>
        old.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      );

      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.sku) dbUpdates.sku = updates.sku;
      if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.reorderPoint !== undefined) dbUpdates.reorder_point = updates.reorderPoint;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.purchasePrice) dbUpdates.purchase_price = updates.purchasePrice;
      if (updates.sellPrice) dbUpdates.sell_price = updates.sellPrice;
      if (updates.openingStock !== undefined) dbUpdates.opening_stock = updates.openingStock;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.aiRecommendation !== undefined) dbUpdates.ai_recommendation = updates.aiRecommendation;
      if (updates.image !== undefined) dbUpdates.image = updates.image;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['products'] });
        throw error;
      }

      removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, [queryClient, removeItem]);

  // Delete product with optimistic updates
  const deleteProduct = useCallback(async (id: string) => {
    try {
      console.log('Deleting product:', id);

      // Optimistic update
      queryClient.setQueryData(['products'], (old: Product[] = []) =>
        old.filter(product => product.id !== id)
      );

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['products'] });
        throw error;
      }

      removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, [queryClient, removeItem]);

  const getProduct = useCallback((id: string) => {
    return products.find(product => product.id === id);
  }, [products]);

  const refreshProducts = useCallback(() => {
    removeItem(CACHE_KEY);
    return refetch();
  }, [refetch, removeItem]);

  return {
    products,
    loading: isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refreshProducts,
    refetch
  };
};
