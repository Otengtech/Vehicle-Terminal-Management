import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@api/vehicles';
import { terminalsApi } from '@api/terminals';
import VehicleCard from '@components/Vehicles/VehicleCard';
import VehicleTable from '@components/Vehicles/VehicleTable';
import Button from '@components/Common/Button';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Spinner from '@components/Common/Spinner';
import EmptyState from '@components/Common/EmptyState';
import Pagination from '@components/Common/Pagination';
import { IoAddOutline, IoGridOutline, IoListOutline, IoSearchOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import { useAuth } from '@hooks/useAuth';
import { useDebounce } from '@hooks/useDebounce';
import { VEHICLE_STATUS, VEHICLE_TYPES } from '@utils/constants';

const Vehicles = () => {
  const { user, hasRole } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [terminalId, setTerminalId] = useState(user?.role === 'Admin' ? user?.terminalId : '');
  const [page, setPage] = useState(1);
  const limit = 12;

  const debouncedSearch = useDebounce(search, 500);

  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['vehicles', { debouncedSearch, status, type, terminalId, page, limit }],
    queryFn: () => vehiclesApi.getAll({ 
      search: debouncedSearch, 
      status, 
      vehicleType: type,
      terminalId,
      page, 
      limit 
    }),
  });

  const { data: terminalsData } = useQuery({
    queryKey: ['terminals', 'list'],
    queryFn: () => terminalsApi.getAll({ limit: 100 }),
    enabled: hasRole('Superadmin'),
  });

  const vehicles = vehiclesData?.data?.data || [];
  const pagination = vehiclesData?.data?.pagination;

  const statusOptions = [
    { value: '', label: 'All Status' },
    ...Object.values(VEHICLE_STATUS).map(s => ({ value: s, label: s }))
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    ...VEHICLE_TYPES.map(t => ({ value: t, label: t }))
  ];

  const terminalOptions = [
    { value: '', label: 'All Terminals' },
    ...(terminalsData?.data?.data?.map(t => ({ value: t._id, label: t.name })) || [])
  ];

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-gray-600">Manage all vehicles</p>
        </div>
        <Link to="/vehicles/create">
          <Button icon={IoAddOutline}>
            Add Vehicle
          </Button>
        </Link>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search vehicles..."
              icon={IoSearchOutline}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
            <Select
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            {hasRole('Superadmin') && (
              <Select
                options={terminalOptions}
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <IoGridOutline />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <IoListOutline />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {vehicles.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <VehicleTable 
              vehicles={vehicles} 
              isLoading={isLoading}
              onEdit={(vehicle) => window.location.href = `/vehicles/${vehicle._id}`}
            />
          )}
          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No vehicles found"
          description="Add your first vehicle to get started."
          actionLabel="Add Vehicle"
          onAction={() => window.location.href = '/vehicles/create'}
        />
      )}
    </div>
  );
};

export default Vehicles;