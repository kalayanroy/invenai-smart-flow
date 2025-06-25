import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: 'Ordered' | 'Received' | 'Pending' | 'Cancelled';
  notes?: string;
  purchaseOrderId?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  status: 'Ordered' | 'Received' | 'Pending' | 'Cancelled';
  notes?: string;
  items: Purchase[];
  totalAmount: number;
}

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching purchases:', error);
        return;
      }

      const mappedPurchases = data.map(purchase => ({
        id: purchase.id,
        productId: purchase.product_id,
        productName: purchase.product_name,
        supplier: purchase.supplier,
        quantity: purchase.quantity,
        unitPrice: purchase.unit_price,
        totalAmount: purchase.total_amount,
        date: purchase.date,
        status: purchase.status as Purchase['status'],
        notes: purchase.notes,
        purchaseOrderId: purchase.purchase_order_id || purchase.id,
      }));

      setPurchases(mappedPurchases);

      const ordersMap = new Map<string, PurchaseOrder>();
      mappedPurchases.forEach(purchase => {
        const orderId = purchase.purchaseOrderId!;
        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, {
            id: orderId,
            supplier: purchase.supplier,
            date: purchase.date,
            status: purchase.status,
            notes: purchase.notes,
            items: [],
            totalAmount: 0
          });
        }
        const order = ordersMap.get(orderId)!;
        order.items.push(purchase);
        order.totalAmount += parseFloat(purchase.totalAmount.replace('৳', '').replace(',', ''));
      });

      const orders = Array.from(ordersMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPurchaseOrders(orders);
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
    }
  };

  const updateProductStock = async (productId: string, quantityChange: number) => {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (error || !data) {
      console.error('Error fetching product for stock update:', error);
      return;
    }

    const updatedStock = (data.stock || 0) + quantityChange;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: updatedStock })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating stock:', updateError);
    }
  };

  const addPurchaseOrder = async (orderData: {
    supplier: string;
    status: Purchase['status'];
    notes?: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) => {
    try {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const purchaseOrderId = `PO${timestamp}${random}`;

      const purchasePromises = orderData.items.map(async (item, index) => {
        const purchaseId = `${purchaseOrderId}-${index + 1}`;
        const totalAmount = item.quantity * item.unitPrice;

        const newPurchase = {
          id: purchaseId,
          purchase_order_id: purchaseOrderId,
          product_id: item.productId,
          product_name: item.productName,
          supplier: orderData.supplier,
          quantity: item.quantity,
          unit_price: `${item.unitPrice.toFixed(2)}`,
          total_amount: `${totalAmount.toFixed(2)}`,
          date: new Date().toISOString().split('T')[0],
          status: orderData.status,
          notes: orderData.notes || null
        };

        await supabase.from('purchases').insert([newPurchase]);
        await updateProductStock(item.productId, item.quantity);
      });

      await Promise.all(purchasePromises);
      await fetchPurchases();
      return purchaseOrderId;
    } catch (error) {
      console.error('Error in addPurchaseOrder:', error);
      throw error;
    }
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id'>) => {
    try {
      const uniqueId = `PUR${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const newPurchase = {
        id: uniqueId,
        product_id: purchaseData.productId,
        product_name: purchaseData.productName,
        supplier: purchaseData.supplier,
        quantity: purchaseData.quantity,
        unit_price: purchaseData.unitPrice,
        total_amount: purchaseData.totalAmount,
        date: purchaseData.date,
        status: purchaseData.status,
        notes: purchaseData.notes || null,
        purchase_order_id: purchaseData.purchaseOrderId || null
      };

      await supabase.from('purchases').insert([newPurchase]);
      await updateProductStock(purchaseData.productId, purchaseData.quantity);
      await fetchPurchases();
      return newPurchase;
    } catch (error) {
      console.error('Error in addPurchase:', error);
      throw error;
    }
  };

  const updatePurchase = async (id: string, updates: Partial<Purchase>) => {
    try {
      const dbUpdates: any = {
        product_id: updates.productId,
        product_name: updates.productName,
        supplier: updates.supplier,
        quantity: updates.quantity,
        unit_price: updates.unitPrice,
        total_amount: updates.totalAmount,
        date: updates.date,
        status: updates.status,
        notes: updates.notes,
        purchase_order_id: updates.purchaseOrderId
      };
    console.log(dbUpdates);
      await supabase.from('purchases').update(dbUpdates).eq('id', id);
      await updateProductStock(updates.productId!, updates.quantity || 0);
      await fetchPurchases();
    } catch (error) {
      console.error('Error in updatePurchase:', error);
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      const { data, error } = await supabase.from('purchases').select('*').eq('id', id).single();
      if (error || !data) throw error;

      await supabase.from('purchases').delete().eq('id', id);
      await updateProductStock(data.product_id, -data.quantity);
      await fetchPurchases();
    } catch (error) {
      console.error('Error in deletePurchase:', error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (purchaseOrderId: string, updates: Partial<PurchaseOrder>) => {
    try {
      console.log('Updating purchase order:', purchaseOrderId, updates);

      // Get current purchase order items
      const { data: currentItems, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('purchase_order_id', purchaseOrderId);

      if (fetchError) throw fetchError;

      // Revert stock changes for current items
      if (currentItems) {
        for (const item of currentItems) {
          await updateProductStock(item.product_id, -item.quantity);
        }
      }

      // Delete all current items
      const { error: deleteError } = await supabase
        .from('purchases')
        .delete()
        .eq('purchase_order_id', purchaseOrderId);

      if (deleteError) throw deleteError;

      // Add new items if provided
      if (updates.items && updates.items.length > 0) {
        const insertPromises = updates.items.map(async (item, index) => {
          const purchaseId = item.id.startsWith('new-') ? `${purchaseOrderId}-${index + 1}` : item.id;
          
          const newPurchase = {
            id: purchaseId,
            purchase_order_id: purchaseOrderId,
            product_id: item.productId,
            product_name: item.productName,
            supplier: updates.supplier || item.supplier,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_amount: item.totalAmount,
            date: updates.date || new Date().toISOString().split('T')[0],
            status: updates.status || 'Pending',
            notes: updates.notes || null
          };

          await supabase.from('purchases').insert([newPurchase]);
          
          // Update stock for new items
          const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity);
          await updateProductStock(item.productId, quantity);
        });

        await Promise.all(insertPromises);
      }

      await fetchPurchases();
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  };

  const clearAllPurchases = async () => {
    try {
      const { error } = await supabase.from('purchases').delete().neq('id', '');
      if (error) throw error;
      setPurchases([]);
      setPurchaseOrders([]);
    } catch (error) {
      console.error('Error in clearAllPurchases:', error);
      throw error;
    }
  };

  return {
    purchases,
    purchaseOrders,
    addPurchase,
    addPurchaseOrder,
    updatePurchase,
    updatePurchaseOrder,
    deletePurchase,
    clearAllPurchases,
    fetchPurchases
  };
};
