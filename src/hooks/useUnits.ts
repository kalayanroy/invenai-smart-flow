
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Unit {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return;
      }
      
      console.log('Units fetched successfully:', data);
      setUnits(data || []);
    } catch (error) {
      console.error('Error in fetchUnits:', error);
      setError('Failed to fetch units');
    } finally {
      setLoading(false);
    }
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
      await fetchUnits(); // Refresh the list
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

      await fetchUnits();
    } catch (error) {
      console.error('Error in deleteUnit:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return {
    units,
    loading,
    error,
    addUnit,
    editUnit,
    deleteUnit,
    fetchUnits
  };
};
