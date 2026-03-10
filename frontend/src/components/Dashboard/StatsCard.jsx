import React from 'react';
import Card from '@components/Common/Card';
import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', link, change }) => {
  const colors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
    error: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
    info: 'bg-info-100 dark:bg-info-900/30 text-info-600 dark:text-info-400',
  };

  const content = (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {change !== undefined && (
              <span className={`ml-2 text-sm ${change >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
};

export default StatsCard;