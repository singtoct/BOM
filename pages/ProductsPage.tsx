
import React, { useState } from 'react';
import { useBom } from '../context/BomContext';
import { Product, View } from '../types';
import Modal from '../components/Modal';
import { PlusIcon } from '../components/icons';

interface ProductsPageProps {
  setView: React.Dispatch<React.SetStateAction<View>>;
}

const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
  >
    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{product.id}</p>
      <p className="text-sm font-medium text-gray-600">ต้นทุนวัตถุดิบรวม:</p>
      <p className="text-xl font-bold text-green-600">{product.totalMaterialCost.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
    </div>
  </div>
);

const ProductsPage = ({ setView }: ProductsPageProps) => {
  const { state, dispatch } = useBom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'totalMaterialCost'>>({ name: '', imageUrl: '' });
  const [newId, setNewId] = useState('');
  const [pasteData, setPasteData] = useState('');

  const handleOpenModal = () => {
    setFormData({ name: '', imageUrl: '' });
    setNewId('');
    setPasteData('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      totalMaterialCost: 0
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    handleCloseModal();
  };


  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">รายการสินค้า (Products)</h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          เพิ่มสินค้า
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.products.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => setView({ type: 'product-detail', productId: product.id })} />
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
