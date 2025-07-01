
import React, { useState, useMemo, useEffect } from 'react';
import { useBom } from '../context/BomContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CalendarIcon, TruckIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getDatesForPreset = (preset: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
        case 'today':
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'thisMonth':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'thisYear':
        default:
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
    }
    return { startDate: start, endDate: end };
};

type ReportRow = {
  date: string;
  type: 'วัตถุดิบ' | 'สินค้า';
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string;
};

const ReceiptReportPage = () => {
  const { state } = useBom();
  const { goodsReceipts, productionOrders, materials, products } = state;

  const [filterPreset, setFilterPreset] = useState('thisYear');
  const [startDate, setStartDate] = useState<Date>(() => getDatesForPreset('thisYear').startDate);
  const [endDate, setEndDate] = useState<Date>(() => getDatesForPreset('thisYear').endDate);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ReportRow; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  useEffect(() => {
    if (filterPreset === 'custom') return;
    const { startDate: newStart, endDate: newEnd } = getDatesForPreset(filterPreset);
    setStartDate(newStart);
    setEndDate(newEnd);
  }, [filterPreset]);

  const combinedReportData = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate.getTime());
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate.getTime());
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    const materialReceiptRows: ReportRow[] = goodsReceipts
      .filter(receipt => {
          const receiptDate = new Date(receipt.receiptDate);
          return receiptDate >= start && receiptDate <= end;
      })
      .map(receipt => {
          const material = materials.find(m => m.id === receipt.materialId);
          return {
              date: receipt.receiptDate,
              type: 'วัตถุดิบ',
              itemId: receipt.materialId,
              name: material?.name || 'ไม่พบวัตถุดิบ',
              quantity: receipt.quantity,
              unit: material?.unit || '',
              notes: receipt.notes,
          };
      });

    const productReceiptRows: ReportRow[] = productionOrders
      .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate <= end;
      })
      .flatMap(order => 
        order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                date: order.createdAt,
                type: 'สินค้า',
                itemId: item.productId,
                name: product?.name || 'ไม่พบสินค้า',
                quantity: item.quantity,
                unit: 'ชิ้น',
                notes: `จากคำสั่งผลิต #${order.id.substring(3)}`,
            };
        })
      );
      
    const combined = [...materialReceiptRows, ...productReceiptRows];
    
    if (sortConfig !== null) {
        combined.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                 // Special case for date sorting
                if (sortConfig.key === 'date') {
                    comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
                } else {
                    comparison = aValue.localeCompare(bValue, 'th');
                }
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }

    return combined;
  }, [goodsReceipts, productionOrders, materials, products, startDate, endDate, sortConfig]);

   const chartData = useMemo(() => {
    const monthlyData: Record<string, { materials: number; products: number }> = {};

    combinedReportData.forEach(row => {
        const month = new Date(row.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
            monthlyData[month] = { materials: 0, products: 0 };
        }
        const item = row.type === 'วัตถุดิบ' ? materials.find(m => m.id === row.itemId) : products.find(p => p.id === row.itemId);
        const value = row.quantity * (row.type === 'วัตถุดิบ' ? (item as any)?.pricePerUnit || 0 : (item as any)?.totalMaterialCost || 0);

        if (row.type === 'วัตถุดิบ') {
            monthlyData[month].materials += value;
        } else {
            monthlyData[month].products += value;
        }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    return {
        labels: sortedMonths,
        datasets: [
            {
                label: 'มูลค่าวัตถุดิบรับเข้า',
                data: sortedMonths.map(month => monthlyData[month].materials),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            },
            {
                label: 'มูลค่าสินค้าที่ผลิต',
                data: sortedMonths.map(month => monthlyData[month].products),
                backgroundColor: 'rgba(22, 163, 74, 0.7)',
            },
        ],
    };
  }, [combinedReportData, materials, products]);


  const requestSort = (key: keyof ReportRow) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof ReportRow) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />;
  };
  
  const dateToInputString = (date: Date) => date.toISOString().split('T')[0];

  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center"><TruckIcon className="h-7 w-7 mr-3 text-gray-700"/> รายงานการรับเข้า</h1>
         <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-2 rounded-lg">
             <select value={filterPreset} onChange={(e) => setFilterPreset(e.target.value)} className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2">
                 <option value="thisYear">ปีปัจจุบัน</option>
                 <option value="thisMonth">เดือนปัจจุบัน</option>
                 <option value="today">วันนี้</option>
                 <option value="custom">กำหนดเอง</option>
             </select>
             <div className="relative">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="w-5 h-5 text-gray-500" /></div>
                 <input type="date" value={dateToInputString(startDate)} onChange={(e) => { const d = new Date(e.target.value); if(!isNaN(d.getTime())) { setStartDate(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); setFilterPreset('custom'); }}} className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2" />
             </div>
             <div className="relative">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="w-5 h-5 text-gray-500" /></div>
                 <input type="date" value={dateToInputString(endDate)} onChange={(e) => { const d = new Date(e.target.value); if(!isNaN(d.getTime())) { setEndDate(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); setFilterPreset('custom'); }}} className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2" />
             </div>
         </div>
      </div>
      
      {combinedReportData.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-lg text-gray-500">ไม่พบข้อมูลการรับเข้าในช่วงเวลาที่เลือก</p>
        </div>
      ) : (
      <>
        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปมูลค่าการรับเข้า (ตามต้นทุน)</h3>
            <div className="h-80">
                <Bar options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} data={chartData} />
            </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
           <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       <button onClick={() => requestSort('date')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">วันที่</span>{getSortIndicator('date')}</button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       <button onClick={() => requestSort('type')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">ประเภท</span>{getSortIndicator('type')}</button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => requestSort('name')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">รายการ</span>{getSortIndicator('name')}</button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => requestSort('quantity')} className="flex items-center space-x-1 group ml-auto"><span className="group-hover:text-gray-900">จำนวน</span>{getSortIndicator('quantity')}</button>
                    </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => requestSort('unit')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">หน่วย</span>{getSortIndicator('unit')}</button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {combinedReportData.map((row, index) => (
                        <tr key={`${row.itemId}-${row.date}-${index}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(row.date).toLocaleDateString('th-TH')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.type === 'วัตถุดิบ' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{row.type}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{row.name}</div>
                                <div className="text-sm text-gray-500">{row.itemId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold text-right">{row.quantity.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.unit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.notes}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
           </div>
        </div>
      </>
      )}
    </div>
  );
};

export default ReceiptReportPage;