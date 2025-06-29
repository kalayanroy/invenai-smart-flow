import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { CreateProductForm } from '@/components/inventory/CreateProductForm';
import { ProductEditDialog } from '@/components/inventory/ProductEditDialog';
import { ProductViewDialog } from '@/components/inventory/ProductViewDialog';
import { ProductTableFilters } from './ProductTableFilters';
import { LazyImage } from '@/components/optimized/LazyImage';

export const ProductTableFast = () => {
  const { products, loading, updateProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simple state management
  const [displayCount, setDisplayCount] = useState(10);

  // Simple, fast filtering
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
                           
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleView = (product: any) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const handleDelete = async (product: any) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
        toast({
          title: "Product Deleted",
          description: `${product.name} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleProductUpdated = () => {
    setShowEditDialog(false);
    setSelectedProduct(null);
    toast({
      title: "Product Updated",
      description: "The product has been updated successfully.",
    });
  };

  const activeFiltersCount = [searchTerm, categoryFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductTableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        products={products}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length} items)
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Image</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {product.image ? (
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkMyMS43OTA5IDE2IDE5Ljk5OTkgMTcuNzkwOSAxOS45OTk5IDIwQzE5Ljk5OTkgMjIuMjA5MSAyMS43OTA5IDI0IDI0IDI0QzI2LjIwOTEgMjQgMjggMjIuMjA5MSAyOCAyMEMyOCAxNy43OTA5IDI2LjIwOTEgMTYgMjQgMTYiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDMySDE2LjY2NjdDMTYuOTU1MyAzMiAxNy4yMzEzIDMxLjg4NSAxNy40MzYgMzEuNjgxTDI0IDI1LjMzM0wzMC41NjQgMzEuNjgxQzMwLjc2ODcgMzEuODg1IDMxLjA0NDcgMzIgMzEuMzMzMyAzMkgzMlYzMkMzNCA0IDM0IDEwIDM0IDEwVjMySDMySDMxLjMzMzNIMzJIMTZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo="
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.barcode}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm">{product.sku}</td>
                    <td className="py-4 px-4">{product.category}</td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${product.stock <= product.reorderPoint ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{product.sellPrice}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(product)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-700"
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
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProductForm 
        open={showCreateForm} 
        onOpenChange={setShowCreateForm}
      />

      <ProductEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      <ProductViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        product={selectedProduct}
      />
    </div>
  );
};
