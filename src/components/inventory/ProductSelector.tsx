
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (isNearBottom) {
      console.log("Near bottom detected, loading more products...");
      loadMoreProducts();
    }
  }, [hasMore, isLoading, loadMoreProducts]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleLoadMoreClick = useCallback(() => {
    if (!isLoading && hasMore) {
      console.log("Load More button clicked");
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
          <CommandList ref={scrollRef} className="max-h-60 overflow-y-auto">
            <CommandEmpty>
              {isLoading ? "Loading products..." : "No product found."}
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
            </CommandGroup>
            {(hasMore || isLoading) && (
              <div className="p-2 border-t">
                <Button
                  onClick={handleLoadMoreClick}
                  className="w-full"
                  variant="ghost"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More..."
                  )}
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
