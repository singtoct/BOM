
import React, { useState, useMemo } from 'react';
import { useBom } from '../context/BomContext';
import { View, ProductionOrder } from '../types';
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

type TimeFilter = 'today' | '7days' | '30days' | 'all';

const DashboardPage = ({ setView }: { setView: React.Dispatch<React.SetStateAction<View>> }) => {
  const { state } = useBom();
  const { productionOrders, products } = state;
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date | null = null;

    switch (timeFilter) {
      case 'today':
        startDate = today;
        break;
      case '7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
        break;
      case 'all':
      default:
        return productionOrders;
    }

    return productionOrders.filter(order => new Date(order.createdAt) >= startDate!);
  }, [productionOrders, timeFilter]);

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
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">สรุปภาพรวม (Dashboard)</h1>
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                {(['today', '7days', '30days', 'all'] as TimeFilter[]).map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            timeFilter === filter ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        {filter === 'today' && 'วันนี้'}
                        {filter === '7days' && '7 วัน'}
                        {filter === '30days' && '30 วัน'}
                        {filter === 'all' && 'ทั้งหมด'}
                    </button>
                ))}
            </div>
        </div>

        {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow">
                <p className="text-lg text-gray-500">ไม่มีข้อมูลการผลิตในช่วงเวลานี้</p>
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
