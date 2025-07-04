import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus, Loader2, ChevronDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CreateProductForm } from '../inventory/CreateProductForm';
import { ProductViewDialog } from '../inventory/ProductViewDialog';
import { ProductEditDialog } from '../inventory/ProductEditDialog';
import { ProductTableFilters } from './ProductTableFilters';
import { useToast } from '@/hooks/use-toast';
import { useProducts, Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Dropdown search states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProductFromDropdown, setSelectedProductFromDropdown] = useState<Product | null>(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');
  const [dropdownSearchResults, setDropdownSearchResults] = useState<Product[]>([]);
  const [isDropdownSearching, setIsDropdownSearching] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Search products in database for dropdown
  const searchProductsInDatabase = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setDropdownSearchResults([]);
      return;
    }

    setIsDropdownSearching(true);
    try {
      console.log('Searching products in database:', query);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name')
        .limit(20);

      if (error) {
        console.error('Error searching products:', error);
        return;
      }

      const mappedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        stock: product.stock,
        reorderPoint: product.reorder_point,
        price: product.price,
        purchasePrice: product.purchase_price,
        sellPrice: product.sell_price,
        openingStock: product.opening_stock,
        unit: product.unit,
        status: product.status,
        aiRecommendation: product.ai_recommendation || '',
        image: product.image,
        createdAt: product.created_at
      }));

      console.log(`Found ${mappedProducts.length} products matching "${query}"`);
      setDropdownSearchResults(mappedProducts);
    } catch (error) {
      console.error('Error in searchProductsInDatabase:', error);
    } finally {
      setIsDropdownSearching(false);
    }
  }, []);

  // Handle dropdown search input change
  const handleDropdownSearchChange = useCallback((value: string) => {
    setDropdownSearchTerm(value);
    searchProductsInDatabase(value);
  }, [searchProductsInDatabase]);

  // Enhanced filter products with more comprehensive search
  const filteredProducts = useMemo(() => {
    console.log('Filtering products with search term:', searchTerm);
    console.log('Selected product from dropdown:', selectedProductFromDropdown);
    
    let productsToFilter = products;
    
    // If a product is selected from dropdown and it's not in the loaded products, add it
    if (selectedProductFromDropdown && !products.find(p => p.id === selectedProductFromDropdown.id)) {
      console.log('Adding selected product to filter list:', selectedProductFromDropdown.name);
      productsToFilter = [selectedProductFromDropdown, ...products];
    }
    
    return productsToFilter.filter(product => {
      // If a specific product is selected from dropdown, prioritize showing it
      if (selectedProductFromDropdown && product.id === selectedProductFromDropdown.id) {
        console.log('Showing selected product:', product.name);
        return true;
      }
      
      // Enhanced search that includes name, SKU, category, and barcode
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchLower));
      
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
      
      const result = matchesSearch && matchesCategory && matchesStatus && matchesStock;
      
      if (searchTerm && result) {
        console.log('Product matches search:', product.name, product.sku);
      }
      
      return result;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter, selectedProductFromDropdown]);

  // Filter products for dropdown based on dropdown search term
  const dropdownFilteredProducts = useMemo(() => {
    if (dropdownSearchTerm.trim() && dropdownSearchResults.length > 0) {
      return dropdownSearchResults;
    }
    
    if (!dropdownSearchTerm.trim()) {
      return products.slice(0, 10); // Show first 10 if no search
    }
    
    // Local search in loaded products as fallback
    const searchLower = dropdownSearchTerm.toLowerCase().trim();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower))
    ).slice(0, 10);
  }, [products, dropdownSearchTerm, dropdownSearchResults]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
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
    console.log('Clearing all filters');
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
    setSelectedProductFromDropdown(null);
    setDropdownSearchTerm('');
    setDropdownSearchResults([]);
  };

  const handleProductSelectFromDropdown = (product: Product) => {
    console.log('Product selected from dropdown:', product.name, product.id);
    setSelectedProductFromDropdown(product);
    setDropdownOpen(false);
    setDropdownSearchTerm('');
    setDropdownSearchResults([]);
    // Clear other filters to ensure the selected product is visible
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
    
    // Automatically open the product view modal
    setSelectedProduct(product);
    setShowViewDialog(true);
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

      {/* Product Search Dropdown */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search & Select Product to View Details
              </label>
              <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dropdownOpen}
                    className="w-full justify-between h-10"
                  >
                    {selectedProductFromDropdown 
                      ? `${selectedProductFromDropdown.name} (${selectedProductFromDropdown.sku})`
                      : "Search products by name, SKU, or barcode to view details..."
                    }
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search products..." 
                      value={dropdownSearchTerm}
                      onValueChange={handleDropdownSearchChange}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      <CommandEmpty>
                        {isDropdownSearching ? "Searching..." : 
                         loading && !dropdownSearchTerm ? "Loading products..." : 
                         "No product found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {dropdownFilteredProducts.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.name}-${product.id}`}
                            onSelect={() => handleProductSelectFromDropdown(product)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProductFromDropdown?.id === product.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-muted-foreground">
                                SKU: {product.sku} | Stock: {product.stock} | {product.category}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                        
                        {/* Search loading indicator */}
                        {isDropdownSearching && (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Searching products...</span>
                          </div>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {selectedProductFromDropdown && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedProductFromDropdown(null);
                  setSearchTerm('');
                  setDropdownSearchResults([]);
                }}
                className="h-10"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
            {searchTerm && (
              <span className="text-sm font-normal text-blue-600 ml-2">
                - searching for "{searchTerm}"
              </span>
            )}
            {selectedProductFromDropdown && (
              <span className="text-sm font-normal text-green-600 ml-2">
                - selected: {selectedProductFromDropdown.name}
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
                  <tr 
                    key={product.id} 
                    className={cn(
                      "border-b hover:bg-gray-50 transition-colors",
                      selectedProductFromDropdown?.id === product.id && "bg-blue-50 border-blue-200"
                    )}
                  >
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
                    <td className="py-4 px-4 text-sm font-mono">{product.sku}</td>
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
              {activeFiltersCount > 0 || searchTerm || selectedProductFromDropdown ? (
                <div>
                  <p>No products found matching your search criteria.</p>
                  <p className="text-sm mt-1">
                    {searchTerm && `Search: "${searchTerm}"`}
                    {searchTerm && activeFiltersCount > 0 && ' with '}
                    {activeFiltersCount > 0 && `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
                    {selectedProductFromDropdown && ` | Selected: ${selectedProductFromDropdown.name}`}
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear All Filters
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
