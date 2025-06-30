

import React, { useState } from 'react';
import { View } from './types';
import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import MaterialsPage from './pages/MaterialsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductionCalculatorPage from './pages/ProductionCalculatorPage';
import DashboardPage from './pages/DashboardPage';
import ReceiptReportPage from './pages/ReceiptReportPage';
import DispatchPage from './pages/DispatchPage';
import Sidebar from './components/Sidebar';

const App = () => {
  const [view, setView] = useState<View>({ type: 'dashboard' });

  const renderView = () => {
    switch (view.type) {
      case 'dashboard':
        return <DashboardPage setView={setView} />;
      case 'products':
        return <ProductsPage setView={setView} />;
      case 'materials':
        return <MaterialsPage />;
      case 'product-detail':
        return <ProductDetailPage productId={view.productId} setView={setView} />;
      case 'calculator':
        return <ProductionCalculatorPage />;
      case 'receipt-report':
        return <ReceiptReportPage />;
      case 'dispatch':
        return <DispatchPage setView={setView} />;
      default:
        return <DashboardPage setView={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      <Sidebar currentViewType={view.type} setView={setView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
