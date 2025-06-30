import React from 'react';
import { MenuIcon } from './icons';

const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0 border-b border-gray-200">
      {/* Left side: Hamburger menu for mobile */}
      <div className="flex items-center">
        <button className="text-gray-500 focus:outline-none lg:hidden">
            <MenuIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Right side: App Title */}
      <div className="flex items-center">
        <h2 className="text-md font-semibold text-gray-600">BOM & Costing Manager</h2>
      </div>
    </header>
  );
};

export default Header;
