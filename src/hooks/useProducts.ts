
import { useState, useEffect } from 'react';
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

  // Load products from Supabase on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      console.log('Raw products data from Supabase:', data);

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

      console.log('Mapped products:', mappedProducts);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'aiRecommendation' | 'createdAt'>) => {
    try {
      console.log('Adding product to Supabase:', productData);

      // Clean up the image data - check if it's a valid base64 string or URL
      let cleanImage = undefined;
      if (productData.image && typeof productData.image === 'string' && productData.image.length > 0) {
        // Only use the image if it's a valid data URL or HTTP URL
        if (productData.image.startsWith('data:') || productData.image.startsWith('http')) {
          cleanImage = productData.image;
        }
      }

      const newProduct = {
        id: productData.sku, // Use SKU as ID
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
        status: 'In Stock',//(productData.openingStock || 0) > 50 ? 'In Stock' : (productData.openingStock || 0) > 0 ? 'Low Stock' : 'Out of Stock',
        ai_recommendation: (productData.openingStock || 0) > 50 ? 'Optimal stock level' : 'Consider restocking',
        image: cleanImage
      };

      console.log('Prepared product data for Supabase:', newProduct);

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
      await fetchProducts(); // Refresh the list
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
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product from Supabase:', id);
      
      const productToDelete = products.find(p => p.id === id);
      if (productToDelete) {
        console.log(`Preparing to delete product: ${productToDelete.name} (${productToDelete.sku})`);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting product:', error);
        throw error;
      }

      console.log('Product deleted successfully from Supabase');
      await fetchProducts(); // Refresh the list
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
        .neq('id', ''); // Delete all records

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
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    clearAllProducts,
    fetchProducts
  };
};
