
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string, productData: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  className?: string;
  loadMoreProducts: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export const ProductSelector = ({
  products,
  selectedProductId,
  onProductSelect,
  open,
  onOpenChange,
  placeholder = "Select product...",
  className,
  loadMoreProducts,
  hasMore,
  isLoading = false
}: ProductSelectorProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>(products);

  // Update allProducts when products change
  useEffect(() => {
    setAllProducts(products);
  }, [products]);

  // Find selected product from all available products (loaded + search results)
  const selectedProduct = React.useMemo(() => {
    return allProducts.find(p => p.id === selectedProductId) || 
           searchResults.find(p => p.id === selectedProductId);
  }, [allProducts, searchResults, selectedProductId]);

  // Handle scroll for lazy loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const threshold = 100;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      console.log('Scroll threshold reached, loading more products...');
      loadMoreProducts();
    }
  }, [hasMore, isLoading, loadMoreProducts]);

  // Attach scroll listener when dropdown opens
  useEffect(() => {
    if (!open) return;

    const listElement = listRef.current;
    if (!listElement) return;

    const throttledScroll = throttle(handleScroll, 200);
    listElement.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      listElement.removeEventListener('scroll', throttledScroll);
    };
  }, [open, handleScroll]);

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
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
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

  // Throttle function to limit scroll event frequency
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

  const handleLoadMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoading && hasMore) {
      console.log('Load More button clicked');
      loadMoreProducts();
    }
  }, [isLoading, hasMore, loadMoreProducts]);

  // Handle product selection
  const handleProductSelect = useCallback((productId: string, productName: string) => {
    console.log('Product selected:', { productId, productName });
    
    // Find the selected product from either loaded products or search results
    const selectedProd = allProducts.find(p => p.id === productId) || 
                         searchResults.find(p => p.id === productId);
    
    if (selectedProd) {
      console.log('Found selected product:', selectedProd);
      
      // Add the selected product to allProducts if it's not already there
      if (!allProducts.find(p => p.id === productId)) {
        setAllProducts(prev => [...prev, selectedProd]);
      }
      
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
      onOpenChange(false);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      console.error('Product not found:', productId);
    }
  }, [allProducts, searchResults, onProductSelect, onOpenChange]);

  // Combine loaded products with search results, removing duplicates
  const displayProducts = React.useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      // Show search results, but also include already loaded products that match
      const loadedIds = new Set(allProducts.map(p => p.id));
      const uniqueSearchResults = searchResults.filter(p => !loadedIds.has(p.id));
      const matchingLoaded = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return [...matchingLoaded, ...uniqueSearchResults];
    }
    return allProducts;
  }, [allProducts, searchResults, searchQuery]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {selectedProduct ? selectedProduct.name : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="Search products..." 
            onValueChange={handleSearchChange}
          />
          <CommandList ref={listRef} className="max-h-60 overflow-y-auto">
            <CommandEmpty>
              {isLoading && allProducts.length === 0 ? "Loading products..." : 
               isSearching ? "Searching..." : 
               "No product found."}
            </CommandEmpty>
            <CommandGroup>
              {displayProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name}-${product.id}`}
                  onSelect={() => handleProductSelect(product.id, product.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProductId === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Price: {product.purchasePrice}
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
              {!searchQuery && hasMore && !isLoading && allProducts.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    onClick={handleLoadMoreClick}
                    className="w-full h-8 text-xs"
                    variant="outline"
                    size="sm"
                  >
                    Load More ({allProducts.length} loaded)
                  </Button>
                </div>
              )}
              
              {/* No more products indicator - only show when not searching */}
              {!searchQuery && !hasMore && allProducts.length > 0 && (
                <div className="p-2 text-center text-xs text-gray-500 border-t">
                  All products loaded ({allProducts.length} total)
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
