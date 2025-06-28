import React, { useState } from 'react';
import { useBom } from '../context/BomContext';
import { Material } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../components/icons';

const MaterialsPage = () => {
  const { state, dispatch } = useBom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Omit<Material, 'id'>>({ name: '', unit: '', pricePerUnit: 0, imageUrl: '', stockQuantity: 0 });
  const [newId, setNewId] = useState('');
  const [pasteData, setPasteData] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMaterials = state.materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (material: Material | null = null) => {
    setEditingMaterial(material);
    setPasteData(''); // Reset paste area
    if (material) {
      setFormData({ name: material.name, unit: material.unit, pricePerUnit: material.pricePerUnit, imageUrl: material.imageUrl || '', stockQuantity: material.stockQuantity });
    } else {
      setFormData({ name: '', unit: '', pricePerUnit: 0, imageUrl: '', stockQuantity: 0 });
      setNewId('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['pricePerUnit', 'stockQuantity'].includes(name) ? parseFloat(value) || 0 : value }));
  };
  
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewId(e.target.value);
  }

  const handlePasteAndParse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const pastedText = e.target.value;
    setPasteData(pastedText);

    const parts = pastedText.trim().split(/\s+/);
    if (parts.length < 3) return;

    const priceStr = parts[parts.length - 1];
    const unit = parts[parts.length - 2];
    const name = parts.slice(0, parts.length - 2).join(' ');
    
    const price = parseFloat(priceStr);

    if (name && unit && !isNaN(price)) {
        setFormData(prev => ({
            ...prev,
            name: name,
            unit: unit,
            pricePerUnit: price
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      dispatch({ type: 'UPDATE_MATERIAL', payload: { ...editingMaterial, ...formData } });
    } else {
      if (!newId || state.materials.some(m => m.id === newId)) {
        alert('รหัสวัตถุดิบต้องไม่ซ้ำกันและไม่เป็นค่าว่าง');
        return;
      }
      dispatch({ 
        type: 'ADD_MATERIAL', 
        payload: { 
          id: newId, 
          ...formData,
          imageUrl: formData.imageUrl || `https://picsum.photos/seed/${newId}/200` 
        } 
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวัตถุดิบนี้? การกระทำนี้จะลบส่วนประกอบ BOM ที่เกี่ยวข้องทั้งหมดด้วย')) {
      dispatch({ type: 'DELETE_MATERIAL', payload: id });
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">จัดการวัตถุดิบ (Materials)</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          เพิ่มวัตถุดิบ
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
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
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">ชื่อวัตถุดิบ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วยนับ</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาต่อหน่วย</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนในสต็อก</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-md object-cover" src={material.imageUrl} alt={material.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{material.name}</div>
                        <div className="text-sm text-gray-500">{material.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{material.pricePerUnit.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{material.stockQuantity.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button onClick={() => handleOpenModal(material)} className="text-indigo-600 hover:text-indigo-900 mr-3"><EditIcon className="h-5 w-5"/></button>
                    <button onClick={() => handleDelete(material.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMaterial ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบใหม่'}>
        <form onSubmit={handleSubmit} className="space-y-4">
           {!editingMaterial && (
            <div>
              <label htmlFor="paste-area" className="block text-sm font-medium text-gray-700">
                วางข้อมูลเพื่อเพิ่มอย่างรวดเร็ว
              </label>
              <textarea
                id="paste-area"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="เช่น: เม็ดพลาสติก ABS สีแดง กิโลกรัม 85.50"
                value={pasteData}
                onChange={handlePasteAndParse}
              />
              <p className="mt-1 text-xs text-gray-500">รูปแบบ: ชื่อวัตถุดิบ หน่วยนับ ราคาต่อหน่วย (คั่นด้วยเว้นวรรค)</p>
            </div>
          )}
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">รหัสวัตถุดิบ (Material ID)</label>
            <input
              type="text"
              name="id"
              id="id"
              value={editingMaterial ? editingMaterial.id : newId}
              onChange={handleIdChange}
              disabled={!!editingMaterial}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อวัตถุดิบ (Material Name)</label>
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
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL รูปภาพ (Image URL)</label>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">หน่วยนับ (Unit)</label>
              <input
                type="text"
                name="unit"
                id="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700">ราคาต่อหน่วย</label>
              <input
                type="number"
                name="pricePerUnit"
                id="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                step="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
           <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">จำนวนในสต็อก (Stock Quantity)</label>
            <input
              type="number"
              name="stockQuantity"
              id="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editingMaterial ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มวัตถุดิบ'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialsPage;