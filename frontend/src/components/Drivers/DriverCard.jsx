import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@components/Common/Card';
import Badge from '@components/Common/Badge';
import LicenseStatus from './LicenseStatus';
import { IoCallOutline, IoIdCardOutline } from 'react-icons/io5';

const DriverCard = ({ driver }) => {
  return (
    <Link to={`/drivers/${driver._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {driver.fullName}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                <IoIdCardOutline className="mr-1 h-4 w-4" />
                {driver.licenseNumber}
              </div>
            </div>
            <Badge variant={
              driver.status === 'Available' ? 'success' :
              driver.status === 'On Route' ? 'warning' :
              driver.status === 'Off Duty' ? 'default' : 'error'
            }>
              {driver.status}
            </Badge>
          </div>

          <LicenseStatus expiryDate={driver.licenseExpiryDate} />

          <div className="flex items-center text-sm">
            <IoCallOutline className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">{driver.phoneNumber}</span>
          </div>

          {driver.currentVehicleId && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Assigned to: {driver.currentVehicleId.licensePlate}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default DriverCard;