
import { useState } from 'react';
import { useProducts } from './useProducts';
import { useSales } from './useSales';
import { usePurchases } from './usePurchases';
import { useSalesReturns } from './useSalesReturns';
import { useToast } from '@/hooks/use-toast';

interface BackupData {
  products: any[];
  sales: any[];
  purchases: any[];
  salesReturns: any[];
  timestamp: string;
  version: string;
}

export const useBackupRestore = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { products, setProducts } = useProducts();
  const { sales, setSales } = useSales();
  const { purchases, setPurchases } = usePurchases();
  const { salesReturns, setSalesReturns } = useSalesReturns();
  const { toast } = useToast();

  const createBackup = () => {
    try {
      const backupData: BackupData = {
        products,
        sales,
        purchases,
        salesReturns,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Created",
        description: "Your inventory data has been successfully backed up.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const restoreFromBackup = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate backup data structure
      if (!backupData.products || !backupData.sales || !backupData.purchases || !backupData.salesReturns) {
        throw new Error('Invalid backup file format');
      }

      // Restore data
      setProducts(backupData.products);
      setSales(backupData.sales);
      setPurchases(backupData.purchases);
      setSalesReturns(backupData.salesReturns);

      toast({
        title: "Restore Successful",
        description: `Data restored from backup created on ${new Date(backupData.timestamp).toLocaleDateString()}`,
      });
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore from backup. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createBackup,
    restoreFromBackup,
    isProcessing
  };
};
