import React from 'react';
import { useAuth } from '@hooks/useAuth';
import { IoMenuOutline } from 'react-icons/io5';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <IoMenuOutline className="h-6 w-6" />
          </button>

          {/* Page title - can be dynamic based on route */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {user?.fullName}
            </h1>
          </div>

          {/* Right side - notifications, etc */}
          <div className="flex items-center space-x-4">
            {/* Add notification bell, etc here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;