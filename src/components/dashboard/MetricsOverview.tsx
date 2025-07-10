
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { MetricsSkeleton } from '@/components/ui/loading-skeleton';

export const MetricsOverview = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useSales();

  if (productsLoading || salesLoading) {
    return <MetricsSkeleton />;
  }

  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stock <= p.reorderPoint).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;
  
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  
  const todayRevenue = todaySales.reduce((sum, sale) => {
    return sum + parseFloat(sale.totalAmount.replace('৳', '').replace(',', ''));
  }, 0);

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: "Today's Revenue",
      value: `৳${todayRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
