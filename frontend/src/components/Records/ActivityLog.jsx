import React from 'react';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Badge from '@components/Common/Badge';
import Spinner from '@components/Common/Spinner';
import Pagination from '@components/Common/Pagination';
import { formatDateTime } from '@utils/formatters';
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoCar, 
  IoPerson,
  IoWarning,
  IoSwapHorizontal 
} from 'react-icons/io5';

const getActivityIcon = (type) => {
  switch (type) {
    case 'Check-In':
      return <IoCheckmarkCircle className="h-5 w-5 text-success-600" />;
    case 'Check-Out':
      return <IoCloseCircle className="h-5 w-5 text-warning-600" />;
    case 'Damage Reported':
      return <IoWarning className="h-5 w-5 text-error-600" />;
    case 'Driver Assignment':
    case 'Driver Unassignment':
      return <IoSwapHorizontal className="h-5 w-5 text-info-600" />;
    default:
      return <IoCar className="h-5 w-5 text-primary-600" />;
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
    case 'Driver Assignment':
    case 'Driver Unassignment':
      return 'bg-info-100 dark:bg-info-900/30';
    default:
      return 'bg-primary-100 dark:bg-primary-900/30';
  }
};

const ActivityLog = ({ activities = [], isLoading, pagination, onPageChange }) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h2>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : activities.length > 0 ? (
          <div className="flow-root">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <li key={activity._id} className="py-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.actionType)}`}>
                      {getActivityIcon(activity.actionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.actionType}
                        </p>
                        <Badge variant="default" className="text-xs">
                          {formatDateTime(activity.timestamp)}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>{activity.notes}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                          {activity.vehicleId && (
                            <span className="text-gray-500 dark:text-gray-500">
                              Vehicle: {activity.vehicleId.licensePlate}
                            </span>
                          )}
                          {activity.driverId && (
                            <span className="text-gray-500 dark:text-gray-500">
                              Driver: {activity.driverId.fullName}
                            </span>
                          )}
                          <span className="text-gray-500 dark:text-gray-500">
                            By: {activity.performedBy?.fullName}
                          </span>
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
            No activity found
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            className="mt-6"
          />
        )}
      </CardBody>
    </Card>
  );
};

export default ActivityLog;