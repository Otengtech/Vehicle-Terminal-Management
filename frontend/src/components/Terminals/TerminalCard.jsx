import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@components/Common/Card';
import Badge from '@components/Common/Badge';
import CapacityIndicator from './CapacityIndicator';
import { IoLocationOutline, IoCarOutline, IoPeopleOutline } from 'react-icons/io5';

const TerminalCard = ({ terminal }) => {
  const occupancyRate = (terminal.currentOccupancy / terminal.capacity) * 100;

  return (
    <Link to={`/terminals/${terminal._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {terminal.name}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                <IoLocationOutline className="mr-1 h-4 w-4" />
                {terminal.location}
              </div>
            </div>
            <Badge variant={terminal.status === 'Operational' ? 'success' : 'warning'}>
              {terminal.status}
            </Badge>
          </div>

          <CapacityIndicator 
            current={terminal.currentOccupancy} 
            capacity={terminal.capacity} 
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center text-sm">
              <IoCarOutline className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Vehicles: <span className="font-medium text-gray-900 dark:text-white">
                  {terminal.vehicleCount || 0}
                </span>
              </span>
            </div>
            <div className="flex items-center text-sm">
              <IoPeopleOutline className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Drivers: <span className="font-medium text-gray-900 dark:text-white">
                  {terminal.driverCount || 0}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TerminalCard;