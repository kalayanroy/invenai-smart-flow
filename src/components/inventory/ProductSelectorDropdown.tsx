
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

interface ProductSelectorDropdownProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string, productData: any) => void;
  placeholder?: string;
  className?: string;
  loadMoreProducts: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export const ProductSelectorDropdown = ({
  products,
  selectedProductId,
  onProductSelect,
  placeholder = "Search products...",
  className,
  loadMoreProducts,
  hasMore,
  isLoading = false
}: ProductSelectorDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected product
  const selectedProduct = React.useMemo(() => {
    return products.find(p => p.id === selectedProductId) || 
           searchResults.find(p => p.id === selectedProductId);
  }, [products, searchResults, selectedProductId]);

  // Search products in database
  const searchProducts = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
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
      setSearchResults(mappedProducts);
    } catch (error) {
      console.error('Error in searchProducts:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    searchProducts(value);
  }, [searchProducts]);

  // Handle product selection
  const handleProductSelect = useCallback((productId: string) => {
    console.log('Product selected:', productId);
    
    // Find the selected product from either loaded products or search results
    const selectedProd = products.find(p => p.id === productId) || 
                         searchResults.find(p => p.id === productId);
    
    if (selectedProd) {
      console.log('Found selected product:', selectedProd);
      
      // Clean the price string and convert to number
      const priceString = selectedProd.purchasePrice.replace(/[^\d.-]/g, '');
      const unitPrice = parseFloat(priceString) || 0;
      
      // Pass complete product data to parent
      const productData = {
        name: selectedProd.name,
        unitPrice: unitPrice,
        sku: selectedProd.sku,
        ...selectedProd
      };
      
      console.log('Passing product data to parent:', productData);
      onProductSelect(productId, productData);
      setOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      console.error('Product not found:', productId);
    }
  }, [products, searchResults, onProductSelect]);

  // Combine loaded products with search results, removing duplicates
  const displayProducts = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      // Show search results, but also include already loaded products that match
      const loadedIds = new Set(products.map(p => p.id));
      const uniqueSearchResults = searchResults.filter(p => !loadedIds.has(p.id));
      const matchingLoaded = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return [...matchingLoaded, ...uniqueSearchResults];
    }
    return products.slice(0, 10); // Show first 10 products by default
  }, [products, searchResults, searchQuery]);

  const handleLoadMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoading && hasMore) {
      console.log('Load More button clicked');
      loadMoreProducts();
    }
  }, [isLoading, hasMore, loadMoreProducts]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedProduct ? 
            `${selectedProduct.name} (${selectedProduct.sku})` : 
            placeholder
          }
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="Search products by name, SKU, barcode, or category..." 
            onValueChange={handleSearchChange}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>
              {isLoading && products.length === 0 ? "Loading products..." : 
               isSearching ? "Searching..." : 
               "No product found."}
            </CommandEmpty>
            <CommandGroup>
              {displayProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name}-${product.id}`}
                  onSelect={() => handleProductSelect(product.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProductId === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Stock: {product.stock} | Price: {product.purchasePrice} | {product.category}
                    </span>
                  </div>
                </CommandItem>
              ))}
              
              {/* Search loading indicator */}
              {isSearching && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Searching products...</span>
                </div>
              )}
              
              {/* Loading indicator for pagination */}
              {isLoading && !isSearching && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading more products...</span>
                </div>
              )}
              
              {/* Load More button - only show when not searching */}
              {!searchQuery && hasMore && !isLoading && products.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    onClick={handleLoadMoreClick}
                    className="w-full h-8 text-xs"
                    variant="outline"
                    size="sm"
                  >
                    Load More ({products.length} loaded)
                  </Button>
                </div>
              )}
              
              {/* No more products indicator - only show when not searching */}
              {!searchQuery && !hasMore && products.length > 0 && (
                <div className="p-2 text-center text-xs text-gray-500 border-t">
                  All products loaded ({products.length} total)
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
