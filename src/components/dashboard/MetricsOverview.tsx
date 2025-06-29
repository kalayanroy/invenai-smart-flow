import React from 'react';
import { LucideProps } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useIsMobile } from '@/hooks/use-mobile';
export const BdtSign = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <text x="4" y="20" fontSize="33">৳</text>
  </svg>
);

export const MetricsOverview = () => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const isMobile = useIsMobile();

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.reorderPoint).length;
  
  const totalSalesValue = sales.reduce((sum, sale) => {
    const price = typeof sale.unitPrice === 'string' 
      ? parseFloat(sale.unitPrice.replace(/[৳$,]/g, '')) || 0
      : sale.unitPrice || 0;
    return sum + (price * sale.quantity);
  }, 0);

  const totalPurchaseValue = purchases.reduce((sum, purchase) => {
    const price = typeof purchase.unitPrice === 'string' 
      ? parseFloat(purchase.unitPrice.replace(/[৳$,]/g, '')) || 0
      : purchase.unitPrice || 0;
    return sum + (price * purchase.quantity);
  }, 0);

  // Calculate stock movement (current stock + purchases - sales)
  const totalCurrentStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalPurchaseQuantity = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalSalesQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const stockMovement = totalCurrentStock + totalPurchaseQuantity - totalSalesQuantity;

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sales Revenue',
      value: `${totalSalesValue.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: BdtSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Stock Movement',
      value: stockMovement.toString(),
      change: stockMovement >= 0 ? '+5.1%' : '-2.3%',
      changeType: stockMovement >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      color: stockMovement >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stockMovement >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.toString(),
      change: '-15%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-2' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>
              {metric.title}
            </CardTitle>
            <div className={`${metric.bgColor} p-2 rounded-full`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent className={isMobile ? 'pt-0' : ''}>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
              {metric.value}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {metric.changeType === 'positive' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.change}
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                {isMobile ? 'vs last' : 'vs last month'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
