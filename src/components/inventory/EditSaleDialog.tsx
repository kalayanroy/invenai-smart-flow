import React, { useState, useEffect } from 'react';
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

interface EditSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaleUpdated: (id: string, updates: Partial<Sale>) => void;
}

export const EditSaleDialog = ({ open, onOpenChange, sale, onSaleUpdated }: EditSaleDialogProps) => {
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

  // Calculate actual available stock using: Opening Stock + Total Purchase + Total Return - Total Sales (excluding current sale)
  const getCalculatedStock = (productId: string, excludeSaleId?: string) => {
    const product = products.find(p => p.id === productId);
    const productSales = sales.filter(s => s.productId === productId && s.id !== excludeSaleId);
    const productPurchases = purchases.filter(purchase => purchase.productId === productId);
    const productReturns = salesReturns.filter(returnItem => returnItem.productId === productId);
    
    const openingStock = product?.openingStock || 0;
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalPurchased = productPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalReturned = productReturns.reduce((sum, returnItem) => sum + returnItem.returnQuantity, 0);
    
    return openingStock + totalPurchased + totalReturned - totalSold;
  };

  useEffect(() => {
    if (sale) {
      setFormData({
        productId: sale.productId,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice.replace(/[$৳]/g, ''),
        customerName: sale.customerName || '',
        status: sale.status,
        notes: sale.notes || ''
      });
    }
  }, [sale]);

  if (!sale) return null;

  const selectedProduct = products.find(p => p.id === formData.productId);
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const totalAmount = unitPrice * formData.quantity;
  
  // Calculate available stock excluding the current sale being edited
  const availableStock = getCalculatedStock(formData.productId, sale.id);
  const isQuantityValid = formData.quantity <= availableStock;

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId,
        unitPrice: product.sellPrice.replace(/[$৳]/g, '')
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

    if (!isQuantityValid || !formData.productId) return;

    const updates: Partial<Sale> = {
      productId: formData.productId,
      productName: selectedProduct?.name || '',
      quantity: formData.quantity,
      unitPrice: `${unitPrice.toFixed(2)}`,
      totalAmount: `${totalAmount.toFixed(2)}`,
      customerName: formData.customerName,
      status: formData.status,
      notes: formData.notes
    };

    onSaleUpdated(sale.id, updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Sale - {sale.id}</DialogTitle>
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
                  <span className="text-xs text-gray-500 ml-1">
                    (calculated stock excluding this sale)
                  </span>
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
              />
              {!isQuantityValid && (
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
              Update Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
