import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, DollarSign, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePurchases, Purchase, PurchaseOrder } from '@/hooks/usePurchases';
import { CreatePurchaseDialog } from './CreatePurchaseDialog';
import { ViewPurchaseDialog } from './ViewPurchaseDialog';
import { EditPurchaseDialog } from './EditPurchaseDialog';
import { PurchaseOrderFiltersComponent, PurchaseOrderFilters } from './PurchaseOrderFilters';
import { generatePurchaseInvoicePDF } from '@/utils/pdfGenerator';
import {generatePInvoicePDF} from '@/utils/pdfGenerator';
import { PurchaseReturnSection } from './PurchaseReturnSection';

export const PurchaseSection = () => {
  const { toast } = useToast();
  const { purchases, purchaseOrders, addPurchaseOrder, updatePurchase, deletePurchase, updatePurchaseOrder } = usePurchases();
  const [showCreatePurchase, setShowCreatePurchase] = useState(false);
  const [showViewPurchase, setShowViewPurchase] = useState(false);
  const [showEditPurchase, setShowEditPurchase] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Filter state for purchase orders
  const [orderFilters, setOrderFilters] = useState<PurchaseOrderFilters>({
    orderId: '',
    supplier: '',
    dateFrom: null,
    dateTo: null
  });

  // Filtered purchase orders
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      // Order ID filter
      if (orderFilters.orderId && 
          !order.id.toLowerCase().includes(orderFilters.orderId.toLowerCase())) {
        return false;
      }

      // Supplier filter
      if (orderFilters.supplier && 
          !order.supplier.toLowerCase().includes(orderFilters.supplier.toLowerCase())) {
        return false;
      }

      // Date from filter
      if (orderFilters.dateFrom) {
        const orderDate = new Date(order.date);
        const filterDateFrom = new Date(orderFilters.dateFrom);
        if (orderDate < filterDateFrom) {
          return false;
        }
      }

      // Date to filter
      if (orderFilters.dateTo) {
        const orderDate = new Date(order.date);
        const filterDateTo = new Date(orderFilters.dateTo);
        if (orderDate > filterDateTo) {
          return false;
        }
      }

      return true;
    });
  }, [purchaseOrders, orderFilters]);

  const handleClearOrderFilters = () => {
    setOrderFilters({
      orderId: '',
      supplier: '',
      dateFrom: null,
      dateTo: null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ordered': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPurchases = filteredPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const handlePurchaseCreated = (orderData: any) => {
    addPurchaseOrder(orderData);
    toast({
      title: "Purchase Order Created",
      description: "The purchase order has been created successfully.",
    });
  };

  const handleViewPurchase = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setShowViewPurchase(true);
  };

  const handleEditPurchase = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setShowEditPurchase(true);
  };

  const handlePurchaseUpdated = (orderId: string, updates: any) => {
    updatePurchaseOrder(orderId, updates);
    toast({
      title: "Purchase Order Updated",
      description: `Purchase order ${orderId} has been updated successfully.`,
    });
  };

  const handleDeletePurchase = (purchaseOrder: PurchaseOrder) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${purchaseOrder.id}?`)) {
      // Delete all items in the purchase order
      purchaseOrder.items.forEach(item => {
        deletePurchase(item.id);
      });
      toast({
        title: "Purchase Order Deleted",
        description: `Purchase order ${purchaseOrder.id} has been deleted.`,
      });
    }
  };

  const handlePrintInvoice = (order: any) => {
    // Create a comprehensive purchase object for the PDF generator with all items
    const purchaseForPDF = {
      id: order.id,
      productId: order.items.map(item => item.productId).join(', '),
      productName: order.items.map(item => item.productName).join(', '),
      supplier: order.supplier,
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      unitPrice: `৳${(order.totalAmount / order.items.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2)}`,
      totalAmount: `৳${order.totalAmount.toFixed(2)}`,
      date: order.date,
      status: order.status,
      notes: order.notes,
      purchaseOrderId: order.id,
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.replace('৳', '').replace(',', '')),
        totalAmount: parseFloat(item.totalAmount.replace('৳', '').replace(',', ''))
      }))
    };
    console.log(purchaseForPDF);
    generatePInvoicePDF(purchaseForPDF);
    toast({
      title: "Purchase Order Generated",
      description: `Purchase order for ${order.id} has been generated.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'returns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Returns
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <>
          {/* Purchase Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Purchase Orders</p>
                    <p className="text-2xl font-bold">{filteredPurchaseOrders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Purchase Cost</p>
                    <p className="text-2xl font-bold">৳{totalPurchases.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Items Purchased</p>
                    <p className="text-2xl font-bold">
                      {filteredPurchaseOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Order Filters */}
          <PurchaseOrderFiltersComponent
            filters={orderFilters}
            onFiltersChange={setOrderFilters}
            onClearFilters={handleClearOrderFilters}
          />

          {/* Purchase Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Purchase Orders ({filteredPurchaseOrders.length} of {purchaseOrders.length} order{purchaseOrders.length !== 1 ? 's' : ''})
                </CardTitle>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowCreatePurchase(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Purchase Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total Qty</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchaseOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono">{order.id}</td>
                        <td className="py-4 px-4 text-sm">{order.supplier}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {order.items.length} item(s)
                            <div className="text-xs text-gray-500">
                              {order.items.slice(0, 2).map(item => item.productName).join(', ')}
                              {order.items.length > 2 && '...'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                        <td className="py-4 px-4 font-semibold">৳{order.totalAmount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewPurchase(order)}
                              title="View Purchase Order"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditPurchase(order)}
                              title="Edit Purchase Order"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePrintInvoice(order)}
                              title="Print Purchase Order"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeletePurchase(order)}
                              title="Delete Purchase Order"
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
              
              {filteredPurchaseOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {purchaseOrders.length === 0 ? (
                    <p>No purchase orders found. Create your first purchase order to get started.</p>
                  ) : (
                    <p>No orders match your current filters. Try adjusting the filter criteria.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialogs */}
          <CreatePurchaseDialog
            open={showCreatePurchase}
            onOpenChange={setShowCreatePurchase}
            onPurchaseCreated={handlePurchaseCreated}
          />

          <ViewPurchaseDialog
            open={showViewPurchase}
            onOpenChange={setShowViewPurchase}
            purchaseOrder={selectedPurchaseOrder}
          />

          <EditPurchaseDialog
            open={showEditPurchase}
            onOpenChange={setShowEditPurchase}
            purchaseOrder={selectedPurchaseOrder}
            onPurchaseUpdated={handlePurchaseUpdated}
          />
        </>
      )}

      {activeTab === 'returns' && <PurchaseReturnSection />}
    </div>
  );
};
