import React from 'react';
import { View } from '../types';
import { 
    HomeIcon, 
    PackageIcon, 
    ShoppingCartIcon, 
    CalculatorIcon, 
    TruckIcon, 
    SendIcon, 
    ChevronDownIcon 
} from './icons';

type SidebarViewType = Exclude<View['type'], 'product-detail'>;

interface SidebarProps {
  currentViewType: View['type'];
  setView: React.Dispatch<React.SetStateAction<View>>;
}

const NavItem = ({ 
    viewType, 
    label, 
    icon, 
    currentViewType, 
    setView 
}: { 
    viewType: SidebarViewType, 
    label: string, 
    icon: React.ReactNode, 
    currentViewType: View['type'],
    setView: (view: View) => void 
}) => {
    const isActive = currentViewType === viewType;
    return (
        <li>
            <button
                onClick={() => setView({ type: viewType })}
                className={`w-full flex items-center p-2.5 my-1 rounded-md transition-colors duration-200
                    ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                }
            >
                <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
                <span className="ml-4 font-medium">{label}</span>
            </button>
        </li>
    );
}

const Sidebar = ({ currentViewType, setView }: SidebarProps) => {

    const navItems: { view: SidebarViewType; label: string; icon: React.ReactNode }[] = [
        { view: 'dashboard', label: 'หน้าแรก', icon: <HomeIcon className="h-5 w-5"/> },
        { view: 'products', label: 'สินค้า', icon: <PackageIcon className="h-5 w-5"/> },
        { view: 'materials', label: 'วัตถุดิบ', icon: <ShoppingCartIcon className="h-5 w-5"/> },
        { view: 'calculator', label: 'คำนวณการผลิต', icon: <CalculatorIcon className="h-5 w-5"/> },
        { view: 'receipt-report', label: 'รายงานรับเข้า', icon: <TruckIcon className="h-5 w-5"/> },
        { view: 'dispatch', label: 'ส่งออกสินค้า', icon: <SendIcon className="h-5 w-5"/> },
    ];

    return (
        <aside className="w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col">
            {/* Logo and Company Selector */}
            <div className="bg-gray-900 p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                     <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 10.5V12h-2v-1.5c0-1.38-1.12-2.5-2.5-2.5H16V6.5c0-1.38-1.12-2.5-2.5-2.5h-3C9.12 4 8 5.12 8 6.5V8H6.5C5.12 8 4 9.12 4 10.5V12H2v-1.5C2 7.79 4.79 5 8.5 5h7C19.21 5 22 7.79 22 10.5zM15.5 16H14v1.5c0 1.38 1.12 2.5 2.5 2.5h3c1.38 0 2.5-1.12 2.5-2.5V16h-2v1.5c0 .28-.22.5-.5.5h-3c-.28 0-.5-.22-.5-.5V16zm-8 0H6v1.5c0 .28-.22.5-.5.5h-3c-.28 0-.5-.22-.5-.5V16H2v1.5C2 20.21 4.79 23 8.5 23h7c.34 0 .67-.03 1-.08V21h-1v-5z"></path></svg>
                     <h1 className="text-xl font-bold tracking-wider">SMEMOVE</h1>
                </div>
               
                <div className="mt-5">
                    <button className="w-full bg-gray-700 p-2 rounded-md text-left flex justify-between items-center hover:bg-gray-600 transition-colors">
                        <span className="text-sm font-medium">บริษัท ซีที อีเล็คทริค จำกัด...</span>
                        <ChevronDownIcon className="h-5 w-5 text-gray-400"/>
                    </button>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul>
                    {navItems.map(item => (
                       <NavItem 
                        key={item.view}
                        viewType={item.view}
                        label={item.label}
                        icon={item.icon}
                        currentViewType={currentViewType}
                        setView={setView}
                       />
                    ))}
                </ul>
            </nav>

            {/* Footer Help Section */}
            <div className="p-4 border-t border-gray-700">
                <a href="#" className="text-sm text-gray-400 hover:text-white">ขอความช่วยเหลือ | แจ้งปัญหา</a>
            </div>
        </aside>
    );
}

export default Sidebar;