
import React, { useState } from 'react';
import { View } from './types';
import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import MaterialsPage from './pages/MaterialsPage';
import ProductDetailPage from './pages/ProductDetailPage';

const App = () => {
  const [view, setView] = useState<View>({ type: 'products' });

  const renderView = () => {
    switch (view.type) {
      case 'products':
        return <ProductsPage setView={setView} />;
      case 'materials':
        return <MaterialsPage />;
      case 'product-detail':
        return <ProductDetailPage productId={view.productId} setView={setView} />;
      default:
        return <ProductsPage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header setView={setView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
