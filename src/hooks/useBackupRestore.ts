
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
  const { products, clearAllProducts, addProduct } = useProducts();
  const { sales, clearAllSales, addSale } = useSales();
  const { purchases, clearAllPurchases, addPurchase } = usePurchases();
  const { salesReturns, clearAllSalesReturns, addSalesReturn } = useSalesReturns();
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

      // Clear all existing data first
      await clearAllProducts();
      await clearAllSales();
      await clearAllPurchases();
      await clearAllSalesReturns();

      // Restore products first (since other data depends on products)
      for (const product of backupData.products) {
        try {
          await addProduct({
            name: product.name,
            sku: product.sku,
            barcode: product.barcode || '',
            category: product.category,
            price: product.price,
            purchasePrice: product.purchasePrice,
            sellPrice: product.sellPrice,
            openingStock: product.openingStock || product.stock || 0,
            stock: product.stock || product.openingStock || 0,
            reorderPoint: product.reorderPoint || Math.max(10, Math.floor((product.stock || product.openingStock || 0) * 0.2)),
            unit: product.unit,
            image: product.image
          });
        } catch (error) {
          console.warn('Failed to restore product:', product.name, error);
        }
      }

      // Restore sales
      for (const sale of backupData.sales) {
        try {
          await addSale({
            productId: sale.productId,
            productName: sale.productName,
            quantity: sale.quantity,
            unitPrice: sale.unitPrice,
            totalAmount: sale.totalAmount,
            date: sale.date,
            status: sale.status,
            customerName: sale.customerName,
            notes: sale.notes
          });
        } catch (error) {
          console.warn('Failed to restore sale:', sale.id, error);
        }
      }

      // Restore purchases
      for (const purchase of backupData.purchases) {
        try {
          await addPurchase({
            productId: purchase.productId,
            productName: purchase.productName,
            supplier: purchase.supplier,
            quantity: purchase.quantity,
            unitPrice: purchase.unitPrice,
            totalAmount: purchase.totalAmount,
            date: purchase.date,
            status: purchase.status,
            notes: purchase.notes,
            purchaseOrderId: purchase.purchaseOrderId
          });
        } catch (error) {
          console.warn('Failed to restore purchase:', purchase.id, error);
        }
      }

      // Restore sales returns
      for (const salesReturn of backupData.salesReturns) {
        try {
          await addSalesReturn({
            originalSaleId: salesReturn.originalSaleId,
            originalVoucherId: salesReturn.originalVoucherId,
            originalVoucherItemId: salesReturn.originalVoucherItemId,
            sourceType: salesReturn.sourceType,
            productId: salesReturn.productId,
            productName: salesReturn.productName,
            returnQuantity: salesReturn.returnQuantity,
            originalQuantity: salesReturn.originalQuantity,
            unitPrice: salesReturn.unitPrice,
            totalRefund: salesReturn.totalRefund,
            returnDate: salesReturn.returnDate,
            reason: salesReturn.reason,
            status: salesReturn.status,
            customerName: salesReturn.customerName,
            notes: salesReturn.notes,
            processedBy: salesReturn.processedBy,
            processedDate: salesReturn.processedDate
          });
        } catch (error) {
          console.warn('Failed to restore sales return:', salesReturn.id, error);
        }
      }

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
