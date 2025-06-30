import React, { useState, useMemo, useEffect } from 'react';
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
import { CalendarIcon } from '../components/icons';

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
    return {
        startDate: start,
        endDate: end,
    };
};

const DashboardPage = ({ setView }: { setView: React.Dispatch<React.SetStateAction<View>> }) => {
  const { state } = useBom();
  const { productionOrders, products } = state;
  const [filterPreset, setFilterPreset] = useState('thisYear');
  
  const [startDate, setStartDate] = useState<Date>(() => getDatesForPreset('thisYear').startDate);
  const [endDate, setEndDate] = useState<Date>(() => getDatesForPreset('thisYear').endDate);
  
  useEffect(() => {
    if (filterPreset === 'custom') return;
    const { startDate: newStart, endDate: newEnd } = getDatesForPreset(filterPreset);
    setStartDate(newStart);
    setEndDate(newEnd);
  }, [filterPreset]);

  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate.getTime());
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate.getTime());
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return [];
    }

    return productionOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
    });
  }, [productionOrders, startDate, endDate]);

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
            '#16a34a', // Green-600
            '#ef4444'  // Red-500
        ],
        borderColor: [
            '#16a34a',
            '#ef4444'
        ],
        borderWidth: 1,
    }]
  };

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  }), []);

  const doughnutChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
        }
      }
    }
  }), []);
  
  const StatCard = ({ title, value, format = 'number' }: {title: string, value: number, format?: 'number' | 'currency'}) => {
    const formattedValue = format === 'currency' 
        ? `฿${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : value.toLocaleString('en-US');
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-3xl font-bold text-gray-800">{formattedValue}</p>
        </div>
    );
  };
  
  const dateToInputString = (date: Date) => date.toISOString().split('T')[0];
  
  return (
    <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">สรุปภาพรวม (Dashboard)</h1>
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <select
                    value={filterPreset}
                    onChange={(e) => setFilterPreset(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2"
                >
                    <option value="thisYear">ปีปัจจุบัน</option>
                    <option value="thisMonth">เดือนปัจจุบัน</option>
                    <option value="today">วันนี้</option>
                    <option value="custom">กำหนดเอง</option>
                </select>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                        type="date"
                        value={dateToInputString(startDate)}
                        onChange={(e) => {
                            const dateParts = e.target.value.split('-').map(p => parseInt(p, 10));
                            const newDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                            if(!isNaN(newDate.getTime())) {
                                setStartDate(newDate);
                                setFilterPreset('custom');
                            }
                        }}
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 p-2"
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                        type="date"
                        value={dateToInputString(endDate)}
                        onChange={(e) => {
                           const dateParts = e.target.value.split('-').map(p => parseInt(p, 10));
                           const newDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                            if(!isNaN(newDate.getTime())) {
                                setEndDate(newDate);
                                setFilterPreset('custom');
                            }
                        }}
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 p-2"
                    />
                </div>
            </div>
        </div>

        {productionOrders.length > 0 && filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
                <p className="text-lg text-gray-500">ไม่มีข้อมูลการผลิตในช่วงเวลาที่เลือก</p>
                <p className="text-sm text-gray-400 mt-2">กรุณาเลือกช่วงเวลาอื่น</p>
            </div>
        ) : productionOrders.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
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
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">5 อันดับสินค้าที่ผลิตมากที่สุด</h3>
                        <div className="h-80">
                           <Bar 
                             options={barChartOptions} 
                             data={topProductsChartData}
                           />
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนกำไรและต้นทุน</h3>
                         <div className="h-80">
                           <Doughnut
                             data={financialChartData}
                             options={doughnutChartOptions}
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
