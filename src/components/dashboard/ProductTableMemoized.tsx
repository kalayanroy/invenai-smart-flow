import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateProductForm } from '../inventory/CreateProductForm';
import { ProductViewDialog } from '../inventory/ProductViewDialog';
import { ProductEditDialog } from '../inventory/ProductEditDialog';
import { ProductTableFilters } from './ProductTableFilters';
import { VirtualList } from '@/components/ui/virtual-list';
import { LazyImage } from '@/components/optimized/LazyImage';
import { useToast } from '@/hooks/use-toast';
import { useProducts, Product } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';

// Memoized row component for better performance with virtual scrolling
const ProductTableRow = React.memo(({ 
  product, 
  onView, 
  onEdit, 
  onDelete,
  getStatusColor 
}: {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  getStatusColor: (status: string) => string;
}) => (
  <div className="border-b hover:bg-gray-50 transition-colors p-4 grid grid-cols-5 gap-4 items-center min-h-[80px]">
    <div className="flex items-center gap-3">
      {product.image && (
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-10 h-10 object-cover rounded"
          placeholder="/placeholder.svg"
        />
      )}
      <div>
        <div className="font-medium text-gray-900">{product.name}</div>
        <div className="text-sm text-gray-500">{product.category} • {product.price}</div>
      </div>
    </div>
    <div className="text-sm font-mono">{product.id}</div>
    <div className="text-sm">
      <div className="font-medium">{product.stock} {product.unit}</div>
      <div className="text-gray-500">Reorder at {product.reorderPoint}</div>
    </div>
    <div>
      <Badge className={getStatusColor(product.status)}>
        {product.status}
      </Badge>
    </div>
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onView(product)}
        title="View Product"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onEdit(product)}
        title="Edit Product"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onDelete(product)}
        title="Delete Product"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
));

ProductTableRow.displayName = 'ProductTableRow';

export const ProductTable = React.memo(() => {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filter states with debouncing for search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized categories to prevent recalculation
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Optimized filtered products with debounced search
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return products.filter(product => {
      // Early returns for better performance
      if (debouncedSearchTerm && !product.name.toLowerCase().includes(searchLower) &&
          !product.sku.toLowerCase().includes(searchLower) &&
          !product.category.toLowerCase().includes(searchLower)) {
        return false;
      }
      
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }
      
      if (statusFilter !== 'all' && product.status !== statusFilter) {
        return false;
      }
      
      if (stockFilter !== 'all') {
        const stock = product.stock;
        switch (stockFilter) {
          case 'high': return stock > 50;
          case 'medium': return stock >= 11 && stock <= 50;
          case 'low': return stock >= 1 && stock <= 10;
          case 'empty': return stock === 0;
          default: return true;
        }
      }
      
      return true;
    });
  }, [products, debouncedSearchTerm, categoryFilter, statusFilter, stockFilter]);

  // Memoized active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (categoryFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (stockFilter !== 'all') count++;
    return count;
  }, [searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Memoized status color function
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Memoized event handlers
  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
    console.log('View product:', product);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
    console.log('Edit product:', product);
  }, []);

  const handleDeleteProduct = useCallback((product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted successfully.`,
      });
      console.log('Delete product:', product);
    }
  }, [deleteProduct, toast]);

  const handleProductCreated = useCallback((productData: any) => {
    addProduct(productData);
    setShowCreateProduct(false);
  }, [addProduct]);

  const handleProductUpdate = useCallback((id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
  }, [updateProduct]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
  }, []);

  // Optimized virtual list render function
  const renderItem = useCallback((product: Product, index: number) => (
    <ProductTableRow
      key={`${product.id}-${index}`}
      product={product}
      onView={handleViewProduct}
      onEdit={handleEditProduct}
      onDelete={handleDeleteProduct}
      getStatusColor={getStatusColor}
    />
  ), [handleViewProduct, handleEditProduct, handleDeleteProduct, getStatusColor]);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Inventory</h2>
        <div className="flex gap-2">
          <Dialog open={showCreateProduct} onOpenChange={setShowCreateProduct}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <CreateProductForm onProductCreated={handleProductCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <ProductTableFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            categories={categories}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </CardContent>
      </Card>

      {/* Product Table with Optimized Virtual Scrolling */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({filteredProducts.length} of {products.length} items)
            {activeFiltersCount > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium text-gray-600 bg-gray-50">
            <div>Product</div>
            <div>SKU</div>
            <div>Stock</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {/* Optimized Virtual List Container */}
          {filteredProducts.length > 0 ? (
            <VirtualList
              items={filteredProducts}
              itemHeight={80}
              containerHeight={320} // Reduced to show only 4 items initially (4 * 80 = 320px)
              renderItem={renderItem}
              overscan={1} // Reduced overscan for better performance
              className="border rounded-lg"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              {activeFiltersCount > 0 ? (
                <div>
                  <p>No products found matching your filters.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <p>No products found. Create your first product to get started.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductViewDialog
        product={selectedProduct}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />

      <ProductEditDialog
        product={selectedProduct}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleProductUpdate}
      />
    </div>
  );
});

ProductTable.displayName = 'ProductTable';
