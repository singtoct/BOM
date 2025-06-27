
import React, { useState, useMemo } from 'react';
import { useBom } from '../context/BomContext';
import { View, BomComponent, BomComponentWithDetails } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, TrashIcon, PackageIcon, CopyIcon } from '../components/icons';

interface ProductDetailPageProps {
  productId: string;
  setView: React.Dispatch<React.SetStateAction<View>>;
}

const ProductDetailPage = ({ productId, setView }: ProductDetailPageProps) => {
  const { state, dispatch } = useBom();
  
  // State for Add/Edit Component Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<BomComponent | null>(null);
  const initialFormState = { materialId: '', quantity: 0 };
  const [formData, setFormData] = useState(initialFormState);

  // State for Copy BOM Modal
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [sourceProductToCopy, setSourceProductToCopy] = useState('');


  const product = useMemo(() => state.products.find(p => p.id === productId), [state.products, productId]);
  
  const bomComponentsWithDetails: BomComponentWithDetails[] = useMemo(() => {
    return state.bomComponents
      .filter(bom => bom.productId === productId)
      .map(bom => {
        const material = state.materials.find(m => m.id === bom.materialId);
        if (!material) return null;
        return {
          ...bom,
          materialName: material.name,
          materialUnit: material.unit,
          materialPricePerUnit: material.pricePerUnit,
          componentCost: bom.quantity * material.pricePerUnit,
        };
      })
      .filter((b): b is BomComponentWithDetails => b !== null);
  }, [state.bomComponents, state.materials, productId]);

  if (!product) {
    return (
      <div className="text-center text-red-500">
        <p>ไม่พบสินค้า</p>
        <button onClick={() => setView({type: 'products'})} className="text-blue-600 hover:underline">กลับไปหน้ารายการสินค้า</button>
      </div>
    );
  }
  
  const availableMaterials = state.materials.filter(
      material => !bomComponentsWithDetails.some(bom => bom.materialId === material.id && bom.id !== editingComponent?.id)
  );


  const handleOpenModal = (component: BomComponent | null = null) => {
    setEditingComponent(component);
    if (component) {
      setFormData({ materialId: component.materialId, quantity: component.quantity });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingComponent(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: name === 'quantity' ? parseFloat(value) || 0 : value}));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialId || formData.quantity <= 0) {
      alert("กรุณาเลือกวัตถุดิบและระบุปริมาณที่มากกว่า 0");
      return;
    }
  
    if (editingComponent) {
      const updatedComponent: BomComponent = {
        ...editingComponent,
        ...formData
      };
      dispatch({ type: 'UPDATE_BOM_COMPONENT', payload: updatedComponent });
    } else {
      const newComponent: BomComponent = {
        id: `${productId}-${formData.materialId}`,
        productId: productId,
        ...formData
      };
      dispatch({ type: 'ADD_BOM_COMPONENT', payload: newComponent });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
      if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบส่วนประกอบนี้?')) {
          dispatch({ type: 'DELETE_BOM_COMPONENT', payload: id });
      }
  };

  const handleDeleteProduct = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้ทั้งหมด?')) {
        dispatch({ type: 'DELETE_PRODUCT', payload: productId });
        setView({ type: 'products' });
    }
  }
  
  const handleCopyBom = (e: React.FormEvent) => {
      e.preventDefault();
      if (!sourceProductToCopy) {
          alert('กรุณาเลือกสินค้าต้นทาง');
          return;
      }
      dispatch({
          type: 'COPY_BOM_COMPONENTS',
          payload: { sourceProductId: sourceProductToCopy, targetProductId: productId }
      });
      setIsCopyModalOpen(false);
      setSourceProductToCopy('');
  };


  return (
    <div className="container mx-auto">
      <button onClick={() => setView({type: 'products'})} className="text-blue-600 hover:underline mb-4 inline-block">&larr; กลับไปหน้ารายการสินค้า</button>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <img src={product.imageUrl} alt={product.name} className="w-full md:w-1/3 h-auto object-cover rounded-lg"/>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
                <p className="text-md text-gray-500 mb-4">{product.id}</p>
              </div>
               <button onClick={handleDeleteProduct} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                  <TrashIcon className="h-5 w-5"/>
              </button>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg">
              <p className="text-sm font-semibold">ต้นทุนวัตถุดิบรวม (Total Material Cost)</p>
              <p className="text-4xl font-extrabold">{product.totalMaterialCost.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center"><PackageIcon className="h-6 w-6 mr-2 text-gray-600"/>ส่วนประกอบ BOM</h2>
          <div className="flex items-center space-x-2">
            <button
                onClick={() => setIsCopyModalOpen(true)}
                className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
                >
                <CopyIcon className="h-5 w-5 mr-2" />
                คัดลอก BOM
            </button>
            <button
                onClick={() => handleOpenModal()}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                เพิ่มส่วนประกอบ
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วัตถุดิบ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ปริมาณที่ใช้</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ต้นทุนส่วนประกอบ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bomComponentsWithDetails.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{c.materialName}</div>
                      <div className="text-sm text-gray-500">{c.materialId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{c.quantity.toLocaleString()} {c.materialUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">{c.componentCost.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button onClick={() => handleOpenModal(c)} className="text-indigo-600 hover:text-indigo-900 mr-3"><EditIcon className="h-5 w-5"/></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bomComponentsWithDetails.length === 0 && (
            <div className="text-center py-8 text-gray-500">ยังไม่มีส่วนประกอบใน BOM</div>
          )}
        </div>
      </div>
      
       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingComponent ? 'แก้ไขส่วนประกอบ' : 'เพิ่มส่วนประกอบใหม่'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="materialId" className="block text-sm font-medium text-gray-700">วัตถุดิบ</label>
            <select
              name="materialId"
              id="materialId"
              value={formData.materialId}
              onChange={handleChange}
              disabled={!!editingComponent}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100"
            >
              <option value="" disabled>-- เลือกวัตถุดิบ --</option>
              {editingComponent && <option value={editingComponent.materialId}>{state.materials.find(m => m.id === editingComponent.materialId)?.name}</option>}
              {availableMaterials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">ปริมาณที่ใช้</label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              step="any"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editingComponent ? 'บันทึก' : 'เพิ่ม'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} title="คัดลอกส่วนประกอบ BOM จากสินค้าอื่น">
        <form onSubmit={handleCopyBom} className="space-y-4">
            <div>
            <label htmlFor="sourceProduct" className="block text-sm font-medium text-gray-700">
                เลือกสินค้าต้นทาง
            </label>
            <select
                id="sourceProduct"
                value={sourceProductToCopy}
                onChange={(e) => setSourceProductToCopy(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                <option value="" disabled>-- เลือกสินค้า --</option>
                {state.products.filter(p => p.id !== productId).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
                ระบบจะคัดลอกส่วนประกอบที่ยังไม่มีในสินค้าปัจจุบันเท่านั้น
            </p>
            </div>
            <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsCopyModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">คัดลอก</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
