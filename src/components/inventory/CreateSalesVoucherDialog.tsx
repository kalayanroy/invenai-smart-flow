import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useSalesReturns } from '@/hooks/useSalesReturns';
import { useSalesVouchers, SalesVoucherItem } from '@/hooks/useSalesVouchers';

interface CreateSalesVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoucherCreated: (voucherData: any) => void;
}

export const CreateSalesVoucherDialog = ({ open, onOpenChange, onVoucherCreated }: CreateSalesVoucherDialogProps) => {
  const { products, fetchProducts } = useProducts();
const { sales, fetchSales } = useSales();
const { purchases, fetchPurchases } = usePurchases();
const { salesReturns, fetchSalesReturns } = useSalesReturns();
const { salesVouchers, fetchSalesVouchers } = useSalesVouchers();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [formData, setFormData] = useState({
    voucherNumber: `SV${Date.now()}`,
    customerName: '',
    paymentMethod: 'Cash',
    status: 'Completed',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    discountAmount: 0,
  });

  // Calculate actual available stock using: Opening Stock + Total Purchase + Total Return - Total Sales - Total Sales Voucher Sales
  const getCalculatedStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const productSales = sales.filter(sale => sale.productId === productId);
    const productPurchases = purchases.filter(purchase => purchase.productId === productId);
    const productReturns = salesReturns.filter(returnItem => returnItem.productId === productId);
    
    // Get sales from vouchers
    const voucherSales = salesVouchers.flatMap(voucher => 
      voucher.items.filter(item => item.productId === productId)
    );
    
    const openingStock = product?.openingStock || 0;
    const totalSold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalPurchased = productPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalReturned = productReturns.reduce((sum, returnItem) => sum + returnItem.returnQuantity, 0);
    const totalVoucherSold = voucherSales.reduce((sum, item) => sum + item.quantity, 0);
    
    return openingStock + totalPurchased + totalReturned - totalSold - totalVoucherSold;
  };

  const [items, setItems] = useState<SalesVoucherItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }
  ]);

  // Recalculate totals whenever items or discount changes
  useEffect(() => {
    const newItems = items.map(item => ({
      ...item,
      totalAmount: item.quantity * item.unitPrice
    }));
    setItems(newItems);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof SalesVoucherItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = parseFloat(product.sellPrice.replace('৳', '').replace(',', ''));
      }
    }
    
    // Always recalculate total amount when quantity or unit price changes
    newItems[index].totalAmount = newItems[index].quantity * newItems[index].unitPrice;
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const finalAmount = totalAmount - formData.discountAmount;
    return { totalAmount, finalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid item');
      return;
    }

    // Check stock availability
    for (const item of validItems) {
      const product = products.find(p => p.id === item.productId);
      const availableStock = item.productId ? getCalculatedStock(item.productId) : 0;
      if (product && availableStock < item.quantity) {
        alert(`Insufficient stock for ${item.productName}. Available: ${availableStock}, Required: ${item.quantity}`);
        return;
      }
    }

    const { totalAmount, finalAmount } = calculateTotals();
    
    const voucherData = {
      ...formData,
      items: validItems,
      totalAmount,
      finalAmount
    };

    try {
      await onVoucherCreated(voucherData);
      
      // Automatically refresh products to update stock calculations
      //await fetchProducts();
       // ✅ Add missing fetches here
  await Promise.all([
    fetchProducts(),
    fetchSales?.(),
    fetchPurchases?.(),
    fetchSalesReturns?.(),
    fetchSalesVouchers?.(),
  ]);
      setRefreshKey(prev => prev + 1); // triggers rerender
      // Reset form
      setFormData({
        voucherNumber: `SV${Date.now()}`,
        customerName: '',
        paymentMethod: 'Cash',
        status: 'Completed',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        discountAmount: 0
      });
      setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('Error creating voucher. Please try again.');
    }
  };

  const { totalAmount, finalAmount } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Voucher</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voucherNumber">Voucher Number</Label>
              <Input
                id="voucherNumber"
                value={formData.voucherNumber}
                onChange={(e) => handleInputChange('voucherNumber', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Walk-in Customer"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-medium">Items</Label>
              <Button type="button" onClick={addItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Product</Label>
                    <Select  key={refreshKey} value={item.productId} onValueChange={(value) => handleItemChange(index, 'productId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Stock: {getCalculatedStock(product.id)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>Unit Price (৳)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>Total Amount</Label>
                    <Input
                      type="number"
                      value={item.totalAmount.toFixed(2)}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="discountAmount">Discount Amount (৳)</Label>
              <Input
                id="discountAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountAmount}
                onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                value={totalAmount.toFixed(2)}
                readOnly
                className="bg-gray-100 font-semibold"
              />
            </div>
            
            <div>
              <Label>Final Amount</Label>
              <Input
                type="number"
                value={finalAmount.toFixed(2)}
                readOnly
                className="bg-gray-100 font-bold text-green-600"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Sales Voucher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
