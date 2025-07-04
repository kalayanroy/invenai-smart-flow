
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Package, DollarSign, RotateCcw, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePurchaseReturns } from '@/hooks/usePurchaseReturns';
import { usePurchases } from '@/hooks/usePurchases';
import { CreatePurchaseReturnDialog } from './CreatePurchaseReturnDialog';
import { ViewPurchaseReturnDialog } from './ViewPurchaseReturnDialog';
import { EditPurchaseReturnDialog } from './EditPurchaseReturnDialog';

export const PurchaseReturnSection = () => {
  const { toast } = useToast();
  const { purchaseReturns, addPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn } = usePurchaseReturns();
  const { purchases } = usePurchases();
  const [showCreateReturn, setShowCreateReturn] = useState(false);
  const [showViewReturn, setShowViewReturn] = useState(false);
  const [showEditReturn, setShowEditReturn] = useState(false);
  const [selectedPurchaseItem, setSelectedPurchaseItem] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processed': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalReturns = purchaseReturns.length;
  const totalRefundAmount = purchaseReturns.reduce((sum, returnItem) => {
    const amount = parseFloat(returnItem.totalRefund.replace(/[৳$,]/g, '')) || 0;
    return sum + amount;
  }, 0);
  const pendingReturns = purchaseReturns.filter(r => r.status === 'Pending').length;

  const handleCreateReturn = (purchaseItem: any) => {
    setSelectedPurchaseItem(purchaseItem);
    setShowCreateReturn(true);
  };

  const handleReturnCreated = async (returnData: any) => {
    try {
      await addPurchaseReturn(returnData);
      toast({
        title: "Return Request Created",
        description: "The purchase return request has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create return request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewReturn = (returnItem: any) => {
    setSelectedReturn(returnItem);
    setShowViewReturn(true);
  };

  const handleEditReturn = (returnItem: any) => {
    setSelectedReturn(returnItem);
    setShowEditReturn(true);
  };

  const handleReturnUpdated = async (id: string, updates: any) => {
    try {
      await updatePurchaseReturn(id, updates);
      toast({
        title: "Return Updated",
        description: "The purchase return has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReturn = async (returnItem: any) => {
    if (window.confirm(`Are you sure you want to delete return ${returnItem.id}?`)) {
      try {
        await deletePurchaseReturn(returnItem.id);
        toast({
          title: "Return Deleted",
          description: `Return ${returnItem.id} has been deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete return. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Purchase Returns Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold">{totalReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold">৳{totalRefundAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Returns</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Purchase Items for Return */}
      <Card>
        <CardHeader>
          <CardTitle>Available Purchase Items for Return</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 10).map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{purchase.productName}</div>
                        <div className="text-sm text-gray-500">{purchase.productId}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{purchase.supplier}</td>
                    <td className="py-4 px-4">{purchase.quantity}</td>
                    <td className="py-4 px-4">{purchase.unitPrice}</td>
                    <td className="py-4 px-4">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateReturn(purchase)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Return
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {purchases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No purchase items available for returns.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Returns ({totalReturns})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Return ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Refund</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseReturns.map((returnItem) => (
                  <tr key={returnItem.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-sm">{returnItem.id}</td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{returnItem.productName}</div>
                        <div className="text-sm text-gray-500">{returnItem.productId}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{returnItem.supplier}</td>
                    <td className="py-4 px-4">
                      <span className="text-red-600 font-medium">{returnItem.returnQuantity}</span>
                      <span className="text-gray-500">/{returnItem.originalQuantity}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-green-600">{returnItem.totalRefund}</td>
                    <td className="py-4 px-4">{returnItem.reason}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">{new Date(returnItem.returnDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReturn(returnItem)}
                          title="View Return"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReturn(returnItem)}
                          title="Edit Return"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReturn(returnItem)}
                          title="Delete Return"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {purchaseReturns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No purchase returns found. Create your first return request to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePurchaseReturnDialog
        open={showCreateReturn}
        onOpenChange={setShowCreateReturn}
        purchaseItem={selectedPurchaseItem}
        onReturnCreated={handleReturnCreated}
      />

      <ViewPurchaseReturnDialog
        open={showViewReturn}
        onOpenChange={setShowViewReturn}
        purchaseReturn={selectedReturn}
      />

      <EditPurchaseReturnDialog
        open={showEditReturn}
        onOpenChange={setShowEditReturn}
        purchaseReturn={selectedReturn}
        onReturnUpdated={handleReturnUpdated}
      />
    </div>
  );
};
