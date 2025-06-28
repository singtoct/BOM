import React, { useState, useMemo } from 'react';
import { useBom } from '../context/BomContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

type Period = 'today' | '7days' | '30days' | 'all';

const DashboardPage = () => {
    const { state } = useBom();
    const [period, setPeriod] = useState<Period>('7days');
    
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let startDate: Date;
        switch (period) {
            case 'today':
                startDate = startOfToday;
                break;
            case '7days':
                startDate = new Date(startOfToday);
                startDate.setDate(startDate.getDate() - 6);
                break;
            case '30days':
                startDate = new Date(startOfToday);
                startDate.setDate(startDate.getDate() - 29);
                break;
            case 'all':
                return state.productionOrders;
        }
        
        return state.productionOrders.filter(order => new Date(order.createdAt) >= startDate);
    }, [state.productionOrders, period]);

    const kpis = useMemo(() => {
        let totalProducts = 0;
        let totalPurchaseCost = 0;

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                totalProducts += item.quantity;
            });
            order.results.forEach(res => {
                totalPurchaseCost += res.shortage * res.pricePerUnit;
            });
        });

        return {
            orderCount: filteredOrders.length,
            totalProducts,
            totalPurchaseCost,
        };
    }, [filteredOrders]);

    const topProductsData = useMemo(() => {
        const productCounts: Record<string, {name: string, quantity: number}> = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const product = state.products.find(p => p.id === item.productId);
                if (product) {
                    if (!productCounts[item.productId]) {
                        productCounts[item.productId] = { name: product.name, quantity: 0 };
                    }
                    productCounts[item.productId].quantity += item.quantity;
                }
            });
        });
        
        const sortedProducts = Object.values(productCounts)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            labels: sortedProducts.map(p => p.name),
            datasets: [{
                label: 'จำนวนที่ผลิต',
                data: sortedProducts.map(p => p.quantity),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        };
    }, [filteredOrders, state.products]);
    
    const purchaseCostByMaterialData = useMemo(() => {
        const materialCosts: Record<string, {name: string, cost: number}> = {};
        filteredOrders.forEach(order => {
            order.results.forEach(res => {
                if (res.shortage > 0) {
                     const material = state.materials.find(m => m.id === res.materialId);
                     if (material) {
                         if (!materialCosts[res.materialId]) {
                             materialCosts[res.materialId] = { name: material.name, cost: 0};
                         }
                         materialCosts[res.materialId].cost += res.shortage * res.pricePerUnit;
                     }
                }
            });
        });

        const sortedMaterials = Object.values(materialCosts)
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 7);

        return {
            labels: sortedMaterials.map(m => m.name),
            datasets: [{
                label: 'ต้นทุนการจัดซื้อ',
                data: sortedMaterials.map(m => m.cost),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 159, 64, 0.7)',
                  'rgba(99, 255, 132, 0.7)',
                ],
            }]
        };

    }, [filteredOrders, state.materials]);
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                font: { size: 16, family: 'Kanit' },
                padding: { top: 10, bottom: 20 }
            },
            tooltip: {
                bodyFont: { family: 'Kanit' },
                titleFont: { family: 'Kanit' },
            }
        },
    };

    if (state.productionOrders.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">แดชบอร์ดสรุปข้อมูล</h1>
                <p>ยังไม่มีข้อมูลการผลิต</p>
                <p className="mt-2">ไปที่หน้า "เครื่องคำนวณการผลิต" เพื่อสร้างและบันทึกแผนการผลิตของคุณ</p>
            </div>
        );
    }
    
    const KpiCard = ({ title, value, format = (v) => v.toLocaleString() }: { title: string, value: number, format?: (v: number) => string}) => (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{format(value)}</p>
        </div>
    );
    
    const periodButtons: {label: string, value: Period}[] = [
        { label: 'วันนี้', value: 'today' },
        { label: '7 วันล่าสุด', value: '7days' },
        { label: '30 วันล่าสุด', value: '30days' },
        { label: 'ทั้งหมด', value: 'all' },
    ];
    
    return (
        <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                 <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ดสรุปข้อมูล</h1>
                 <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
                    {periodButtons.map(btn => (
                        <button 
                            key={btn.value}
                            onClick={() => setPeriod(btn.value)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${period === btn.value ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                        >
                           {btn.label}
                        </button>
                    ))}
                 </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="จำนวนคำสั่งผลิต" value={kpis.orderCount} />
                <KpiCard title="จำนวนสินค้าที่ผลิต (ชิ้น)" value={kpis.totalProducts} />
                <KpiCard title="ต้นทุนจัดซื้อรวม" value={kpis.totalPurchaseCost} format={v => v.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} />
            </div>

            {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow h-[400px]">
                        <Bar 
                            options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: '5 ผลิตภัณฑ์ที่ผลิตบ่อยที่สุด' }}}}
                            data={topProductsData}
                        />
                    </div>
                     <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow h-[400px]">
                        <Pie 
                             options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'สัดส่วนต้นทุนจัดซื้อ (Top 7)' }}}}
                             data={purchaseCostByMaterialData}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700">ไม่มีข้อมูลในระยะเวลาที่เลือก</h2>
                    <p className="mt-2">ลองเลือกช่วงเวลาอื่น หรือสร้างแผนการผลิตใหม่</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
