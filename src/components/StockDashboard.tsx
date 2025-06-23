
import React, { useState } from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { MetricsOverview } from './dashboard/MetricsOverview';
import { InventoryChart } from './dashboard/InventoryChart';
import { ProductTable } from './dashboard/ProductTable';
import { AIInsights } from './dashboard/AIInsights';
import { AlertsPanel } from './dashboard/AlertsPanel';
import { SalesSection } from './inventory/SalesSection';
import { PurchaseSection } from './inventory/PurchaseSection';
import { StockManagement } from './inventory/StockManagement';
import { SalesReturnSection } from './inventory/SalesReturnSection';
import { Reports } from '../pages/Reports';
import { POSSystem } from './pos/POSSystem';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  User, LogOut, Menu, X,
  BarChart3, Package, Boxes,
  ShoppingCart, RotateCcw,
  ShoppingBag, FileText, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const StockDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'stock-management', label: 'Stock Mgmt', icon: Boxes },
    { id: 'pos', label: 'POS', icon: CreditCard },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'sales-returns', label: 'Returns', icon: RotateCcw },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  React.useEffect(() => {
    console.log("Is mobile:", isMobile);
  }, [isMobile]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className={`${isMobile ? 'px-4 py-3' : 'container mx-auto px-6 py-4'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {isMobile ? 'InvenAI' : 'Inventory Management System'}
                </h1>
                {!isMobile && <p className="text-sm text-gray-500">Smart Inventory Control</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <User className="h-4 w-4" />
                <span className="font-medium">{user?.username}</span>
                {!isMobile && <span className="text-gray-500">({user?.role})</span>}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" />
                {!isMobile && 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation */}
      {isMobile && (
        <div className="flex overflow-x-auto bg-white px-2 py-3 space-x-4 shadow-sm border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100'
                }`}
                title={tab.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Tabs */}
      {!isMobile && (
        <div className="container mx-auto px-6 py-4">
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto px-6 py-8'}`}>
        {activeTab === 'overview' ? (
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-4 gap-8'}`}>
            <div className={`${isMobile ? '' : 'lg:col-span-3'} space-y-6`}>
              <MetricsOverview />
              <InventoryChart />
            </div>
            <div className={`${isMobile ? '' : 'lg:col-span-1'}`}>
              <AlertsPanel />
            </div>
          </div>
        ) : (
          <div className="w-full">
            {activeTab === 'inventory' && <ProductTable />}
            {activeTab === 'stock-management' && <StockManagement />}
            {activeTab === 'pos' && <POSSystem />}
            {activeTab === 'sales' && <SalesSection />}
            {activeTab === 'sales-returns' && <SalesReturnSection />}
            {activeTab === 'purchases' && <PurchaseSection />}
            {activeTab === 'reports' && <Reports />}
          </div>
        )}
      </div>
    </div>
  );
};
