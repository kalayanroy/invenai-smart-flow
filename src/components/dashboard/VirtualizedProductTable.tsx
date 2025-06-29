
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateProductForm } from '../inventory/CreateProductForm';
import { ProductViewDialog } from '../inventory/ProductViewDialog';
import { ProductEditDialog } from '../inventory/ProductEditDialog';
import { ProductTableFilters } from './ProductTableFilters';
import { LazyImage } from '@/components/optimized/LazyImage';
import { useToast } from '@/hooks/use-toast';
import { useProducts, Product } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';

// Progressive loading configuration
const INITIAL_LOAD_COUNT = 5;
const LOAD_MORE_COUNT = 10;
const ITEM_HEIGHT = 80;
const CONTAINER_HEIGHT = 600;

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

// Optimized product row with React.memo
const ProductRow = React.memo(({ 
  product, 
  style,
  onView, 
  onEdit, 
  onDelete 
}: {
  product: Product;
  style: React.CSSProperties;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return (
    <div 
      style={style}
      className="border-b hover:bg-gray-50 transition-colors p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
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
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-gray-600 truncate">{product.category}</p>
      </div>
      
      <div className="text-sm font-mono">{product.sku}</div>
      
      <div className="text-sm">
        <span className={`font-semibold ${product.stock <= product.reorderPoint ? 'text-red-600' : 'text-green-600'}`}>
          {product.stock} {product.unit}
        </span>
      </div>
      
      <div className="font-semibold">{product.sellPrice}</div>
      
      <Badge className={getStatusColor(product.status)}>
        {product.status}
      </Badge>
      
      <div className="flex space-x-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onView(product)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(product)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

ProductRow.displayName = 'ProductRow';

export const VirtualizedProductTable = () => {
  const { products, loading, updateProduct, deleteProduct, addProduct } = useProducts();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Progressive loading states
  const [displayedCount, setDisplayedCount] = useState(INITIAL_LOAD_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Virtual scrolling states
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtered products with optimized filtering
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    return products.filter(product => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = !debouncedSearchTerm || 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower);
        
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, debouncedSearchTerm, categoryFilter, statusFilter]);

  // Progressive loading - only show a subset of filtered products
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayedCount);
  }, [filteredProducts, displayedCount]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(INITIAL_LOAD_COUNT);
  }, [debouncedSearchTerm, categoryFilter, statusFilter]);

  // Load more products when scrolling near bottom
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || displayedCount >= filteredProducts.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate async loading for smoother UX
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setDisplayedCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredProducts.length));
    setIsLoadingMore(false);
  }, [isLoadingMore, displayedCount, filteredProducts.length]);

  // Virtual scrolling calculations for displayed products only
  const totalHeight = displayedProducts.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 3);
  const endIndex = Math.min(
    displayedProducts.length - 1,
    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + 3
  );

  const visibleItems = useMemo(() => {
    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (displayedProducts[i]) {
        items.push({
          index: i,
          start: i * ITEM_HEIGHT,
          end: (i + 1) * ITEM_HEIGHT
        });
      }
    }
    return items;
  }, [startIndex, endIndex, displayedProducts]);

  // Enhanced scroll handler with progressive loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;
    
    setScrollTop(scrollTop);
    
    // Load more when scrolled 80% of the way down
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      loadMoreProducts();
    }
  }, [loadMoreProducts]);

  // Event handlers
  const handleView = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  }, []);

  const handleDelete = useCallback(async (product: Product) => {
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
  }, [deleteProduct, toast]);

  const handleProductSave = useCallback(async (id: string, updates: any) => {
    try {
      await updateProduct(id, updates);
      setShowEditDialog(false);
      setSelectedProduct(null);
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  }, [updateProduct, toast]);

  const handleProductCreated = useCallback((productData: any) => {
    addProduct(productData);
    setShowCreateForm(false);
    toast({
      title: "Product Created",
      description: "The product has been created successfully.",
    });
  }, [addProduct, toast]);

  const activeFiltersCount = [searchTerm, categoryFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading first 5 products...</span>
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
              Products ({displayedProducts.length} of {filteredProducts.length} items)
              {displayedProducts.length < filteredProducts.length && (
                <span className="text-sm text-gray-500">
                  - Scroll to load more
                </span>
              )}
            </CardTitle>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
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
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="flex items-center gap-4 p-4 border-b font-medium text-gray-600 bg-gray-50">
            <div className="w-12"></div>
            <div className="flex-1">Product</div>
            <div className="w-20">SKU</div>
            <div className="w-20">Stock</div>
            <div className="w-20">Price</div>
            <div className="w-20">Status</div>
            <div className="w-24">Actions</div>
          </div>

          {/* Virtual Scrolling Container */}
          <div
            ref={containerRef}
            style={{ height: CONTAINER_HEIGHT }}
            className="overflow-auto border rounded-lg"
            onScroll={handleScroll}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {visibleItems.map(({ index, start }) => (
                <div
                  key={displayedProducts[index]?.id || index}
                  style={{
                    position: 'absolute',
                    top: start,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT
                  }}
                >
                  {displayedProducts[index] && (
                    <ProductRow
                      product={displayedProducts[index]}
                      style={{}}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center p-4 border-t">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading more products...</span>
              </div>
            )}
          </div>

          {displayedProducts.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No products found matching your criteria.</p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="mt-2">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        onSave={handleProductSave}
      />

      <ProductViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        product={selectedProduct}
      />
    </div>
  );
};
