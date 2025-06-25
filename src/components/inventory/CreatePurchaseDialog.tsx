import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Purchase } from '@/hooks/usePurchases';

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface CreatePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseCreated: (orderData: { 
    supplier: string; 
    status: Purchase['status']; 
    notes?: string; 
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) => void;
}

export const CreatePurchaseDialog = ({ open, onOpenChange, onPurchaseCreated }: CreatePurchaseDialogProps) => {
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    supplier: '',
    status: 'Ordered' as Purchase['status'],
    notes: ''
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
    console.log(items);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].unitPrice = parseFloat(product.purchasePrice.replace('৳', '')) || 0;
        // Automatically calculate total amount when product is selected
        updatedItems[index].totalAmount = updatedItems[index].quantity * updatedItems[index].unitPrice;
        console.log(updatedItems[index].unitPrice);
        console.log(updatedItems[index].totalAmount);
      }
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalAmount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out items that don't have a product selected
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    
    if (validItems.length === 0) {
      return;
    }

    console.log('Submitting purchase order with items:', validItems);
    
    // Create purchase order data
    const orderData = {
      supplier: formData.supplier,
      status: formData.status,
      notes: formData.notes,
      items: validItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    console.log('Purchase order data:', orderData);
    onPurchaseCreated(orderData);

    onOpenChange(false);
    setFormData({
      supplier: '',
      status: 'Ordered',
      notes: ''
    });
    setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
  };

  const isFormValid = items.some(item => item.productId && item.quantity > 0) && formData.supplier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Purchase['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-medium">Items</Label>
              <Button type="button" onClick={addItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Product *</Label>
                      <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.purchasePrice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Amount</Label>
                      <div className="p-2 bg-gray-50 rounded border font-medium">
                        ৳{item.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Purchase Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Purchase Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Items:</span> {items.filter(item => item.productId).length}
                </div>
                <div>
                  <span className="text-gray-600">Total Quantity:</span> {items.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div className="col-span-2 text-lg font-semibold">
                  <span className="text-gray-600">Grand Total:</span> ৳{getTotalAmount().toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this purchase..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Create Purchase Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
