
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useProducts } from '@/hooks/useProducts';
import { ChartSkeleton } from '@/components/ui/loading-skeleton';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const InventoryChart = React.memo(() => {
  const { products, loading } = useProducts();

  const chartData = useMemo(() => {
    if (loading || products.length === 0) return [];

    const categoryData: { [key: string]: number } = {};
    
    products.forEach(product => {
      categoryData[product.category] = (categoryData[product.category] || 0) + product.stock;
    });

    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  }, [products, loading]);

  if (loading) {
    return <ChartSkeleton />;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No inventory data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

InventoryChart.displayName = 'InventoryChart';
