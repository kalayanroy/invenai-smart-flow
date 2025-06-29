
import React,{ useRef,useEffect  } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
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
  hasMore
}: ProductSelectorProps & {
  loadMoreProducts: () => void;
  hasMore: boolean;
}) => {
  console.log("hasMore:", hasMore); // 👈 ADD THIS HERE
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const scrollRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  const handleScroll = () => {
    console.log("scrolling...");

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (nearBottom && hasMore) {
      console.log("Reached bottom, loading more...");
      loadMoreProducts();
    }
  };

  el.addEventListener("scroll", handleScroll);
  return () => el.removeEventListener("scroll", handleScroll);
}, [hasMore, loadMoreProducts]);


  return (
    <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto" align="start">
  <Command>
    <CommandInput placeholder="Search products..." />
    <CommandList
      ref={scrollRef}
      className="max-h-60 overflow-y-auto"
    >
      <CommandEmpty>No product found.</CommandEmpty>
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
            {/* ... */}
          </CommandItem>
        ))}
        {hasMore && (
          <div className="text-center text-sm p-2 text-muted-foreground">
            Loading more...
          </div>
        )}
      </CommandGroup>
    </CommandList>
  </Command>
</PopoverContent>

  );
};
