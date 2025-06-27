
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = 'inventory_categories';
const CACHE_EXPIRY_MINUTES = 30; // Cache for 30 minutes

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setItem, getItem, removeItem, isCacheValid } = useLocalStorage();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from cache first
      const cachedCategories = getItem<Category[]>(CACHE_KEY);
      
      if (cachedCategories && isCacheValid(CACHE_KEY)) {
        console.log('Loading categories from cache');
        setCategories(cachedCategories);
        setLoading(false);
        return;
      }

      // If no cache or expired, fetch from database
      console.log('Cache miss or expired, fetching categories from database');
      await fetchCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching categories from database...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('Categories fetched successfully:', data);
      setCategories(data || []);
      
      // Cache the categories
      setItem(CACHE_KEY, data || [], CACHE_EXPIRY_MINUTES);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      setError('Failed to fetch categories');
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    removeItem(CACHE_KEY);
    console.log('Categories cache invalidated');
  };

  const addCategory = async (name: string) => {
    try {
      console.log('Adding new category:', name);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }

      console.log('Category added successfully:', data);
      invalidateCache(); // Clear cache to force refresh
      await fetchCategories(); // Refresh from database
      return data;
    } catch (error) {
      console.error('Error in addCategory:', error);
      throw error;
    }
  };

  const editCategory = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error editing category:', error);
        throw error;
      }

      invalidateCache(); // Clear cache to force refresh
      await fetchCategories();
      return data;
    } catch (error) {
      console.error('Error in editCategory:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }

      invalidateCache(); // Clear cache to force refresh
      await fetchCategories();
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  };

  const refreshCategories = async () => {
    invalidateCache();
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    deleteCategory,
    fetchCategories,
    refreshCategories,
    invalidateCache
  };
};
