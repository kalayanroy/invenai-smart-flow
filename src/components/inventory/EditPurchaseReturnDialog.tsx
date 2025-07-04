
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseReturn } from '@/hooks/usePurchaseReturns';

interface EditPurchaseReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseReturn: PurchaseReturn | null;
  onReturnUpdated: (id: string, updates: Partial<PurchaseReturn>) => void;
}

export const EditPurchaseReturnDialog = ({ 
  open, 
  onOpenChange, 
  purchaseReturn, 
  onReturnUpdated 
}: EditPurchaseReturnDialogProps) => {
  const [formData, setFormData] = useState({
    returnQuantity: 1,
    reason: '',
    notes: '',
    status: 'Pending' as PurchaseReturn['status'],
    processedBy: '',
    processedDate: ''
  });

  useEffect(() => {
    if (purchaseReturn) {
      setFormData({
        returnQuantity: purchaseReturn.returnQuantity,
        reason: purchaseReturn.reason,
        notes: purchaseReturn.notes || '',
        status: purchaseReturn.status,
        processedBy: purchaseReturn.processedBy || '',
        processedDate: purchaseReturn.processedDate || ''
      });
    }
  }, [purchaseReturn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseReturn) return;

    const unitPriceNum = parseFloat(purchaseReturn.unitPrice.replace(/[৳$,]/g, '')) || 0;
    const totalRefund = unitPriceNum * formData.returnQuantity;

    const updates = {
      ...formData,
      totalRefund: `৳${totalRefund.toFixed(2)}`,
      processedDate: formData.status === 'Processed' && !formData.processedDate 
        ? new Date().toISOString().split('T')[0] 
        : formData.processedDate
    };

    onReturnUpdated(purchaseReturn.id, updates);
    onOpenChange(false);
  };

  if (!purchaseReturn) return null;

  const unitPriceNum = parseFloat(purchaseReturn.unitPrice.replace(/[৳$,]/g, '')) || 0;
  const refundAmount = unitPriceNum * formData.returnQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Purchase Return - {purchaseReturn.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Information (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Product Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Product:</span>
                <div className="font-medium">{purchaseReturn.productName}</div>
              </div>
              <div>
                <span className="text-gray-600">SKU:</span>
                <div className="font-mono">{purchaseReturn.productId}</div>
              </div>
              <div>
                <span className="text-gray-600">Supplier:</span>
                <div>{purchaseReturn.supplier}</div>
              </div>
              <div>
                <span className="text-gray-600">Original Quantity:</span>
                <div>{purchaseReturn.originalQuantity}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="returnQuantity">Return Quantity</Label>
              <Input
                id="returnQuantity"
                type="number"
                min="1"
                max={purchaseReturn.originalQuantity}
                value={formData.returnQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, returnQuantity: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PurchaseReturn['status'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Processed">Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total Refund Amount</Label>
            <div className="p-2 bg-green-50 rounded border font-semibold text-green-700">
              ৳{refundAmount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger>
                <SelectValue />
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

          {formData.status === 'Processed' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processedBy">Processed By</Label>
                <Input
                  id="processedBy"
                  value={formData.processedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, processedBy: e.target.value }))}
                  placeholder="Enter processor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processedDate">Processed Date</Label>
                <Input
                  id="processedDate"
                  type="date"
                  value={formData.processedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, processedDate: e.target.value }))}
                />
              </div>
            </div>
          )}

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
              Update Return
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
