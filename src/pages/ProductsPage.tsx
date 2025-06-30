

import React, { useState } from 'react';
import { useBom } from '../context/BomContext';
import { Product, View } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, GridIcon, LayoutGridIcon, ListIcon, SearchIcon } from '../components/icons';

interface ProductsPageProps {
  setView: React.Dispatch<React.SetStateAction<View>>;
}

type ViewMode = 'large' | 'small' | 'list';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  viewMode: ViewMode;
}

const ProductCard = ({ product, onClick, viewMode }: ProductCardProps) => {
  const profit = product.sellingPrice - product.totalMaterialCost;
  const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';

  if (viewMode === 'list') {
    return (
      <div onClick={onClick} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 flex items-center p-3 w-full">
        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
        <div className="flex-grow ml-4">
          <h3 className="font-semibold text-md text-gray-800 truncate" title={product.name}>{product.name}</h3>
          <p className="text-sm text-gray-500">{product.id}</p>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-right pr-4">
            <div className="w-28">
                <p className="text-xs text-gray-500">ต้นทุน</p>
                <p className="text-sm font-bold text-gray-800">{product.totalMaterialCost.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
            </div>
            <div className="w-28">
                <p className="text-xs text-gray-500">ราคาขาย</p>
                <p className="text-sm font-bold text-blue-600">{product.sellingPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
            </div>
            <div className="w-28">
                <p className="text-xs text-gray-500">กำไร</p>
                <p className={`text-sm font-bold ${profitColor}`}>{profit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
            </div>
        </div>
      </div>
    );
  }

  const isSmall = viewMode === 'small';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
    >
      <img src={product.imageUrl} alt={product.name} className={`w-full ${isSmall ? 'h-32' : 'h-48'} object-cover`} />
      <div className={isSmall ? 'p-2' : 'p-4'}>
        <h3 className={`${isSmall ? 'text-base' : 'text-lg'} font-semibold text-gray-800 truncate`} title={product.name}>{product.name}</h3>
        {!isSmall && <p className="text-sm text-gray-500 mb-2">{product.id}</p>}
        <div className={`mt-2 ${isSmall ? 'space-y-1' : 'space-y-2'}`}>
            <div>
                <p className="text-xs text-gray-500">ต้นทุน</p>
                <p className={`${isSmall ? 'text-sm' : 'text-md'} font-bold text-gray-800`}>{product.totalMaterialCost.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}</p>
            </div>
             <div>
                <p className="text-xs text-gray-500">ราคาขาย</p>
                <p className={`${isSmall ? 'text-sm' : 'text-md'} font-bold text-blue-600`}>{product.sellingPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500">กำไร</p>
                <p className={`${isSmall ? 'text-sm' : 'text-md'} font-bold ${profitColor}`}>{profit.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}</p>
            </div>
        </div>
      </div>
    </div>
  );
};


const ProductsPage = ({ setView }: ProductsPageProps) => {
  const { state, dispatch } = useBom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'totalMaterialCost'>>({ name: '', imageUrl: '', sellingPrice: 0 });
  const [newId, setNewId] = useState('');
  const [pasteData, setPasteData] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('large');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setFormData({ name: '', imageUrl: '', sellingPrice: 0 });
    setNewId('');
    setPasteData('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'sellingPrice' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewId(e.target.value);
  }

  const handlePasteAndParse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const pastedText = e.target.value;
    setPasteData(pastedText);

    const firstLine = pastedText.split('\n')[0].trim();
    if (!firstLine) return;
    
    const parts = firstLine.split(/\s+/);
    if (parts.length < 2) return;

    const id = parts[0];
    const name = parts.slice(1).join(' ');

    if (id && name) {
        setNewId(id);
        setFormData(prev => ({ ...prev, name: name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || state.products.some(p => p.id === newId)) {
      alert('รหัสสินค้าต้องไม่ซ้ำกันและไม่เป็นค่าว่าง');
      return;
    }
    const newProduct: Product = {
      id: newId,
      name: formData.name,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${newId}/400/300`,
      totalMaterialCost: 0,
      sellingPrice: formData.sellingPrice
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    handleCloseModal();
  };
  
  const viewClasses: Record<ViewMode, string> = {
    large: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    small: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
    list: 'flex flex-col gap-3',
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">รายการสินค้า (Products)</h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span>เพิ่มสินค้า</span>
        </button>
      </div>

       <div className="bg-white p-2 rounded-lg shadow-sm mb-6 flex items-center justify-between flex-wrap gap-4">
           <div className="relative flex-grow max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                  type="text"
                  placeholder="ค้นหาด้วยชื่อ หรือ รหัส..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
          <div className="flex items-center space-x-1">
             <span className="text-sm font-semibold text-gray-600 mr-2">มุมมอง:</span>
             <button title="Large Grid View" onClick={() => setViewMode('large')} className={`p-2 rounded-md ${viewMode === 'large' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                <GridIcon className="h-5 w-5" />
            </button>
            <button title="Small Grid View" onClick={() => setViewMode('small')} className={`p-2 rounded-md ${viewMode === 'small' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                <LayoutGridIcon className="h-5 w-5" />
            </button>
            <button title="List View" onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                <ListIcon className="h-5 w-5" />
            </button>
          </div>
      </div>

      <div className={viewClasses[viewMode]}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => setView({ type: 'product-detail', productId: product.id })} viewMode={viewMode}/>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="เพิ่มสินค้าใหม่">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="paste-area" className="block text-sm font-medium text-gray-700">
              วางข้อมูลเพื่อเพิ่มอย่างรวดเร็ว
            </label>
            <textarea
              id="paste-area"
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="เช่น: PROD-003 ฝาครอบสีแดง"
              value={pasteData}
              onChange={handlePasteAndParse}
            />
            <p className="mt-1 text-xs text-gray-500">รูปแบบ: รหัสสินค้า ชื่อสินค้า (คั่นด้วยเว้นวรรค)</p>
          </div>
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">รหัสสินค้า (Product ID)</label>
            <input
              type="text"
              name="id"
              id="id"
              value={newId}
              onChange={handleIdChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name)</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
           <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">ราคาขาย (Selling Price)</label>
            <input
              type="number"
              name="sellingPrice"
              id="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL รูปภาพ (Product Image URL)</label>
            <input
              type="text"
              name="imageUrl"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="ปล่อยว่างเพื่อใช้รูปภาพอัตโนมัติ"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">เพิ่มสินค้า</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
