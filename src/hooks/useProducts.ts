
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // Reset and fetch initial products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching initial products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      const mappedProducts = data.map(product => ({
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

      console.log(`Fetched ${mappedProducts.length} initial products`);
      setProducts(mappedProducts);
      setPage(1);
      setHasMore(mappedProducts.length === PAGE_SIZE);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      setLoading(false);
    }
  }, []);

  // Load more products for pagination
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) {
      console.log('Load more blocked:', { loading, hasMore });
      return;
    }

    try {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      console.log(`Loading more products: ${from} to ${to}`);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error loading more products:', error);
        setLoading(false);
        return;
      }

      const mappedProducts = data.map(product => ({
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

      console.log(`Loaded ${mappedProducts.length} more products`);
      
      setProducts(prev => [...prev, ...mappedProducts]);
      setPage(prev => prev + 1);
      setHasMore(mappedProducts.length === PAGE_SIZE);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadMoreProducts:', error);
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Initialize on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'aiRecommendation' | 'createdAt'>) => {
    try {
      console.log('Adding product to Supabase:', productData);

      let cleanImage = undefined;
      if (productData.image && typeof productData.image === 'string' && productData.image.length > 0) {
        if (productData.image.startsWith('data:') || productData.image.startsWith('http')) {
          cleanImage = productData.image;
        }
      }

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
        ai_recommendation: (productData.openingStock || 0) > 50 ? 'Optimal stock level' : 'Consider restocking',
        image: cleanImage
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding product:', error);
        throw error;
      }

      console.log('Product successfully added to Supabase:', data);
      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Error in addProduct:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      console.log('Updating product in Supabase:', id, updates);

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
        console.error('Supabase error updating product:', error);
        throw error;
      }

      console.log('Product updated successfully in Supabase');
      await fetchProducts();
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product from Supabase:', id);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting product:', error);
        throw error;
      }

      console.log('Product deleted successfully from Supabase');
      await fetchProducts();
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const clearAllProducts = async () => {
    try {
      console.log('Clearing all products from Supabase...');

      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '');

      if (error) {
        console.error('Supabase error clearing products:', error);
        throw error;
      }

      console.log('All products cleared from Supabase');
      setProducts([]);
    } catch (error) {
      console.error('Error in clearAllProducts:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    hasMore,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    clearAllProducts,
    fetchProducts,
    loadMoreProducts
  };
};
