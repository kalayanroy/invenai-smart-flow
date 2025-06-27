
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';

export interface Unit {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = 'inventory_units';
const CACHE_EXPIRY_MINUTES = 30; // Cache for 30 minutes

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setItem, getItem, removeItem, isCacheValid } = useLocalStorage();

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from cache first
      const cachedUnits = getItem<Unit[]>(CACHE_KEY);
      
      if (cachedUnits && isCacheValid(CACHE_KEY)) {
        console.log('Loading units from cache');
        setUnits(cachedUnits);
        setLoading(false);
        return;
      }

      // If no cache or expired, fetch from database
      console.log('Cache miss or expired, fetching units from database');
      await fetchUnits();
    } catch (error) {
      console.error('Error loading units:', error);
      setError('Failed to load units');
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching units from database...');
      
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching units:', error);
        setError(error.message);
        setLoading(false);
        return;
      }
      
      console.log('Units fetched successfully:', data);
      setUnits(data || []);
      
      // Cache the units
      setItem(CACHE_KEY, data || [], CACHE_EXPIRY_MINUTES);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUnits:', error);
      setError('Failed to fetch units');
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    removeItem(CACHE_KEY);
    console.log('Units cache invalidated');
  };

  const addUnit = async (name: string) => {
    try {
      console.log('Adding new unit:', name);
      const { data, error } = await supabase
        .from('units')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        console.error('Error adding unit:', error);
        throw error;
      }

      console.log('Unit added successfully:', data);
      invalidateCache(); // Clear cache to force refresh
      await fetchUnits(); // Refresh from database
      return data;
    } catch (error) {
      console.error('Error in addUnit:', error);
      throw error;
    }
  };

  const editUnit = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error editing unit:', error);
        throw error;
      }

      invalidateCache(); // Clear cache to force refresh
      await fetchUnits();
      return data;
    } catch (error) {
      console.error('Error in editUnit:', error);
      throw error;
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting unit:', error);
        throw error;
      }

      invalidateCache(); // Clear cache to force refresh
      await fetchUnits();
    } catch (error) {
      console.error('Error in deleteUnit:', error);
      throw error;
    }
  };

  const refreshUnits = async () => {
    invalidateCache();
    await fetchUnits();
  };

  return {
    units,
    loading,
    error,
    addUnit,
    editUnit,
    deleteUnit,
    fetchUnits,
    refreshUnits,
    invalidateCache
  };
};
