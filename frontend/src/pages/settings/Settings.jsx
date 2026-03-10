import React, { useState } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@hooks/useAuth';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Button from '@components/Common/Button';
import Select from '@components/Common/Select';
import { IoMoonOutline, IoSunnyOutline, IoLogOutOutline } from 'react-icons/io5';
import { useLocalStorage } from '@hooks/useLocalStorage';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useLocalStorage('notifications', true);
  const [language, setLanguage] = useLocalStorage('language', 'en');

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between light and dark mode
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={toggleTheme}
              icon={isDark ? IoSunnyOutline : IoMoonOutline}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Language</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your preferred language
              </p>
            </div>
            <div className="w-48">
              <Select
                options={languageOptions}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive email notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Logged in as</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email} ({user?.role})
            </p>
          </div>

          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleClearCache}>
              Clear Local Cache
            </Button>
            <Button variant="danger" icon={IoLogOutOutline} onClick={logout}>
              Logout
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;