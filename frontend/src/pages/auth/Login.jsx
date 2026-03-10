import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import LoginForm from '@components/Auth/LoginForm';
import { useTheme } from '@hooks/useTheme';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to Vehicle Terminal Management System
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Need help?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;