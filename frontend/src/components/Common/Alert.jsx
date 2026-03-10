import React from 'react';
import { IoCheckmarkCircle, IoWarning, IoAlertCircle, IoInformation } from 'react-icons/io5';

const Alert = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: IoCheckmarkCircle,
    warning: IoWarning,
    error: IoAlertCircle,
    info: IoInformation,
  };

  const styles = {
    success: 'bg-success-50 text-success-800 dark:bg-success-900/20 dark:text-success-400 border-success-200 dark:border-success-800',
    warning: 'bg-warning-50 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400 border-warning-200 dark:border-warning-800',
    error: 'bg-error-50 text-error-800 dark:bg-error-900/20 dark:text-error-400 border-error-200 dark:border-error-800',
    info: 'bg-info-50 text-info-800 dark:bg-info-900/20 dark:text-info-400 border-info-200 dark:border-info-800',
  };

  const Icon = icons[type];

  return (
    <div className={`rounded-lg border p-4 ${styles[type]}`}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <div className="flex-1 text-sm">{message}</div>
        {onClose && (
          <button onClick={onClose} className="ml-3 flex-shrink-0">
            <IoClose className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;