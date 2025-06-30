
import React, { useState, useMemo, useEffect } from 'react';
import { useBom } from '../context/BomContext';
import { View, DispatchOrderItem, Product, DispatchOrder } from '../types';
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
import { CalendarIcon, PlusIcon, SendIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Create Dispatch Component ---
const CreateDispatchOrder = ({ setActiveTab }: { setActiveTab: (tab: 'create' | 'history') => void }) => {
    const { state, dispatch } = useBom();
    const { products } = state;

    const [destination, setDestination] = useState('');
    const [currentItems, setCurrentItems] = useState<DispatchOrderItem[]>([]);
    
    const [productToAdd, setProductToAdd] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [poRefToAdd, setPoRefToAdd] = useState('');

    const sortedProducts = useMemo(() => [...products].sort((a,b) => a.name.localeCompare(b.name, 'th')), [products]);

    const handleAddItem = () => {
        if (!productToAdd || quantityToAdd <= 0) {
            alert('กรุณาเลือกสินค้าและระบุจำนวนที่มากกว่า 0');
            return;
        }
        
        // Check if item already exists to update quantity, or add new
        const existingItemIndex = currentItems.findIndex(item => item.productId === productToAdd && item.productionOrderRef === poRefToAdd);
        
        if(existingItemIndex > -1) {
            const updatedItems = [...currentItems];
            updatedItems[existingItemIndex].quantity += quantityToAdd;
            setCurrentItems(updatedItems);
        } else {
            setCurrentItems(prev => [...prev, { productId: productToAdd, quantity: quantityToAdd, productionOrderRef: poRefToAdd }]);
        }

        // Reset form
        setProductToAdd('');
        setQuantityToAdd(1);
        setPoRefToAdd('');
    };

    const handleRemoveItem = (productId: string, ref: string) => {
        setCurrentItems(prev => prev.filter(item => !(item.productId === productId && item.productionOrderRef === ref)));
    };

    const totalValue = useMemo(() => {
        return currentItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (item.quantity * (product?.sellingPrice || 0));
        }, 0);
    }, [currentItems, products]);
    
    const handleSaveDispatch = () => {
        if (!destination.trim()) {
            alert('กรุณาระบุปลายทาง');
            return;
        }
        if (currentItems.length === 0) {
            alert('กรุณาเพิ่มอย่างน้อย 1 รายการในใบส่งของ');
            return;
        }

        dispatch({
            type: 'ADD_DISPATCH_ORDER',
            payload: {
                id: `DO-${Date.now()}`,
                createdAt: new Date().toISOString(),
                destination,
                items: currentItems,
                totalValue
            }
        });

        alert('บันทึกใบส่งของเรียบร้อยแล้ว!');
        setDestination('');
        setCurrentItems([]);
        setActiveTab('history');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1. รายละเอียดใบส่งของ</h2>
                <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700">ปลายทาง</label>
                    <input
                        type="text"
                        id="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="เช่น ฝ่ายขาย, บริษัท ABC จำกัด"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                
                <div className="mt-6 border-t pt-4">
                     <h3 className="text-lg font-semibold text-gray-700 mb-2">2. เพิ่มรายการสินค้า</h3>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-lg">
                        <div className="md:col-span-2">
                             <label htmlFor="product" className="block text-xs font-medium text-gray-600">สินค้า</label>
                             <select id="product" value={productToAdd} onChange={e => setProductToAdd(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                 <option value="" disabled>-- เลือกสินค้า --</option>
                                 {sortedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                             </select>
                        </div>
                         <div>
                             <label htmlFor="quantity" className="block text-xs font-medium text-gray-600">จำนวน</label>
                             <input type="number" id="quantity" value={quantityToAdd} onChange={e => setQuantityToAdd(parseInt(e.target.value, 10) || 1)} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                         </div>
                        <div>
                             <label htmlFor="poRef" className="block text-xs font-medium text-gray-600">อ้างอิง PO</label>
                             <input type="text" id="poRef" value={poRefToAdd} onChange={e => setPoRefToAdd(e.target.value)} placeholder="เลขที่สั่งผลิต" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                         </div>
                         <div className="md:col-span-4 text-right">
                             <button onClick={handleAddItem} className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                <span>เพิ่มรายการ</span>
                             </button>
                         </div>
                     </div>
                </div>

            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">สรุปรายการ</h2>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                     {currentItems.length > 0 ? currentItems.map((item, idx) => {
                         const product = products.find(p => p.id === item.productId);
                         if (!product) return null;
                         return (
                            <div key={`${item.productId}-${idx}`} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-medium text-sm text-gray-800">{product.name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity} ชิ้น {item.productionOrderRef ? `(Ref: ${item.productionOrderRef})` : ''}</p>
                                </div>
                                <button onClick={() => handleRemoveItem(item.productId, item.productionOrderRef)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                         );
                     }) : <p className="text-gray-500 text-center py-8">ยังไม่มีรายการ</p>}
                 </div>
                 <div className="mt-4 pt-4 border-t-2 border-dashed">
                      <div className="flex justify-between items-center text-lg font-semibold">
                          <span>มูลค่ารวม:</span>
                          <span className="text-blue-600">{totalValue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                      </div>
                      <button 
                         onClick={handleSaveDispatch} 
                         disabled={currentItems.length === 0 || !destination}
                         className="w-full mt-4 flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                       >
                         <SendIcon className="h-5 w-5 mr-2" />
                         <span>บันทึกใบส่งของ</span>
                      </button>
                 </div>
            </div>
        </div>
    );
};

// --- History/Report Component ---

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

type ReportRow = DispatchOrderItem & {
    date: string;
    destination: string;
    productName: string;
    productImage: string;
    value: number;
    dispatchId: string;
    productionDate: string;
};

const DispatchHistory = () => {
    const { state } = useBom();
    const { dispatchOrders, products, productionOrders } = state;
    
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

    const reportData = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate.getTime());
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate.getTime());
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

        const filteredOrders = dispatchOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });

        const flattenedData: ReportRow[] = filteredOrders.flatMap(order => 
            order.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                const productionOrder = productionOrders.find(po => po.id === item.productionOrderRef);
                return {
                    ...item,
                    dispatchId: order.id,
                    date: order.createdAt,
                    destination: order.destination,
                    productName: product?.name || 'N/A',
                    productImage: product?.imageUrl || '',
                    value: item.quantity * (product?.sellingPrice || 0),
                    productionDate: productionOrder ? new Date(productionOrder.createdAt).toLocaleDateString('th-TH') : '-'
                }
            })
        );
        
        if (sortConfig !== null) {
            flattenedData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                let comparison = 0;
                if (typeof aValue === 'string' && typeof bValue === 'string') {
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
        return flattenedData;
    }, [dispatchOrders, products, productionOrders, startDate, endDate, sortConfig]);

    const chartData = useMemo(() => {
        const dataByDestination: Record<string, number> = {};
        reportData.forEach(item => {
            dataByDestination[item.destination] = (dataByDestination[item.destination] || 0) + item.value;
        });

        const sortedDestinations = Object.entries(dataByDestination).sort((a,b) => b[1] - a[1]).slice(0, 10); // Top 10
        
        return {
            labels: sortedDestinations.map(d => d[0]),
            datasets: [{
                label: 'มูลค่าการส่งออก (ราคาขาย)',
                data: sortedDestinations.map(d => d[1]),
                backgroundColor: 'rgba(217, 70, 239, 0.7)', // Fuchsia color
                borderColor: 'rgba(217, 70, 239, 1)',
                borderWidth: 1,
            }]
        };

    }, [reportData]);

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
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">ประวัติการส่งออก</h2>
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

            {reportData.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-lg shadow">
                    <p className="text-lg text-gray-500">ไม่พบข้อมูลการส่งออกในช่วงเวลาที่เลือก</p>
                </div>
            ) : (
            <>
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปมูลค่าส่งออกตามปลายทาง (Top 10)</h3>
                    <div className="h-80">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('date')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">วันที่ส่ง</span>{getSortIndicator('date')}</button></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('destination')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">ปลายทาง</span>{getSortIndicator('destination')}</button></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('productName')} className="flex items-center space-x-1 group"><span className="group-hover:text-gray-900">สินค้า</span>{getSortIndicator('productName')}</button></th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('quantity')} className="flex items-center space-x-1 group ml-auto"><span className="group-hover:text-gray-900">จำนวน</span>{getSortIndicator('quantity')}</button></th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('value')} className="flex items-center space-x-1 group ml-auto"><span className="group-hover:text-gray-900">มูลค่า</span>{getSortIndicator('value')}</button></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อ้างอิง PO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ผลิต</th>
                                </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                 {reportData.map((item, index) => (
                                     <tr key={`${item.dispatchId}-${item.productId}-${index}`}>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.date).toLocaleDateString('th-TH')}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{item.destination}</td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="flex items-center">
                                                 <div className="flex-shrink-0 h-10 w-10">
                                                     <img className="h-10 w-10 rounded-md object-cover" src={item.productImage} alt={item.productName} />
                                                 </div>
                                                 <div className="ml-4">
                                                     <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                     <div className="text-sm text-gray-500">{item.productId}</div>
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">{item.quantity.toLocaleString()} ชิ้น</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">{item.value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productionOrderRef || '-'}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productionDate}</td>
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

const DispatchPage = ({ setView }: { setView: React.Dispatch<React.SetStateAction<View>> }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><SendIcon className="h-7 w-7 mr-3 text-gray-700"/>ส่งออกสินค้า</h1>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-4 px-6 block hover:text-blue-500 focus:outline-none font-medium ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          สร้างใบส่งของ
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-4 px-6 block hover:text-blue-500 focus:outline-none font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          ประวัติการส่งออก
        </button>
      </div>

      <div>
        {activeTab === 'create' ? <CreateDispatchOrder setActiveTab={setActiveTab} /> : <DispatchHistory />}
      </div>
    </div>
  );
};


export default DispatchPage;
