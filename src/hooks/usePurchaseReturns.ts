
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PurchaseReturn {
  id: string;
  purchaseOrderId: string;
  purchaseItemId: string;
  productId: string;
  productName: string;
  supplier: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: string;
  totalRefund: string;
  returnDate: string;
  reason: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  processedBy?: string;
  processedDate?: string;
}

export const usePurchaseReturns = () => {
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);

  useEffect(() => {
    fetchPurchaseReturns();
  }, []);

  const fetchPurchaseReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching purchase returns:', error);
        return;
      }

      const mappedReturns = data.map(returnItem => ({
        id: returnItem.id,
        purchaseOrderId: returnItem.purchase_order_id,
        purchaseItemId: returnItem.purchase_item_id,
        productId: returnItem.product_id,
        productName: returnItem.product_name,
        supplier: returnItem.supplier,
        originalQuantity: returnItem.original_quantity,
        returnQuantity: returnItem.return_quantity,
        unitPrice: returnItem.unit_price,
        totalRefund: returnItem.total_refund,
        returnDate: returnItem.return_date,
        reason: returnItem.reason,
        notes: returnItem.notes,
        status: returnItem.status as PurchaseReturn['status'],
        processedBy: returnItem.processed_by,
        processedDate: returnItem.processed_date,
      }));

      setPurchaseReturns(mappedReturns);
    } catch (error) {
      console.error('Error in fetchPurchaseReturns:', error);
    }
  };

  const addPurchaseReturn = async (returnData: Omit<PurchaseReturn, 'id'>) => {
    try {
      const returnId = `PR${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const newReturn = {
        id: returnId,
        purchase_order_id: returnData.purchaseOrderId,
        purchase_item_id: returnData.purchaseItemId,
        product_id: returnData.productId,
        product_name: returnData.productName,
        supplier: returnData.supplier,
        original_quantity: returnData.originalQuantity,
        return_quantity: returnData.returnQuantity,
        unit_price: returnData.unitPrice,
        total_refund: returnData.totalRefund,
        return_date: returnData.returnDate,
        reason: returnData.reason,
        notes: returnData.notes || null,
        status: returnData.status,
        processed_by: returnData.processedBy || null,
        processed_date: returnData.processedDate || null,
      };

      await supabase.from('purchase_returns').insert([newReturn]);
      await fetchPurchaseReturns();
      return returnId;
    } catch (error) {
      console.error('Error in addPurchaseReturn:', error);
      throw error;
    }
  };

  const updatePurchaseReturn = async (id: string, updates: Partial<PurchaseReturn>) => {
    try {
      const dbUpdates: any = {
        purchase_order_id: updates.purchaseOrderId,
        purchase_item_id: updates.purchaseItemId,
        product_id: updates.productId,
        product_name: updates.productName,
        supplier: updates.supplier,
        original_quantity: updates.originalQuantity,
        return_quantity: updates.returnQuantity,
        unit_price: updates.unitPrice,
        total_refund: updates.totalRefund,
        return_date: updates.returnDate,
        reason: updates.reason,
        notes: updates.notes,
        status: updates.status,
        processed_by: updates.processedBy,
        processed_date: updates.processedDate,
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      await supabase.from('purchase_returns').update(dbUpdates).eq('id', id);
      await fetchPurchaseReturns();
    } catch (error) {
      console.error('Error in updatePurchaseReturn:', error);
      throw error;
    }
  };

  const deletePurchaseReturn = async (id: string) => {
    try {
      await supabase.from('purchase_returns').delete().eq('id', id);
      await fetchPurchaseReturns();
    } catch (error) {
      console.error('Error in deletePurchaseReturn:', error);
      throw error;
    }
  };

  return {
    purchaseReturns,
    addPurchaseReturn,
    updatePurchaseReturn,
    deletePurchaseReturn,
    fetchPurchaseReturns
  };
};
