import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { driversApi } from '@api/drivers';
import { terminalsApi } from '@api/terminals';
import DriverCard from '@components/Drivers/DriverCard';
import DriverTable from '@components/Drivers/DriverTable';
import Button from '@components/Common/Button';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Spinner from '@components/Common/Spinner';
import EmptyState from '@components/Common/EmptyState';
import Pagination from '@components/Common/Pagination';
import { IoAddOutline, IoGridOutline, IoListOutline, IoSearchOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useDebounce } from '@hooks/useDebounce';

const Drivers = () => {
  const { user, hasRole } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [terminalId, setTerminalId] = useState(user?.role === 'Admin' ? user?.terminalId : '');
  const [page, setPage] = useState(1);
  const limit = 12;

  const debouncedSearch = useDebounce(search, 500);

  const { data: driversData, isLoading } = useQuery({
    queryKey: ['drivers', { debouncedSearch, status, terminalId, page, limit }],
    queryFn: () => driversApi.getAll({ 
      search: debouncedSearch, 
      status, 
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

  const drivers = driversData?.data?.data || [];
  const pagination = driversData?.data?.pagination;

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Available', label: 'Available' },
    { value: 'On Route', label: 'On Route' },
    { value: 'Off Duty', label: 'Off Duty' },
    { value: 'On Leave', label: 'On Leave' },
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all drivers</p>
        </div>
        <Link to="/drivers/create">
          <Button icon={IoAddOutline}>
            Add Driver
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search drivers..."
              icon={IoSearchOutline}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
                <IoGridOutline className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <IoListOutline className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Content */}
      {drivers.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <DriverCard key={driver._id} driver={driver} />
              ))}
            </div>
          ) : (
            <DriverTable 
              drivers={drivers} 
              isLoading={isLoading}
              onEdit={(driver) => window.location.href = `/drivers/${driver._id}`}
            />
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No drivers found"
          description="Get started by adding your first driver."
          actionLabel="Add Driver"
          onAction={() => window.location.href = '/drivers/create'}
        />
      )}
    </div>
  );
};

export default Drivers;