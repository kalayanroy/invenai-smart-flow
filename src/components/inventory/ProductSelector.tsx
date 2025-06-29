
import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/hooks/useProducts';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
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
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const listRef = useRef<HTMLDivElement>(null);

  loadMoreProducts();
  const handleScroll = useCallback(() => {
    const listElement = listRef.current;
    if (!listElement || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listElement;
    const scrollThreshold = 50; // Load more when 50px from bottom

    if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
      console.log('Scroll threshold reached, loading more products...');
      loadMoreProducts();
    }
  }, [hasMore, isLoading, loadMoreProducts]);

  // Attach scroll listener when dropdown opens
  useEffect(() => {
    if (!open) return;

    const listElement = listRef.current;
    if (!listElement) return;

    listElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      listElement.removeEventListener('scroll', handleScroll);
    };
  }, [open, handleScroll]);

  const handleLoadMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoading && hasMore) {
      console.log('Load More button clicked');
      loadMoreProducts();
    }
  }, [isLoading, hasMore, loadMoreProducts]);

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
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandList ref={listRef} className="max-h-60 overflow-y-auto">
            <CommandEmpty>
              {isLoading && products.length === 0 ? "Loading products..." : "No product found."}
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    onProductSelect(product.id);
                    onOpenChange(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProductId === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {product.name}
                </CommandItem>
              ))}
              
              {/* Loading indicator */}
              {isLoading && products.length > 0 && (
                <div className="p-2 text-center text-sm text-gray-500">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Loading more products...
                </div>
              )}
              
              {/* Load More button */}
              {hasMore && !isLoading && products.length > 0 && (
                <div className="p-2 border-t bg-gray-50">
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
              
              {/* No more products indicator */}
              {!hasMore && products.length > 0 && (
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
