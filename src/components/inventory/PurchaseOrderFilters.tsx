
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface PurchaseOrderFilters {
  orderId: string;
  supplier: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface PurchaseOrderFiltersProps {
  filters: PurchaseOrderFilters;
  onFiltersChange: (filters: PurchaseOrderFilters) => void;
  onClearFilters: () => void;
}

export const PurchaseOrderFiltersComponent = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: PurchaseOrderFiltersProps) => {
  const handleFilterChange = (key: keyof PurchaseOrderFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.orderId || filters.supplier || filters.dateFrom || filters.dateTo;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filter Purchase Orders</h3>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Order ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="order-filter">Order ID</Label>
            <Input
              id="order-filter"
              placeholder="Search by order ID..."
              value={filters.orderId}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
            />
          </div>

          {/* Supplier Filter */}
          <div className="space-y-2">
            <Label htmlFor="supplier-filter">Supplier</Label>
            <Input
              id="supplier-filter"
              placeholder="Search by supplier name..."
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
            />
          </div>

          {/* Date From Filter */}
          <div className="space-y-2">
            <Label>Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom || undefined}
                  onSelect={(date) => handleFilterChange('dateFrom', date || null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To Filter */}
          <div className="space-y-2">
            <Label>Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo || undefined}
                  onSelect={(date) => handleFilterChange('dateTo', date || null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Active filters: {' '}
              {filters.orderId && `Order ID: "${filters.orderId}" `}
              {filters.supplier && `Supplier: "${filters.supplier}" `}
              {filters.dateFrom && `From: ${format(filters.dateFrom, "MMM dd, yyyy")} `}
              {filters.dateTo && `To: ${format(filters.dateTo, "MMM dd, yyyy")} `}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
