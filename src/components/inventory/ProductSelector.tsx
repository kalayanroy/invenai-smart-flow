
import React from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  purchasePrice: string;
  sellPrice: string;
  displayStock?: number;
}

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
  className
}: ProductSelectorProps) => {
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedProduct ? selectedProduct.name : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products..." className="h-9" />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.id}`}
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
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{product.name}</span>
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>Purchase: {product.purchasePrice} | Sell: {product.sellPrice}</span>
                      {product.displayStock !== undefined && (
                        <span className="font-medium">Stock: {product.displayStock}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
