
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, Check } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProducts } from '@/hooks/useProducts';
import { Purchase } from '@/hooks/usePurchases';
import { cn } from '@/lib/utils';

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
  const { products, loadMoreProducts, hasMore, loading } = useProducts();
  const [formData, setFormData] = useState({
    supplier: '',
    status: 'Ordered' as Purchase['status'],
    notes: ''
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }
  ]);

  // Enhanced product dropdown states
  const [openProductSelectors, setOpenProductSelectors] = useState<boolean[]>([false]);
  const [dropdownSearchTerms, setDropdownSearchTerms] = useState<string[]>(['']);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
    setOpenProductSelectors([...openProductSelectors, false]);
    setDropdownSearchTerms([...dropdownSearchTerms, '']);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setOpenProductSelectors(openProductSelectors.filter((_, i) => i !== index));
      setDropdownSearchTerms(dropdownSearchTerms.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total amount whenever quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const totalAmount = updatedItems[index].quantity * updatedItems[index].unitPrice;
      updatedItems[index].totalAmount = totalAmount;
      console.log('Total amount calculated:', totalAmount, 'for item:', index);
    }
    
    setItems(updatedItems);
  };

  // Enhanced product selection with dropdown search
  const handleProductSelect = (index: number, product: any) => {
    console.log('Product selected in dialog:', { productId: product.id, product });
    
    const updatedItems = [...items];
    const priceString = product.purchasePrice.replace(/[^\d.-]/g, '');
    const unitPrice = parseFloat(priceString) || 0;
    
    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.id,
      productName: product.name,
      unitPrice: unitPrice
    };
    
    // Recalculate total amount
    const totalAmount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    updatedItems[index].totalAmount = totalAmount;
    
    console.log('Updated item:', updatedItems[index]);
    setItems(updatedItems);
    
    // Close dropdown and clear search
    const newOpenStates = [...openProductSelectors];
    newOpenStates[index] = false;
    setOpenProductSelectors(newOpenStates);
    
    const newSearchTerms = [...dropdownSearchTerms];
    newSearchTerms[index] = '';
    setDropdownSearchTerms(newSearchTerms);
  };

  const setProductSelectorOpen = (index: number, open: boolean) => {
    const newOpenStates = [...openProductSelectors];
    newOpenStates[index] = open;
    setOpenProductSelectors(newOpenStates);
  };

  const setDropdownSearchTerm = (index: number, term: string) => {
    const newSearchTerms = [...dropdownSearchTerms];
    newSearchTerms[index] = term;
    setDropdownSearchTerms(newSearchTerms);
  };

  // Filter products for dropdown based on search term
  const getFilteredProducts = (index: number) => {
    const searchTerm = dropdownSearchTerms[index];
    if (!searchTerm.trim()) return products.slice(0, 10); // Show first 10 if no search
    
    const searchLower = searchTerm.toLowerCase().trim();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower))
    ).slice(0, 10); // Limit to 10 results for performance
  };

  const getTotalAmount = () => {
    const total = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    console.log('Grand total calculated:', total);
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(item => item.productId && item.quantity > 0);
    
    if (validItems.length === 0) {
      alert('Please add at least one valid item');
      return;
    }

    if (!formData.supplier.trim()) {
      alert('Please enter supplier name');
      return;
    }

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

    console.log('Submitting purchase order:', orderData);
    onPurchaseCreated(orderData);

    onOpenChange(false);
    setFormData({
      supplier: '',
      status: 'Ordered',
      notes: ''
    });
    setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
    setOpenProductSelectors([false]);
    setDropdownSearchTerms(['']);
  };

  const isFormValid = items.some(item => item.productId && item.quantity > 0) && formData.supplier.trim();

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
                      <Popover open={openProductSelectors[index]} onOpenChange={(open) => setProductSelectorOpen(index, open)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProductSelectors[index]}
                            className="w-full justify-between h-10"
                          >
                            {item.productName || "Search products by name, SKU, or barcode..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search products..." 
                              value={dropdownSearchTerms[index]}
                              onValueChange={(value) => setDropdownSearchTerm(index, value)}
                            />
                            <CommandList className="max-h-60 overflow-y-auto">
                              <CommandEmpty>
                                {loading ? "Loading products..." : "No product found."}
                              </CommandEmpty>
                              <CommandGroup>
                                {getFilteredProducts(index).map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={`${product.name}-${product.id}`}
                                    onSelect={() => handleProductSelect(index, product)}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        item.productId === product.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{product.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        SKU: {product.sku} | Stock: {product.stock} | {product.category}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
