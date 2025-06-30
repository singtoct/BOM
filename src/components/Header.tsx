
import React from 'react';
import { MenuIcon } from './icons';

const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0">
      {/* Left side: Hamburger menu for mobile */}
      <div className="flex items-center">
        <button className="text-gray-500 focus:outline-none lg:hidden">
            <MenuIcon className="h-6 w-6" />
        </button>
         <h2 className="text-lg text-gray-700 ml-2">ยินดีต้อนรับสู่ระบบ : อภิสิทธิ์ หรืออรุณ</h2>
      </div>
      
      {/* Right side can contain user menu, notifications, etc. */}
      <div></div>
    </header>
  );
};

export default Header;
