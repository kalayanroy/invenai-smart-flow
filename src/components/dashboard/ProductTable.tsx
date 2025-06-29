
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateProductForm } from '../inventory/CreateProductForm';
import { ProductViewDialog } from '../inventory/ProductViewDialog';
import { ProductEditDialog } from '../inventory/ProductEditDialog';
import { ProductTableFilters } from './ProductTableFilters';
import { useToast } from '@/hooks/use-toast';
import { useProducts, Product } from '@/hooks/useProducts';

export const ProductTable = () => {
  const { toast } = useToast();
  const { products, loading, hasMore, addProduct, updateProduct, deleteProduct, loadMoreProducts } = useProducts();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      let matchesStock = true;
      if (stockFilter !== 'all') {
        const stock = product.stock;
        switch (stockFilter) {
          case 'high':
            matchesStock = stock > 50;
            break;
          case 'medium':
            matchesStock = stock >= 11 && stock <= 50;
            break;
          case 'low':
            matchesStock = stock >= 1 && stock <= 10;
            break;
          case 'empty':
            matchesStock = stock === 0;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (categoryFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (stockFilter !== 'all') count++;
    return count;
  }, [searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const threshold = 200;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      console.log('Loading more products via scroll...');
      loadMoreProducts();
    }
  }, [hasMore, loading, loadMoreProducts]);

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const throttledScroll = throttle(handleScroll, 300);
    scrollElement.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  function throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted successfully.`,
      });
    }
  };

  const handleProductCreated = (productData: any) => {
    addProduct(productData);
    setShowCreateProduct(false);
  };

  const handleProductUpdate = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
  };

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

      {/* Product Table */}
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
          <div 
            ref={scrollRef}
            className="overflow-x-auto max-h-[600px] overflow-y-auto"
          >
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category} • {product.price}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">{product.id}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{product.stock} {product.unit}</div>
                        <div className="text-gray-500">Reorder at {product.reorderPoint}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete Product"
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

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-500">Loading more products...</span>
              </div>
            )}

            {/* Load more button */}
            {hasMore && !loading && products.length > 0 && (
              <div className="flex justify-center p-4">
                <Button 
                  onClick={loadMoreProducts}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Load More Products
                </Button>
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && products.length > 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                All products loaded ({products.length} total)
              </div>
            )}
          </div>
          
          {filteredProducts.length === 0 && !loading && (
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
};
