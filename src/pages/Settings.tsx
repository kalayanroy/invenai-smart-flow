
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnitManagement } from '@/components/inventory/UnitManagement';
import { CategoryManagement } from '@/components/inventory/CategoryManagement';

export const Settings = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="units" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="units">
          <UnitManagement />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
