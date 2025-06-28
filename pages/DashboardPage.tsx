
import React, { useState, useMemo } from 'react';
import { useBom } from '../context/BomContext';
import { View } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);


const DashboardPage = ({ setView }: { setView: React.Dispatch<React.SetStateAction<View>> }) => {
  const { state } = useBom();
  const { productionOrders, products } = state;

  const [filterPreset, setFilterPreset] = useState<string>('currentYear');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().getFullYear(), 11, 31));

  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return [];

    const effectiveStartDate = new Date(startDate);
    effectiveStartDate.setHours(0, 0, 0, 0);

    const effectiveEndDate = new Date(endDate);
    effectiveEndDate.setHours(23, 59, 59, 999);

    if (filterPreset === 'all') {
        return productionOrders;
    }

    return productionOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= effectiveStartDate && orderDate <= effectiveEndDate;
    });
  }, [productionOrders, startDate, endDate, filterPreset]);
  
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value;
    setFilterPreset(preset);
    const today = new Date();

    switch (preset) {
        case 'currentYear':
            setStartDate(new Date(today.getFullYear(), 0, 1));
            setEndDate(new Date(today.getFullYear(), 11, 31));
            break;
        case 'currentMonth':
            setStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
            setEndDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
            break;
        case 'last30days':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
            setStartDate(thirtyDaysAgo);
            setEndDate(new Date());
            break;
        case 'last7days':
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            setStartDate(sevenDaysAgo);
            setEndDate(new Date());
            break;
        case 'all':
             // Set a very early start date and today as end date
            setStartDate(new Date('1970-01-01'));
            setEndDate(new Date());
            break;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const dateValue = e.target.value;
    if (!dateValue) return;

    const [year, month, day] = dateValue.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    if (isStart) {
        setStartDate(localDate);
        if (localDate > endDate) {
            setEndDate(localDate);
        }
    } else {
        setEndDate(localDate);
    }
    setFilterPreset('custom');
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalMaterialCost = 0;
    let totalProductsManufactured = 0;
    const productCounts: Record<string, number> = {};

    for (const order of filteredOrders) {
      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalRevenue += item.quantity * product.sellingPrice;
          totalMaterialCost += item.quantity * product.totalMaterialCost;
          totalProductsManufactured += item.quantity;

          productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
        }
      }
    }

    const totalPurchaseCost = filteredOrders.reduce((sum, order) => sum + order.totalPurchaseCost, 0);
    const totalProfit = totalRevenue - totalMaterialCost;
    
    const topProducts = Object.entries(productCounts)
        .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
        .slice(0, 5)
        .map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return {
                name: product ? product.name : 'Unknown Product',
                quantity,
            }
        });

    return {
      totalRevenue,
      totalMaterialCost,
      totalProfit,
      totalPurchaseCost,
      totalOrders: filteredOrders.length,
      totalProductsManufactured,
      topProducts,
    };
  }, [filteredOrders, products]);

  const topProductsChartData = {
    labels: stats.topProducts.map(p => p.name),
    datasets: [{
      label: 'จำนวนที่ผลิต',
      data: stats.topProducts.map(p => p.quantity),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };
  
  const financialChartData = {
    labels: ['กำไร', 'ต้นทุนวัตถุดิบ'],
    datasets: [{
        data: [Math.max(0, stats.totalProfit), stats.totalMaterialCost],
        backgroundColor: [
            'rgba(22, 163, 74, 0.7)', // Green
            'rgba(220, 38, 38, 0.7)' // Red
        ],
        borderColor: [
            'rgba(22, 163, 74, 1)',
            'rgba(220, 38, 38, 1)'
        ],
        borderWidth: 1,
    }]
  };
  
  const StatCard = ({ title, value, format = 'number' }: {title: string, value: number, format?: 'number' | 'currency'}) => {
    const formattedValue = format === 'currency' 
        ? value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
        : value.toLocaleString();
    
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{formattedValue}</p>
        </div>
    );
  };
  
  return (
    <div className="container mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">สรุปภาพรวม (Dashboard)</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-gray-100 p-2 rounded-lg">
                <div className="flex items-center">
                    <select
                        id="filterPreset"
                        value={filterPreset}
                        onChange={handlePresetChange}
                        className="h-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="custom">กำหนดเอง</option>
                        <option value="currentYear">ปีปัจจุบัน</option>
                        <option value="currentMonth">เดือนปัจจุบัน</option>
                        <option value="last30days">30 วันล่าสุด</option>
                        <option value="last7days">7 วันล่าสุด</option>
                        <option value="all">ทั้งหมด</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={formatDateForInput(startDate)}
                        onChange={(e) => handleDateChange(e, true)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                        type="date"
                        value={formatDateForInput(endDate)}
                        onChange={(e) => handleDateChange(e, false)}
                        min={formatDateForInput(startDate)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
            </div>
        </div>

        {productionOrders.length > 0 && filteredOrders.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-lg shadow">
                <p className="text-lg text-gray-500">ไม่มีข้อมูลการผลิตในช่วงเวลาที่เลือก</p>
                <p className="text-sm text-gray-400 mt-2">โปรดลองเลือกช่วงเวลาอื่น</p>
            </div>
        ) : productionOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow">
                <p className="text-lg text-gray-500">ยังไม่มีข้อมูลการผลิต</p>
                <p className="text-sm text-gray-400 mt-2">ไปที่หน้า 'เครื่องคำนวณการผลิต' เพื่อสร้างและบันทึกแผนการผลิต</p>
                <button
                    onClick={() => setView({type: 'calculator'})}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    ไปที่เครื่องคำนวณ
                </button>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="รายรับทั้งหมด" value={stats.totalRevenue} format="currency" />
                    <StatCard title="กำไรทั้งหมด" value={stats.totalProfit} format="currency" />
                    <StatCard title="ต้นทุนวัตถุดิบทั้งหมด" value={stats.totalMaterialCost} format="currency" />
                    <StatCard title="คำสั่งผลิต" value={stats.totalOrders} />
                    <StatCard title="สินค้าที่ผลิต (ชิ้น)" value={stats.totalProductsManufactured} />
                    <StatCard title="ค่าใช้จ่ายซื้อวัตถุดิบเพิ่ม" value={stats.totalPurchaseCost} format="currency" />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">5 อันดับสินค้าที่ผลิตมากที่สุด</h3>
                        <div className="h-80">
                           <Bar 
                             options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                             data={topProductsChartData}
                           />
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนกำไรและต้นทุน</h3>
                         <div className="h-80">
                           <Doughnut
                             data={financialChartData}
                             options={{ responsive: true, maintainAspectRatio: false }}
                           />
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default DashboardPage;