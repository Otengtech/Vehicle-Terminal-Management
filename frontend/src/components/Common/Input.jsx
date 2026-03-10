import React from 'react';

const Input = ({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  register,
  name,
  required = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          type={type}
          className={`
            w-full rounded-lg border 
            ${error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            bg-white dark:bg-transparent
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            transition-colors duration-200
            ${className}
          `}
          {...register?.(name)}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};

export default Input;