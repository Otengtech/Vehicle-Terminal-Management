import React from 'react';

const CapacityIndicator = ({ current, capacity }) => {
  const percentage = (current / capacity) * 100;
  
  const getColor = () => {
    if (percentage >= 90) return 'bg-error-500';
    if (percentage >= 75) return 'bg-warning-500';
    return 'bg-success-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {current}/{capacity} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default CapacityIndicator;