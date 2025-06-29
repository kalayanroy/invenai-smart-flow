// ProductSelector.tsx

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
  loadMoreProducts: () => void; // loadMoreProducts prop যোগ করা হয়েছে
  hasMore: boolean; // hasMore prop যোগ করা হয়েছে
}

export const ProductSelector = ({
  products,
  selectedProductId,
  onProductSelect,
  open,
  onOpenChange,
  placeholder = "Select product...",
  className,
  loadMoreProducts, // Destructure loadMoreProducts
  hasMore // Destructure hasMore
}: ProductSelectorProps) => { // Updated type to use ProductSelectorProps directly

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // স্ক্রল ইভেন্টের জন্য useRef আর useEffect এখানে দরকার নেই যদি "Load More" বাটন ব্যবহার করেন
  // তবে যদি স্ক্রল এবং বাটন দুটোই রাখতে চান, তাহলে এই অংশটি রাখতে পারেন।
  // যেহেতু আপনি বাটন চাচ্ছেন, তাই এটি কমেন্ট আউট করা হলো বা বাদ দেওয়া যেতে পারে।
  // const scrollRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   const el = scrollRef.current;
  //   if (!el) return;

  //   const handleScroll = () => {
  //     console.log("scrolling...");
  //     const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  //     if (nearBottom && hasMore) {
  //       console.log("Reached bottom, loading more...");
  //       loadMoreProducts();
  //     }
  //   };

  //   el.addEventListener("scroll", handleScroll);
  //   return () => el.removeEventListener("scroll", handleScroll);
  // }, [hasMore, loadMoreProducts]);


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
          {/* CommandList-এ max-h এবং overflow যোগ করুন যাতে এটি নিজে স্ক্রল করতে পারে */}
          <CommandList className="max-h-60 overflow-y-auto">
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
            {hasMore && (
              <div className="p-2">
                <Button
                  onClick={loadMoreProducts} // বাটনে ক্লিক করলে loadMoreProducts কল হবে
                  className="w-full"
                  variant="ghost"
                >
                  Load More...
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};