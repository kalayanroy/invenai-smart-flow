
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Purchase } from '@/hooks/usePurchases';

interface CreatePurchaseReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseItem: Purchase | null;
  onReturnCreated: (returnData: any) => void;
}

export const CreatePurchaseReturnDialog = ({ 
  open, 
  onOpenChange, 
  purchaseItem, 
  onReturnCreated 
}: CreatePurchaseReturnDialogProps) => {
  const [formData, setFormData] = useState({
    returnQuantity: 1,
    reason: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseItem) return;

    const unitPriceNum = parseFloat(purchaseItem.unitPrice.replace(/[৳$,]/g, '')) || 0;
    const totalRefund = unitPriceNum * formData.returnQuantity;

    const returnData = {
      purchaseOrderId: purchaseItem.purchaseOrderId || purchaseItem.id,
      purchaseItemId: purchaseItem.id,
      productId: purchaseItem.productId,
      productName: purchaseItem.productName,
      supplier: purchaseItem.supplier,
      originalQuantity: purchaseItem.quantity,
      returnQuantity: formData.returnQuantity,
      unitPrice: purchaseItem.unitPrice,
      totalRefund: `৳${totalRefund.toFixed(2)}`,
      returnDate: new Date().toISOString().split('T')[0],
      reason: formData.reason,
      notes: formData.notes,
      status: 'Pending' as const
    };

    onReturnCreated(returnData);
    onOpenChange(false);
    setFormData({ returnQuantity: 1, reason: '', notes: '' });
  };

  if (!purchaseItem) return null;

  const unitPriceNum = parseFloat(purchaseItem.unitPrice.replace(/[৳$,]/g, '')) || 0;
  const refundAmount = unitPriceNum * formData.returnQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Return</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Purchase Item Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Purchase Item Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Product:</span>
                <div className="font-medium">{purchaseItem.productName}</div>
              </div>
              <div>
                <span className="text-gray-600">SKU:</span>
                <div className="font-mono">{purchaseItem.productId}</div>
              </div>
              <div>
                <span className="text-gray-600">Supplier:</span>
                <div>{purchaseItem.supplier}</div>
              </div>
              <div>
                <span className="text-gray-600">Original Quantity:</span>
                <div>{purchaseItem.quantity}</div>
              </div>
              <div>
                <span className="text-gray-600">Unit Price:</span>
                <div className="font-medium">{purchaseItem.unitPrice}</div>
              </div>
              <div>
                <span className="text-gray-600">Purchase Date:</span>
                <div>{new Date(purchaseItem.date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnQuantity">Return Quantity</Label>
            <Input
              id="returnQuantity"
              type="number"
              min="1"
              max={purchaseItem.quantity}
              value={formData.returnQuantity}
              onChange={(e) => setFormData(prev => ({ ...prev, returnQuantity: parseInt(e.target.value) || 1 }))}
              required
            />
            <div className="text-sm text-gray-500">
              Max: {purchaseItem.quantity} (purchased quantity)
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total Refund Amount</Label>
            <div className="p-2 bg-blue-50 rounded border font-semibold text-blue-700">
              ৳{refundAmount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Defective product">Defective product</SelectItem>
                <SelectItem value="Wrong product delivered">Wrong product delivered</SelectItem>
                <SelectItem value="Damaged in shipping">Damaged in shipping</SelectItem>
                <SelectItem value="Quality issues">Quality issues</SelectItem>
                <SelectItem value="Surplus stock">Surplus stock</SelectItem>
                <SelectItem value="Supplier error">Supplier error</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional details about the return..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Return Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
