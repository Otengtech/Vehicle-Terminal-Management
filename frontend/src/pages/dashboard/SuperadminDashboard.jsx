import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { terminalsApi } from '@api/terminals';
import { vehiclesApi } from '@api/vehicles';
import { driversApi } from '@api/drivers';
import { recordsApi } from '@api/records';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Badge from '@components/Common/Badge';
import Spinner from '@components/Common/Spinner';
import { 
  IoLocationOutline, 
  IoCarOutline, 
  IoPeopleOutline, 
  IoDocumentTextOutline,
  IoWarningOutline 
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link}>
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  </Link>
);

const SuperadminDashboard = () => {
  // Fetch statistics
  const { data: terminalsData, isLoading: loadingTerminals } = useQuery({
    queryKey: ['terminals-stats'],
    queryFn: () => terminalsApi.getStats(),
  });

  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll({ limit: 5 }),
  });

  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversApi.getAll({ limit: 5 }),
  });

  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => recordsApi.getAll({ limit: 10, sortBy: 'timestamp', sortOrder: 'desc' }),
  });

  const stats = terminalsData?.data?.totals || {
    totalTerminals: 0,
    totalCapacity: 0,
    operationalTerminals: 0
  };

  if (loadingTerminals || loadingVehicles || loadingDrivers) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Superadmin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of all terminals and system activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Terminals"
          value={stats.totalTerminals}
          icon={IoLocationOutline}
          color="primary"
          link="/terminals"
        />
        <StatCard
          title="Total Vehicles"
          value={vehiclesData?.data?.pagination?.total || 0}
          icon={IoCarOutline}
          color="success"
          link="/vehicles"
        />
        <StatCard
          title="Total Drivers"
          value={driversData?.data?.pagination?.total || 0}
          icon={IoPeopleOutline}
          color="info"
          link="/drivers"
        />
        <StatCard
          title="Active Terminals"
          value={stats.operationalTerminals}
          icon={IoDocumentTextOutline}
          color="warning"
          link="/terminals?status=Operational"
        />
      </div>

      {/* Terminals Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Terminals Overview</h2>
            <Link to="/terminals" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terminalsData?.data?.terminals?.map((terminal) => (
              <div key={terminal._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{terminal.name}</h3>
                  <Badge variant={terminal.status === 'Operational' ? 'success' : 'warning'}>
                    {terminal.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{terminal.location}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Occupancy:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {terminal.currentOccupancy}/{terminal.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        terminal.occupancyRate > 90 ? 'bg-error-500' :
                        terminal.occupancyRate > 75 ? 'bg-warning-500' : 'bg-success-500'
                      }`}
                      style={{ width: `${terminal.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>Vehicles: {terminal.vehicleCount}</span>
                    <span>Drivers: {terminal.driverCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            ) : (
              <div className="space-y-4">
                {recentActivity?.data?.data?.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        activity.actionType.includes('Check') ? 'bg-primary-100 dark:bg-primary-900/30' :
                        activity.actionType.includes('Damage') ? 'bg-error-100 dark:bg-error-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <IoDocumentTextOutline className={`h-4 w-4 ${
                          activity.actionType.includes('Check') ? 'text-primary-600' :
                          activity.actionType.includes('Damage') ? 'text-error-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.actionType}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.notes} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/terminals/create" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
                <IoLocationOutline className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium">New Terminal</span>
              </Link>
              <Link to="/drivers/create" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
                <IoPeopleOutline className="h-6 w-6 mx-auto mb-2 text-success-600" />
                <span className="text-sm font-medium">New Driver</span>
              </Link>
              <Link to="/vehicles/create" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
                <IoCarOutline className="h-6 w-6 mx-auto mb-2 text-info-600" />
                <span className="text-sm font-medium">New Vehicle</span>
              </Link>
              <Link to="/admins/create" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
                <IoPeopleOutline className="h-6 w-6 mx-auto mb-2 text-warning-600" />
                <span className="text-sm font-medium">New Admin</span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminDashboard;