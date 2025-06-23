import React, { useState } from 'react';
import { Package, ShoppingCart, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Stock from './Stock';
import Sales from './Sales';
import Purchases from './Purchases';
import { BackupRestoreDialog } from './inventory/BackupRestoreDialog';

export default function StockDashboard() {
  const [activeSection, setActiveSection] = useState('stock');

  const renderSection = () => {
    switch (activeSection) {
      case 'stock':
        return <Stock />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Manage your stock, sales, and operations</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BackupRestoreDialog />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('stock')}
                className={`${activeSection === 'stock' ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Package className="h-4 w-4 mr-2" />
                Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('sales')}
                className={`${activeSection === 'sales' ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sales
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('purchases')}
                className={`${activeSection === 'purchases' ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Truck className="h-4 w-4 mr-2" />
                Purchases
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto p-4">
        {renderSection()}
      </div>
    </div>
  );
}
