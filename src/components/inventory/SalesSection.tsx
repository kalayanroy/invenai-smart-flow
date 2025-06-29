
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Receipt, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useSalesVouchers } from '@/hooks/useSalesVouchers';
import { CreateSaleDialog } from './CreateSaleDialog';
import { EditSaleDialog } from './EditSaleDialog';
import { ViewSaleDialog } from './ViewSaleDialog';
import { CreateSalesVoucherDialog } from './CreateSalesVoucherDialog';
import { EditSalesVoucherDialog } from './EditSalesVoucherDialog';
import { ViewSalesVoucherDialog } from './ViewSalesVoucherDialog';
import { SalesFilters } from './SalesFilters';
import { SalesVoucherFilters } from './SalesVoucherFilters';

export const SalesSection = () => {
  const { sales, addSale, updateSale, deleteSale } = useSales();
  const { salesVouchers, createSalesVoucher, updateSalesVoucher, deleteSalesVoucher } = useSalesVouchers();

  // Sales state
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showEditSale, setShowEditSale] = useState(false);
  const [showViewSale, setShowViewSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Sales Vouchers state
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [showEditVoucher, setShowEditVoucher] = useState(false);
  const [showViewVoucher, setShowViewVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  // Sales filters
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState('all');
  const [salesDateRange, setSalesDateRange] = useState('all');

  // Sales Voucher filters
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');
  const [voucherCustomerFilter, setVoucherCustomerFilter] = useState('all');
  const [voucherDateRange, setVoucherDateRange] = useState('all');

  // Get unique customers from vouchers
  const uniqueCustomers = useMemo(() => {
    const customers = salesVouchers
      .map(voucher => voucher.customerName)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return customers;
  }, [salesVouchers]);

  // Filter sales vouchers based on search term (voucher number, customer name, items)
  const filteredSalesVouchers = useMemo(() => {
    return salesVouchers.filter(voucher => {
      // Search filter - search in voucher number, customer name, and items
      if (voucherSearchTerm) {
        const searchLower = voucherSearchTerm.toLowerCase();
        const matchesVoucherNumber = voucher.voucherNumber.toLowerCase().includes(searchLower);
        const matchesCustomer = voucher.customerName?.toLowerCase().includes(searchLower) || false;
        const matchesItems = voucher.items.some(item => 
          item.productName.toLowerCase().includes(searchLower) ||
          item.productId.toLowerCase().includes(searchLower)
        );
        
        if (!matchesVoucherNumber && !matchesCustomer && !matchesItems) {
          return false;
        }
      }

      // Customer filter
      if (voucherCustomerFilter !== 'all' && voucher.customerName !== voucherCustomerFilter) {
        return false;
      }

      // Date range filter
      if (voucherDateRange !== 'all') {
        const voucherDate = new Date(voucher.date);
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        
        switch (voucherDateRange) {
          case 'today':
            if (voucherDate < startOfDay) return false;
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (voucherDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            if (voucherDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
            if (voucherDate < quarterAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            if (voucherDate < yearAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [salesVouchers, voucherSearchTerm, voucherCustomerFilter, voucherDateRange]);

  // Filter regular sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (salesSearchTerm && !sale.productName.toLowerCase().includes(salesSearchTerm.toLowerCase()) && 
          !sale.customerName?.toLowerCase().includes(salesSearchTerm.toLowerCase())) {
        return false;
      }
      if (salesStatusFilter !== 'all' && sale.status !== salesStatusFilter) {
        return false;
      }
      // Date range logic for regular sales...
      return true;
    });
  }, [sales, salesSearchTerm, salesStatusFilter, salesDateRange]);

  // Count active filters for vouchers
  const activeVoucherFiltersCount = useMemo(() => {
    let count = 0;
    if (voucherSearchTerm) count++;
    if (voucherCustomerFilter !== 'all') count++;
    if (voucherDateRange !== 'all') count++;
    return count;
  }, [voucherSearchTerm, voucherCustomerFilter, voucherDateRange]);

  // Count active filters for sales
  const activeSalesFiltersCount = useMemo(() => {
    let count = 0;
    if (salesSearchTerm) count++;
    if (salesStatusFilter !== 'all') count++;
    if (salesDateRange !== 'all') count++;
    return count;
  }, [salesSearchTerm, salesStatusFilter, salesDateRange]);

  const clearVoucherFilters = () => {
    setVoucherSearchTerm('');
    setVoucherCustomerFilter('all');
    setVoucherDateRange('all');
  };

  const clearSalesFilters = () => {
    setSalesSearchTerm('');
    setSalesStatusFilter('all');
    setSalesDateRange('all');
  };

  // Dialog handlers
  const handleCreateSale = async (saleData: any) => {
    try {
      await addSale(saleData);
      setShowCreateSale(false);
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Could not create sale. Please try again.");
    }
  };

  const handleUpdateSale = async (id: string, updates: any) => {
    try {
      await updateSale(id, updates);
      setShowEditSale(false);
    } catch (error) {
      console.error("Error updating sale:", error);
      alert("Could not update sale. Please try again.");
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteSale(id);
      } catch (error) {
        console.error("Error deleting sale:", error);
        alert("Could not delete sale. Please try again.");
      }
    }
  };

  const handleCreateSalesVoucher = async (voucherData: any) => {
    try {
      await createSalesVoucher(voucherData);
      setShowCreateVoucher(false);
    } catch (error) {
      console.error("Error creating sales voucher:", error);
      alert("Could not create sales voucher. Please try again.");
    }
  };

  const handleUpdateSalesVoucher = async (id: string, updates: any) => {
    try {
      await updateSalesVoucher(id, updates);
      setShowEditVoucher(false);
    } catch (error) {
      console.error("Error updating sales voucher:", error);
      alert("Could not update sales voucher. Please try again.");
    }
  };

  const handleDeleteSalesVoucher = async (id: string) => {
    if (confirm("Are you sure you want to delete this voucher?")) {
      try {
        await deleteSalesVoucher(id);
      } catch (error) {
        console.error("Error deleting sales voucher:", error);
        alert("Could not delete sales voucher. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales Management</h2>
      </div>

      <Tabs defaultValue="vouchers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vouchers" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Sales Vouchers ({salesVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Individual Sales ({sales.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sales Vouchers</CardTitle>
                <Button onClick={() => setShowCreateVoucher(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Voucher
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SalesVoucherFilters
                searchTerm={voucherSearchTerm}
                setSearchTerm={setVoucherSearchTerm}
                customerFilter={voucherCustomerFilter}
                setCustomerFilter={setVoucherCustomerFilter}
                dateRange={voucherDateRange}
                setDateRange={setVoucherDateRange}
                customers={uniqueCustomers}
                onClearFilters={clearVoucherFilters}
                activeFiltersCount={activeVoucherFiltersCount}
              />

              <div className="space-y-2">
                {filteredSalesVouchers.map((voucher) => (
                  <div key={voucher.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{voucher.voucherNumber}</p>
                          <p className="text-sm text-gray-600">
                            {voucher.customerName || 'Walk-in Customer'} • {voucher.date}
                          </p>
                          <p className="text-sm text-gray-500">
                            {voucher.items.length} item(s) • {voucher.items.map(item => item.productName).join(', ')}
                          </p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-semibold text-green-600">৳{voucher.finalAmount.toFixed(2)}</p>
                          <Badge variant={voucher.status === 'Completed' ? 'default' : voucher.status === 'Pending' ? 'secondary' : 'destructive'}>
                            {voucher.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setShowViewVoucher(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setShowEditVoucher(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this voucher?')) {
                            deleteSalesVoucher(voucher.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredSalesVouchers.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No vouchers found matching your filters.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Individual Sales</CardTitle>
                <Button onClick={() => setShowCreateSale(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sale
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SalesFilters
                searchTerm={salesSearchTerm}
                setSearchTerm={setSalesSearchTerm}
                statusFilter={salesStatusFilter}
                setStatusFilter={setSalesStatusFilter}
                dateRange={salesDateRange}
                setDateRange={setSalesDateRange}
                onClearFilters={clearSalesFilters}
                activeFiltersCount={activeSalesFiltersCount}
              />

              <div className="space-y-2">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{sale.productName}</p>
                          <p className="text-sm text-gray-600">
                            {sale.customerName || 'Walk-in Customer'} • {sale.date}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {sale.quantity} • Unit: ৳{sale.unitPrice}
                          </p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-semibold text-green-600">৳{sale.totalAmount}</p>
                          <Badge variant={sale.status === 'Completed' ? 'default' : 'secondary'}>
                            {sale.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowViewSale(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowEditSale(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this sale?')) {
                            deleteSale(sale.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredSales.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No sales found matching your filters.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sales Dialogs */}
      <CreateSaleDialog
        open={showCreateSale}
        onOpenChange={setShowCreateSale}
        onSaleCreated={addSale}
      />
      
      <EditSaleDialog
        open={showEditSale}
        onOpenChange={setShowEditSale}
        sale={selectedSale}
        onSaleUpdated={updateSale}
      />
      
      <ViewSaleDialog
        open={showViewSale}
        onOpenChange={setShowViewSale}
        sale={selectedSale}
      />

      {/* Sales Voucher Dialogs */}
      <CreateSalesVoucherDialog
        open={showCreateVoucher}
        onOpenChange={setShowCreateVoucher}
        onVoucherCreated={createSalesVoucher}
      />
      
      <EditSalesVoucherDialog
        open={showEditVoucher}
        onOpenChange={setShowEditVoucher}
        voucher={selectedVoucher}
        onVoucherUpdated={updateSalesVoucher}
      />
      
      <ViewSalesVoucherDialog
        open={showViewVoucher}
        onOpenChange={setShowViewVoucher}
        voucher={selectedVoucher}
      />
    </div>
  );
};
