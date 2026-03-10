import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '@api/records';
import { vehiclesApi } from '@api/vehicles';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import ActivityLog from '@components/Records/ActivityLog';
import ActivityFilter from '@components/Records/ActivityFilter';
import { IoArrowBackOutline } from 'react-icons/io5';
import { formatDate } from '@utils/formatters';

const VehicleHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    actionType: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: vehicleData, isLoading: loadingVehicle } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(id),
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['vehicle-history', id, filters, page, limit],
    queryFn: () => recordsApi.getAll({ 
      vehicleId: id,
      ...filters,
      page, 
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }),
  });

  const vehicle = vehicleData?.data?.data;
  const history = historyData?.data?.data || [];
  const pagination = historyData?.data?.pagination;

  if (loadingVehicle) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/vehicles/${id}`)}>
          <IoArrowBackOutline className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vehicle History: {vehicle?.licensePlate}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {vehicle?.make} {vehicle?.model} • {vehicle?.year}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {pagination?.total || 0}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">First Activity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {history.length > 0 ? formatDate(history[history.length - 1]?.timestamp) : 'N/A'}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Activity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {history.length > 0 ? formatDate(history[0]?.timestamp) : 'N/A'}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {vehicle?.currentStatus}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filter */}
      <ActivityFilter 
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ search: '', actionType: '', startDate: '', endDate: '' })}
      />

      {/* Activity Log */}
      <ActivityLog 
        activities={history} 
        isLoading={loadingHistory}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default VehicleHistory;