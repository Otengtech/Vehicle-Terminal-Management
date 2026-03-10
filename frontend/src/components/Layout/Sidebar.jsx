import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import {
  IoGridOutline,
  IoBusOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { useTheme } from '@hooks/useTheme';

const Sidebar = ({ mobile, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: IoGridOutline },
    ...(hasRole('Superadmin') ? [
      { name: 'Terminals', href: '/terminals', icon: IoLocationOutline },
      { name: 'Admins', href: '/admins', icon: IoPersonOutline },
    ] : []),
    { name: 'Drivers', href: '/drivers', icon: IoPeopleOutline },
    { name: 'Vehicles', href: '/vehicles', icon: IoBusOutline },
    { name: 'Reports', href: '/reports', icon: IoDocumentTextOutline },
    { name: 'Profile', href: '/profile', icon: IoPersonOutline },
    { name: 'Settings', href: '/settings', icon: IoSettingsOutline },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      onClick={mobile ? onClose : undefined}
      className={({ isActive }) => `
        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
        ${isActive 
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }
      `}
    >
      <item.icon className="mr-3 h-5 w-5" />
      {item.name}
    </NavLink>
  );

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-gray-900 shadow-xl">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
            VMS Terminal
          </span>
        </div>
        {mobile && (
          <button onClick={onClose} className="lg:hidden">
            <IoCloseOutline className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {isDark ? '🌞' : '🌙'}
          </button>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          <IoLogOutOutline className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;