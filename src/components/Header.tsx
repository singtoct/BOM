
import React from 'react';
import { View } from '../types';
import { BoxIcon, CalculatorIcon, ChartBarIcon, TruckIcon, SendIcon } from './icons';

interface HeaderProps {
  setView: React.Dispatch<React.SetStateAction<View>>;
}

const Header = ({ setView }: HeaderProps) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-auto min-h-16 py-2">
          <div className="flex items-center">
             <div className="flex-shrink-0 text-blue-600">
                <BoxIcon className="h-8 w-8" />
             </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline flex-wrap gap-x-4 gap-y-2">
                 <button
                  onClick={() => setView({ type: 'dashboard' })}
                  className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  <span>แดชบอร์ด</span>
                </button>
                 <button
                  onClick={() => setView({ type: 'receipt-report' })}
                  className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <TruckIcon className="h-5 w-5 mr-2" />
                  <span>รายงานรับเข้า</span>
                </button>
                 <button
                  onClick={() => setView({ type: 'dispatch' })}
                  className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <SendIcon className="h-5 w-5 mr-2" />
                  <span>ส่งออกสินค้า</span>
                </button>
                <button
                  onClick={() => setView({ type: 'products' })}
                  className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  สินค้า (Products)
                </button>
                <button
                  onClick={() => setView({ type: 'materials' })}
                  className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  วัตถุดิบ (Materials)
                </button>
                <button
                  onClick={() => setView({ type: 'calculator' })}
                  className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <CalculatorIcon className="h-5 w-5 mr-2" />
                  <span>เครื่องคำนวณการผลิต</span>
                </button>
              </div>
            </div>
          </div>
           <div className="flex-shrink-0 ml-4">
             <h1 className="text-xl font-bold text-gray-800 text-right">BOM & Costing Manager</h1>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
