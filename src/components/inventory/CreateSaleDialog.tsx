import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductSelector } from './ProductSelector';
import { Sale } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useSalesReturns } from '@/hooks/useSalesReturns';

interface CreateSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleCreated: (saleData: Omit<Sale, 'id'>) => void;
}

export const CreateSaleDialog = ({ open, onOpenChange, onSaleCreated }: CreateSaleDialogProps) => {
  const { products, loadMoreProducts, hasMore } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const { salesReturns } = useSalesReturns();
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    unitPrice: '',
    customerName: '',
    status: 'Completed' as Sale['status'],
    notes: ''
  });

  // Calculate available stock using: Opening Stock + Total Purchase + Total Return - Total Sales
  const getCalculatedStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const productSales = sales.filter(s => s.productId === productId);
    const productPurchases = purchases.filter(purchase => purchase.productId === productId);
    const productReturns = salesReturns.filter(returnItem => returnItem.productId === productId);
    
    const openingStock = product?.openingStock || 0;
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalPurchased = productPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalReturned = productReturns.reduce((sum, returnItem) => sum + returnItem.returnQuantity, 0);
    
    return openingStock + totalPurchased + totalReturned - totalSold;
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const totalAmount = unitPrice * formData.quantity;
  const availableStock = formData.productId ? getCalculatedStock(formData.productId) : 0;
  const isQuantityValid = formData.quantity <= availableStock;

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId,
        unitPrice: product.sellPrice.replace(/[$৳]/g, ''),
        quantity: 1 // Reset quantity when product changes
      });
    }
  };

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    setFormData({
      ...formData,
      quantity: Math.min(newQuantity, availableStock) // Limit to available stock
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isQuantityValid || !formData.productId || !selectedProduct) return;

    const saleData: Omit<Sale, 'id'> = {
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity: formData.quantity,
      unitPrice: `${unitPrice.toFixed(2)}`,
      totalAmount: `${totalAmount.toFixed(2)}`,
      date: new Date().toISOString().split('T')[0],
      status: formData.status,
      customerName: formData.customerName,
      notes: formData.notes
    };

    onSaleCreated(saleData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      productId: '',
      quantity: 1,
      unitPrice: '',
      customerName: '',
      status: 'Completed',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <ProductSelector
                products={products}
                selectedProductId={formData.productId}
                onProductSelect={handleProductSelect}
                open={productSelectorOpen}
                onOpenChange={setProductSelectorOpen}
                loadMoreProducts={loadMoreProducts}
                hasMore={hasMore}
              />
              {selectedProduct && (
                <div className="text-sm text-gray-600">
                  Available Stock: <span className="font-medium">{availableStock}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={availableStock}
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                className={!isQuantityValid ? 'border-red-500' : ''}
                disabled={!formData.productId}
              />
              {!isQuantityValid && formData.productId && (
                <p className="text-sm text-red-600">
                  Quantity cannot exceed available stock ({availableStock})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Sale['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sale Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Unit Price:</span> ৳{unitPrice.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span> {formData.quantity}
              </div>
              <div className="col-span-2 text-lg font-semibold">
                <span className="text-gray-600">Total Amount:</span> ৳{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this sale..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isQuantityValid || !formData.productId}>
              Create Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
