import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Badge from '@components/Common/Badge';
import Spinner from '@components/Common/Spinner';
import { formatRelativeTime } from '@utils/formatters';
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoCar, 
  IoPerson,
  IoWarning 
} from 'react-icons/io5';

const getActivityIcon = (type) => {
  switch (type) {
    case 'Check-In':
      return <IoCheckmarkCircle className="h-4 w-4 text-success-600" />;
    case 'Check-Out':
      return <IoCloseCircle className="h-4 w-4 text-warning-600" />;
    case 'Damage Reported':
      return <IoWarning className="h-4 w-4 text-error-600" />;
    default:
      return <IoCar className="h-4 w-4 text-primary-600" />;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'Check-In':
      return 'bg-success-100 dark:bg-success-900/30';
    case 'Check-Out':
      return 'bg-warning-100 dark:bg-warning-900/30';
    case 'Damage Reported':
      return 'bg-error-100 dark:bg-error-900/30';
    default:
      return 'bg-primary-100 dark:bg-primary-900/30';
  }
};

const RecentActivity = ({ activities = [], isLoading, limit = 5 }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </CardHeader>
        <CardBody>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </CardBody>
      </Card>
    );
  }

  const displayActivities = activities.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        {displayActivities.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {displayActivities.map((activity, index) => (
                <li key={activity._id}>
                  <div className="relative pb-8">
                    {index !== displayActivities.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${getActivityColor(activity.actionType)}`}>
                          {getActivityIcon(activity.actionType)}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.actionType}{' '}
                            <span className="font-medium">{activity.vehicleId?.licensePlate}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {activity.notes}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentActivity;