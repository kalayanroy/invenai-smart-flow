
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return;
      }

      console.log('Categories fetched successfully:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
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
      await fetchCategories(); // Refresh the list
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

      await fetchCategories();
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    deleteCategory,
    fetchCategories
  };
};
