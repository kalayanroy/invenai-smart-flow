
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductTableSkeleton } from '@/components/ui/loading-skeleton';

interface ProductTableProps {
  onView: (productId: string) => void;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  onView,
  onEdit,
  onDelete,
  searchTerm,
  categoryFilter,
  statusFilter,
}) => {
  const { products, loading, loadMoreProducts, hasMore } = useProducts();

  const filteredProducts = useMemo(() => {
    if (loading) return [];
    
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      const matchesStatus = !statusFilter || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, loading]);

  if (loading && products.length === 0) {
    return <ProductTableSkeleton />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory ({filteredProducts.length} items)</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? 'Loading products...' : 'No products found matching your filters.'}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                    </div>
                    <div className="text-sm">
                      <div>Category: {product.category}</div>
                    </div>
                    <div className="text-sm">
                      <div>Stock: {product.stock} {product.unit}</div>
                      <div className="text-muted-foreground">Reorder: {product.reorderPoint}</div>
                    </div>
                    <div className="text-sm">
                      <div>Price: {product.sellPrice}</div>
                    </div>
                    <div>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(product.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-6 text-center">
                <Button 
                  onClick={loadMoreProducts} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
