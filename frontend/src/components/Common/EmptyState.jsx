import React from 'react';
import { IoMailOpenOutline } from "react-icons/io5";
import Button from './Button';

const EmptyState = ({ 
  title = 'No data found', 
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  icon: Icon = IoMailOpenOutline 
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;