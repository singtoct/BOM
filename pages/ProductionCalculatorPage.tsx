

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useBom } from '../context/BomContext';
import { CalculatorIcon, FileDownIcon } from '../components/icons';
import { ProductionOrderItem } from '../types';

interface CalculationResult {
  materialId: string;
  materialName: string;
  materialUnit: string;
  materialImageUrl?: string;
  pricePerUnit: number;
  requiredQuantity: number;
  stockQuantity: number;
  shortage: number;
}

const ProductionCalculatorPage = () => {
  const { state, dispatch } = useBom();
  const { products, materials, bomComponents } = state;

  const [productionPlan, setProductionPlan] = useState<Record<string, number>>({});
  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const [isPlanSaved, setIsPlanSaved] = useState(false);

  const handlePlanChange = (productId: string, quantity: number) => {
    setProductionPlan(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity), // Ensure quantity is not negative
    }));
    setResults(null); // Reset results when plan changes
    setIsPlanSaved(false);
  };

  const handleCalculate = () => {
    const totalRequirements: Record<string, number> = {};

    // Calculate total required quantity for each material
    for (const productId in productionPlan) {
      const quantityToProduce = productionPlan[productId];
      if (quantityToProduce > 0) {
        const productBoms = bomComponents.filter(bom => bom.productId === productId);
        for (const bom of productBoms) {
          totalRequirements[bom.materialId] = (totalRequirements[bom.materialId] || 0) + (bom.quantity * quantityToProduce);
        }
      }
    }
    
    // Format results for display
    const calculatedResults = Object.keys(totalRequirements).map((materialId): CalculationResult | null => {
      const material = materials.find(m => m.id === materialId);
      if (!material) return null;

      const requiredQuantity = totalRequirements[materialId];
      const stockQuantity = material.stockQuantity;
      const shortage = Math.max(0, requiredQuantity - stockQuantity);

      return {
        materialId,
        materialName: material.name,
        materialUnit: material.unit,
        materialImageUrl: material.imageUrl,
        pricePerUnit: material.pricePerUnit,
        requiredQuantity,
        stockQuantity,
        shortage,
      };
    }).filter((r): r is CalculationResult => r !== null)
      .sort((a,b) => b.shortage - a.shortage); // Sort by shortage descending

    setResults(calculatedResults);
    setIsPlanSaved(false);
  };

  const totalPurchaseCost = useMemo(() => {
      if(!results) return 0;
      return results.reduce((sum, item) => sum + (item.shortage * item.pricePerUnit), 0);
  }, [results]);
  
  const handleExportExcel = () => {
    if (!results) {
        alert("ไม่มีข้อมูลสำหรับส่งออก");
        return;
    }

    const purchaseList = results.filter(item => item.shortage > 0);
    if (purchaseList.length === 0) {
        alert("ไม่มีวัตถุดิบที่ต้องสั่งซื้อเพิ่ม");
        return;
    }

    const worksheetData = [
        ["รหัสวัตถุดิบ", "ชื่อวัตถุดิบ", "จำนวนที่ต้องซื้อเพิ่ม", "หน่วย", "ราคาต่อหน่วย (บาท)", "ราคารวม (บาท)"],
        ...purchaseList.map(item => [
            item.materialId,
            item.materialName,
            item.shortage,
            item.materialUnit,
            item.pricePerUnit,
            item.shortage * item.pricePerUnit
        ]),
        [], // Empty row for spacing
        ["", "", "", "", "รวมค่าใช้จ่ายทั้งหมด:", totalPurchaseCost]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 15 }, // Material ID
        { wch: 40 }, // Material Name
        { wch: 20 }, // Quantity to Purchase
        { wch: 10 }, // Unit
        { wch: 20 }, // Price Per Unit
        { wch: 20 }  // Total Purchase Cost
    ];
    
    // Apply number formatting to currency and quantity columns
    const moneyFormat = '#,##0.00';
    purchaseList.forEach((_, index) => {
        const rowIndex = index + 2; // +1 for header row, +1 for 1-based index
        worksheet[`C${rowIndex}`].z = moneyFormat;
        worksheet[`E${rowIndex}`].z = moneyFormat;
        worksheet[`F${rowIndex}`].z = moneyFormat;
    });
    
    const totalRowIndex = purchaseList.length + 4;
    if (worksheet[`F${totalRowIndex}`]) {
        worksheet[`F${totalRowIndex}`].z = moneyFormat;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายการจัดซื้อวัตถุดิบ");

    XLSX.writeFile(workbook, "รายการจัดซื้อวัตถุดิบ.xlsx");
  };
  
  const handleSaveProductionPlan = () => {
      const items: ProductionOrderItem[] = Object.entries(productionPlan)
        .filter(([, quantity]) => quantity > 0)
        .map(([productId, quantity]) => ({ productId, quantity }));

      if (items.length === 0) {
          alert("ไม่สามารถบันทึกแผนการผลิตที่ว่างเปล่าได้");
          return;
      }

      dispatch({
          type: 'ADD_PRODUCTION_ORDER',
          payload: {
              id: `PO-${Date.now()}`,
              createdAt: new Date().toISOString(),
              items: items,
              totalPurchaseCost: totalPurchaseCost
          }
      });
      setIsPlanSaved(true);
      alert("บันทึกแผนการผลิตเรียบร้อยแล้ว และปรับปรุงสต็อกวัตถุดิบแล้ว!");
  };


  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <CalculatorIcon className="h-7 w-7 mr-3 text-gray-700"/>
            <span>เครื่องคำนวณการผลิต</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Plan Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. สร้างแผนการผลิต</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {products.sort((a,b) => a.name.localeCompare(b.name)).map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                           <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                           <div>
                             <p className="font-medium text-gray-800">{product.name}</p>
                             <p className="text-xs text-gray-500">{product.id}</p>
                           </div>
                        </div>
                        <input
                            type="number"
                            placeholder="จำนวน"
                            value={productionPlan[product.id] || ''}
                            onChange={(e) => handlePlanChange(product.id, parseInt(e.target.value, 10) || 0)}
                            className="w-28 text-right px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                ))}
            </div>
            <div className="mt-6">
                 <button
                    onClick={handleCalculate}
                    className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                    <CalculatorIcon className="h-5 w-5 mr-2" />
                    <span>คำนวณความต้องการวัตถุดิบ</span>
                </button>
            </div>
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h2 className="text-xl font-semibold text-gray-800 mb-4">2. ผลลัพธ์</h2>
           {results ? (
             <div className="space-y-3">
                 <div className="max-h-[50vh] overflow-y-auto pr-2">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50 sticky top-0">
                             <tr>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วัตถุดิบ</th>
                                 <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ต้องการ</th>
                                 <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">มีในสต็อก</th>
                                 <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ต้องซื้อเพิ่ม</th>
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {results.map(res => (
                                 <tr key={res.materialId} className={res.shortage > 0 ? 'bg-red-50' : 'bg-green-50'}>
                                     <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={res.materialImageUrl} alt={res.materialName} className="w-8 h-8 rounded-md object-cover mr-3"/>
                                            <div>
                                                 <p className="text-sm font-medium text-gray-900">{res.materialName}</p>
                                                 <p className="text-xs text-gray-500">{res.materialId}</p>
                                            </div>
                                        </div>
                                     </td>
                                     <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-700">{res.requiredQuantity.toLocaleString(undefined, {maximumFractionDigits: 2})} {res.materialUnit}</td>
                                     <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-700">{res.stockQuantity.toLocaleString(undefined, {maximumFractionDigits: 2})} {res.materialUnit}</td>
                                     <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-red-600">
                                        {res.shortage > 0 ? `${res.shortage.toLocaleString(undefined, {maximumFractionDigits: 2})} ${res.materialUnit}` : '-'}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                 <div className="mt-4 pt-4 border-t-2 border-dashed">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">สรุปการจัดซื้อ</h3>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-lg shadow hover:bg-green-700 transition-colors text-sm font-medium"
                            disabled={!results || results.filter(r => r.shortage > 0).length === 0}
                         >
                            <FileDownIcon className="h-4 w-4 mr-2" />
                            <span>ส่งออกเป็น Excel</span>
                        </button>
                     </div>
                     <div className="flex justify-between items-center bg-yellow-100 p-4 rounded-lg">
                         <span className="font-bold text-yellow-800">รวมค่าใช้จ่ายที่ต้องซื้อเพิ่ม:</span>
                         <span className="text-2xl font-bold text-yellow-900">{totalPurchaseCost.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                     </div>
                 </div>

                 <div className="mt-6">
                    <button 
                        onClick={handleSaveProductionPlan}
                        disabled={isPlanSaved}
                        className="w-full flex items-center justify-center px-6 py-3 rounded-lg shadow text-lg font-semibold transition-colors
                                   disabled:bg-gray-400 disabled:cursor-not-allowed
                                   bg-teal-600 text-white hover:bg-teal-700"
                    >
                        {isPlanSaved ? 'บันทึกแผนการผลิตนี้แล้ว' : 'บันทึกแผนการผลิตนี้'}
                    </button>
                 </div>
             </div>
           ) : (
             <div className="text-center py-20 text-gray-500">
               <p>กรอกจำนวนสินค้าที่ต้องการผลิตในแผนการผลิต แล้วกดปุ่มคำนวณเพื่อดูผลลัพธ์</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductionCalculatorPage;