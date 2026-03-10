import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@hooks/useAuth';
import { terminalsApi } from '@api/terminals';
import { vehiclesApi } from '@api/vehicles';
import { driversApi } from '@api/drivers';
import { recordsApi } from '@api/records';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Badge from '@components/Common/Badge';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import { Link } from 'react-router-dom';
import { 
  IoCarOutline, 
  IoPeopleOutline, 
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoWarningOutline 
} from 'react-icons/io5';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Fetch terminal details
  const { data: terminalData, isLoading: loadingTerminal } = useQuery({
    queryKey: ['terminal', user?.terminalId],
    queryFn: () => terminalsApi.getById(user?.terminalId),
    enabled: !!user?.terminalId,
  });

  // Fetch recent vehicles
  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles', 'recent'],
    queryFn: () => vehiclesApi.getAll({ 
      terminalId: user?.terminalId,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }),
    enabled: !!user?.terminalId,
  });

  // Fetch available drivers
  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => driversApi.getAvailable({ terminalId: user?.terminalId }),
    enabled: !!user?.terminalId,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['activity', user?.terminalId],
    queryFn: () => recordsApi.getAll({ 
      terminalId: user?.terminalId,
      limit: 10,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }),
    enabled: !!user?.terminalId,
  });

  if (loadingTerminal || loadingVehicles || loadingDrivers) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const terminal = terminalData?.data?.data;
  const vehicles = vehiclesData?.data?.data || [];
  const drivers = driversData?.data?.data || [];
  const occupancyRate = terminal ? (terminal.currentOccupancy / terminal.capacity) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {terminal?.name} Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your terminal operations
        </p>
      </div>

      {/* Terminal Status Card */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <Badge variant={terminal?.status === 'Operational' ? 'success' : 'warning'}>
                {terminal?.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{terminal?.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Capacity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {terminal?.currentOccupancy}/{terminal?.capacity}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Spaces</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {terminal?.capacity - terminal?.currentOccupancy}
              </p>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Occupancy Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {occupancyRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  occupancyRate > 90 ? 'bg-error-500' :
                  occupancyRate > 75 ? 'bg-warning-500' : 'bg-success-500'
                }`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <IoCarOutline className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {vehiclesData?.data?.pagination?.total || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100 dark:bg-success-900/30">
                <IoPeopleOutline className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Drivers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {drivers.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100 dark:bg-warning-900/30">
                <IoCheckmarkCircleOutline className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Checked In</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {terminal?.currentOccupancy || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Vehicles and Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Vehicles</h2>
              <Link to="/vehicles" className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <Link 
                    key={vehicle._id} 
                    to={`/vehicles/${vehicle._id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {vehicle.licensePlate} • {vehicle.color}
                        </p>
                      </div>
                      <Badge variant={
                        vehicle.currentStatus === 'Checked-In' ? 'success' :
                        vehicle.currentStatus === 'In Transit' ? 'warning' : 'default'
                      }>
                        {vehicle.currentStatus}
                      </Badge>
                    </div>
                    {vehicle.assignedDriverId && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Driver: {vehicle.assignedDriverId.fullName}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IoCarOutline className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No vehicles found</p>
                <Link to="/vehicles/create">
                  <Button variant="primary" size="sm" className="mt-4">
                    Add Vehicle
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Available Drivers */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Drivers</h2>
              <Link to="/drivers" className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {drivers.length > 0 ? (
              <div className="space-y-4">
                {drivers.slice(0, 5).map((driver) => (
                  <Link
                    key={driver._id}
                    to={`/drivers/${driver._id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {driver.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {driver.licenseNumber} • {driver.phoneNumber}
                        </p>
                      </div>
                      <Badge variant="success">Available</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IoPeopleOutline className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No available drivers</p>
                <Link to="/drivers/create">
                  <Button variant="primary" size="sm" className="mt-4">
                    Add Driver
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </CardHeader>
        <CardBody>
          {loadingActivity ? (
            <div className="flex justify-center py-4">
              <Spinner size="md" />
            </div>
          ) : recentActivity?.data?.data?.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.data.data.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.actionType.includes('Check-In') ? 'bg-success-100 dark:bg-success-900/30' :
                    activity.actionType.includes('Check-Out') ? 'bg-warning-100 dark:bg-warning-900/30' :
                    activity.actionType.includes('Damage') ? 'bg-error-100 dark:bg-error-900/30' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {activity.actionType.includes('Check-In') && <IoCheckmarkCircleOutline className="h-4 w-4 text-success-600" />}
                    {activity.actionType.includes('Check-Out') && <IoTimeOutline className="h-4 w-4 text-warning-600" />}
                    {activity.actionType.includes('Damage') && <IoWarningOutline className="h-4 w-4 text-error-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.actionType}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.notes} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No recent activity
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;