import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@components/Common/Card';
import StatusBadge from './StatusBadge';
import { IoCarOutline, IoPersonOutline } from 'react-icons/io5';

const VehicleCard = ({ vehicle }) => {
  return (
    <Link to={`/vehicles/${vehicle._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {vehicle.licensePlate} • {vehicle.year} • {vehicle.color}
              </p>
            </div>
            <StatusBadge status={vehicle.currentStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center text-sm">
              <IoCarOutline className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Type: <span className="font-medium text-gray-900 dark:text-white">
                  {vehicle.vehicleType}
                </span>
              </span>
            </div>
            {vehicle.assignedDriverId && (
              <div className="flex items-center text-sm">
                <IoPersonOutline className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Driver: <span className="font-medium text-gray-900 dark:text-white">
                    {vehicle.assignedDriverId.fullName}
                  </span>
                </span>
              </div>
            )}
          </div>

          {vehicle.damages?.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-error-600">
                ⚠️ {vehicle.damages.length} damage report(s)
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default VehicleCard;