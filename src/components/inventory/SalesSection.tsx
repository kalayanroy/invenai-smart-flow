import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, DollarSign, ShoppingBag, Eye, Edit, Trash2, FileText, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSales, Sale } from '@/hooks/useSales';
import { useSalesVouchers, SalesVoucher } from '@/hooks/useSalesVouchers';
import { useProducts } from '@/hooks/useProducts';
import { usePurchases } from '@/hooks/usePurchases';
import { useSalesReturns } from '@/hooks/useSalesReturns';
import { CreateSaleDialog } from './CreateSaleDialog';
import { CreateSalesVoucherDialog } from './CreateSalesVoucherDialog';
import { ViewSaleDialog } from './ViewSaleDialog';
import { EditSaleDialog } from './EditSaleDialog';
import { ViewSalesVoucherDialog } from './ViewSalesVoucherDialog';
import { EditSalesVoucherDialog } from './EditSalesVoucherDialog';
import { SalesVoucherFiltersComponent, SalesVoucherFilters } from './SalesVoucherFilters';
import { generateSalesInvoicePDF } from '@/utils/pdfGenerator';
import { generateSalesVoucherPDF } from '@/utils/salesVoucherPdfGenerator';

export const SalesSection = () => {
  const { toast } = useToast();
  const { sales, addSale, updateSale, deleteSale } = useSales();
  const { salesVouchers, createSalesVoucher, updateSalesVoucher, deleteSalesVoucher } = useSalesVouchers();
  const { fetchProducts } = useProducts();
  const { fetchSales } = useSales();
  const { fetchPurchases } = usePurchases();
  const { fetchSalesReturns } = useSalesReturns();
  const { fetchSalesVouchers } = useSalesVouchers();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [showViewSale, setShowViewSale] = useState(false);
  const [showEditSale, setShowEditSale] = useState(false);
  const [showViewVoucher, setShowViewVoucher] = useState(false);
  const [showEditVoucher, setShowEditVoucher] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<SalesVoucher | null>(null);

  // Filter state for sales vouchers
  const [voucherFilters, setVoucherFilters] = useState<SalesVoucherFilters>({
    voucherNumber: '',
    customer: '',
    dateFrom: null,
    dateTo: null
  });

  // Filtered sales vouchers
  const filteredSalesVouchers = useMemo(() => {
    return salesVouchers.filter(voucher => {
      // Voucher number filter
      if (voucherFilters.voucherNumber && 
          !voucher.voucherNumber.toLowerCase().includes(voucherFilters.voucherNumber.toLowerCase())) {
        return false;
      }

      // Customer filter
      if (voucherFilters.customer && 
          !(voucher.customerName || '').toLowerCase().includes(voucherFilters.customer.toLowerCase())) {
        return false;
      }

      // Date from filter
      if (voucherFilters.dateFrom) {
        const voucherDate = new Date(voucher.date);
        const filterDateFrom = new Date(voucherFilters.dateFrom);
        if (voucherDate < filterDateFrom) {
          return false;
        }
      }

      // Date to filter
      if (voucherFilters.dateTo) {
        const voucherDate = new Date(voucher.date);
        const filterDateTo = new Date(voucherFilters.dateTo);
        if (voucherDate > filterDateTo) {
          return false;
        }
      }

      return true;
    });
  }, [salesVouchers, voucherFilters]);

  const handleClearVoucherFilters = () => {
    setVoucherFilters({
      voucherNumber: '',
      customer: '',
      dateFrom: null,
      dateTo: null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => 
    sum + parseFloat(sale.totalAmount.replace('৳', '').replace(',', '')), 0
  );

  const totalVoucherRevenue = salesVouchers.reduce((sum, voucher) => sum + voucher.finalAmount, 0);
  const grandTotalRevenue = totalRevenue + totalVoucherRevenue;

  const handleSaleCreated = (saleData: any) => {
    addSale(saleData);
    toast({
      title: "Sale Recorded",
      description: "The sale has been recorded successfully.",
    });
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowViewSale(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowEditSale(true);
  };

  const handleSaleUpdated = (id: string, updates: Partial<Sale>) => {
    updateSale(id, updates);
    toast({
      title: "Sale Updated",
      description: `Sale ${id} has been updated successfully.`,
    });
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (window.confirm(`Are you sure you want to delete sale ${sale.id}?`)) {
      deleteSale(sale.id);
      await Promise.all([
        fetchProducts(),
        fetchSales?.(),
        fetchPurchases?.(),
        fetchSalesReturns?.(),
        fetchSalesVouchers?.(),
      ]);
      setRefreshKey(prev => prev + 1);
      toast({
        title: "Sale Deleted",
        description: `Sale ${sale.id} has been deleted.`,
      });
    }
  };

  const handlePrintInvoice = (sale: Sale) => {
    generateSalesInvoicePDF(sale);
    toast({
      title: "Invoice Generated",
      description: `Sales invoice for ${sale.id} has been generated.`,
    });
  };

  const handleVoucherCreated = async (voucherData: any) => {
    try {
      await createSalesVoucher(voucherData);
      await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchSalesReturns(),
        fetchPurchases(),
      ]);

      toast({
        title: "Sales Voucher Created",
        description: "The sales voucher has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "Error",
        description: "Failed to create sales voucher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewVoucher = (voucher: SalesVoucher) => {
    setSelectedVoucher(voucher);
    setShowViewVoucher(true);
  };

  const handleEditVoucher = (voucher: SalesVoucher) => {
    setSelectedVoucher(voucher);
    setShowEditVoucher(true);
  };

  const handleVoucherUpdated = async (id: string, updates: Partial<SalesVoucher>) => {
    try {
      await updateSalesVoucher(id, updates);
      await fetchProducts();
      toast({
        title: "Voucher Updated",
        description: `Voucher ${id} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating voucher:', error);
      toast({
        title: "Error",
        description: "Failed to update voucher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintVoucher = (voucher: SalesVoucher) => {
    generateSalesVoucherPDF(voucher);
    toast({
      title: "Voucher PDF Generated",
      description: `Sales voucher PDF for ${voucher.voucherNumber} has been generated.`,
    });
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    if (window.confirm(`Are you sure you want to delete voucher ${voucherId}?`)) {
      try {
        await deleteSalesVoucher(voucherId);
        await fetchProducts();
        toast({
          title: "Voucher Deleted",
          description: `Voucher ${voucherId} has been deleted.`,
        });
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast({
          title: "Error",
          description: "Failed to delete voucher. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Single Sales</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Sales Vouchers</p>
                <p className="text-2xl font-bold">{filteredSalesVouchers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">৳{grandTotalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold">
                  {sales.reduce((sum, sale) => sum + sale.quantity, 0) + 
                   salesVouchers.reduce((sum, voucher) => sum + voucher.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Tabs */}
      <Tabs defaultValue="vouchers" className="w-full">
        {/*<TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vouchers">Multi-Item Sales (Vouchers)</TabsTrigger>
          <TabsTrigger value="single">Single Item Sales</TabsTrigger>
        </TabsList>*/}

        <TabsContent value="vouchers" className="space-y-4">
          {/* Sales Voucher Filters */}
          <SalesVoucherFiltersComponent
            filters={voucherFilters}
            onFiltersChange={setVoucherFilters}
            onClearFilters={handleClearVoucherFilters}
          />

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Sales Vouchers ({filteredSalesVouchers.length} of {salesVouchers.length} voucher{salesVouchers.length !== 1 ? 's' : ''})
                </CardTitle>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowCreateVoucher(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Sales Voucher
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Voucher #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Final Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalesVouchers.map((voucher) => (
                      <tr key={voucher.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono">{voucher.voucherNumber}</td>
                        <td className="py-4 px-4 text-sm">{voucher.customerName || 'Walk-in Customer'}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {voucher.items.length} item(s)
                            <div className="text-xs text-gray-500">
                              {voucher.items.slice(0, 2).map(item => item.productName).join(', ')}
                              {voucher.items.length > 2 && '...'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium">৳{voucher.totalAmount.toLocaleString()}</td>
                        <td className="py-4 px-4 font-bold text-green-600">৳{voucher.finalAmount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm">{new Date(voucher.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(voucher.status)}>
                            {voucher.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewVoucher(voucher)}
                              title="View Voucher"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditVoucher(voucher)}
                              title="Edit Voucher"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePrintVoucher(voucher)}
                              title="Print Voucher"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteVoucher(voucher.id)}
                              title="Delete Voucher"
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
              
              {filteredSalesVouchers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {salesVouchers.length === 0 ? (
                    <p>No sales vouchers found. Create your first voucher to get started.</p>
                  ) : (
                    <p>No vouchers match your current filters. Try adjusting the filter criteria.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Single Item Sales ({sales.length} transactions)</CardTitle>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowCreateSale(true)}
                >
                  <Plus className="h-4 w-4" />
                  Record New Sale
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Sale ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono">{sale.id}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{sale.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {sale.productId}</div>
                        </td>
                        <td className="py-4 px-4 text-sm">{sale.customerName || 'Walk-in Customer'}</td>
                        <td className="py-4 px-4">{sale.quantity}</td>
                        <td className="py-4 px-4">{sale.unitPrice}</td>
                        <td className="py-4 px-4 font-semibold">{sale.totalAmount}</td>
                        <td className="py-4 px-4 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewSale(sale)}
                              title="View Sale"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditSale(sale)}
                              title="Edit Sale"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePrintInvoice(sale)}
                              title="Print Invoice"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSale(sale)}
                              title="Delete Sale"
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
              
              {sales.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No sales records found. Record your first sale to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateSaleDialog
        open={showCreateSale}
        onOpenChange={setShowCreateSale}
        onSaleCreated={handleSaleCreated}
      />

      <CreateSalesVoucherDialog
        open={showCreateVoucher}
        onOpenChange={setShowCreateVoucher}
        onVoucherCreated={handleVoucherCreated}
      />

      <ViewSaleDialog
        open={showViewSale}
        onOpenChange={setShowViewSale}
        sale={selectedSale}
      />

      <EditSaleDialog
        open={showEditSale}
        onOpenChange={setShowEditSale}
        sale={selectedSale}
        onSaleUpdated={handleSaleUpdated}
      />

      <ViewSalesVoucherDialog
        open={showViewVoucher}
        onOpenChange={setShowViewVoucher}
        voucher={selectedVoucher}
      />

      <EditSalesVoucherDialog
        open={showEditVoucher}
        onOpenChange={setShowEditVoucher}
        voucher={selectedVoucher}
        onVoucherUpdated={handleVoucherUpdated}
      />
    </div>
  );
};
