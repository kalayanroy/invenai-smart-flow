
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BackupData {
  timestamp: string;
  version: string;
  products: any[];
  sales: any[];
  purchases: any[];
  salesReturns: any[];
  salesVouchers: any[];
  purchaseVouchers: any[];
  categories: any[];
  units: any[];
}

export const useBackupRestore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createBackup = async () => {
    try {
      setIsLoading(true);
      console.log('Creating database backup...');

      // Fetch all data from different tables
      const [
        productsResult,
        salesResult,
        purchasesResult,
        salesReturnsResult,
        salesVouchersResult,
        purchaseVouchersResult,
        categoriesResult,
        unitsResult
      ] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('purchases').select('*'),
        supabase.from('sales_returns').select('*'),
        supabase.from('sales_vouchers').select('*'),
        supabase.from('purchase_vouchers').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('units').select('*')
      ]);

      // Check for errors
      const results = [
        productsResult,
        salesResult,
        purchasesResult,
        salesReturnsResult,
        salesVouchersResult,
        purchaseVouchersResult,
        categoriesResult,
        unitsResult
      ];

      for (const result of results) {
        if (result.error) {
          console.error('Error fetching data:', result.error);
          throw result.error;
        }
      }

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        products: productsResult.data || [],
        sales: salesResult.data || [],
        purchases: purchasesResult.data || [],
        salesReturns: salesReturnsResult.data || [],
        salesVouchers: salesVouchersResult.data || [],
        purchaseVouchers: purchaseVouchersResult.data || [],
        categories: categoriesResult.data || [],
        units: unitsResult.data || []
      };

      console.log('Backup data prepared:', backupData);

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Backup Created Successfully",
        description: "Your database backup has been downloaded.",
      });

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFromBackup = async (file: File) => {
    try {
      setIsLoading(true);
      console.log('Restoring database from backup...');

      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      console.log('Backup data parsed:', backupData);

      // Validate backup data structure
      if (!backupData.timestamp || !backupData.version) {
        throw new Error('Invalid backup file format');
      }

      // Clear existing data (optional - you might want to make this configurable)
      const clearOperations = [
        supabase.from('sales_voucher_items').delete().neq('id', ''),
        supabase.from('purchase_voucher_items').delete().neq('id', ''),
        supabase.from('sales_returns').delete().neq('id', ''),
        supabase.from('sales').delete().neq('id', ''),
        supabase.from('purchases').delete().neq('id', ''),
        supabase.from('sales_vouchers').delete().neq('id', ''),
        supabase.from('purchase_vouchers').delete().neq('id', ''),
        supabase.from('products').delete().neq('id', ''),
        supabase.from('categories').delete().neq('id', ''),
        supabase.from('units').delete().neq('id', '')
      ];

      console.log('Clearing existing data...');
      await Promise.all(clearOperations);

      // Restore data in the correct order (dependencies first)
      if (backupData.categories?.length > 0) {
        console.log('Restoring categories...');
        const { error } = await supabase.from('categories').insert(backupData.categories);
        if (error) throw error;
      }

      if (backupData.units?.length > 0) {
        console.log('Restoring units...');
        const { error } = await supabase.from('units').insert(backupData.units);
        if (error) throw error;
      }

      if (backupData.products?.length > 0) {
        console.log('Restoring products...');
        const { error } = await supabase.from('products').insert(backupData.products);
        if (error) throw error;
      }

      if (backupData.sales?.length > 0) {
        console.log('Restoring sales...');
        const { error } = await supabase.from('sales').insert(backupData.sales);
        if (error) throw error;
      }

      if (backupData.purchases?.length > 0) {
        console.log('Restoring purchases...');
        const { error } = await supabase.from('purchases').insert(backupData.purchases);
        if (error) throw error;
      }

      if (backupData.salesReturns?.length > 0) {
        console.log('Restoring sales returns...');
        const { error } = await supabase.from('sales_returns').insert(backupData.salesReturns);
        if (error) throw error;
      }

      if (backupData.salesVouchers?.length > 0) {
        console.log('Restoring sales vouchers...');
        const { error } = await supabase.from('sales_vouchers').insert(backupData.salesVouchers);
        if (error) throw error;
      }

      if (backupData.purchaseVouchers?.length > 0) {
        console.log('Restoring purchase vouchers...');
        const { error } = await supabase.from('purchase_vouchers').insert(backupData.purchaseVouchers);
        if (error) throw error;
      }

      toast({
        title: "Restore Completed Successfully",
        description: "Your database has been restored from the backup.",
      });

      // Refresh the page to reload all data
      window.location.reload();

    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore database from backup. Please check the file format.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBackup,
    restoreFromBackup,
    isLoading
  };
};
