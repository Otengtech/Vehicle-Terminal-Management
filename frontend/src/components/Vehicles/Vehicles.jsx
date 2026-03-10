import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@api/vehicles';
import { terminalsApi } from '@api/terminals';
import { driversApi } from '@api/drivers';
import VehicleCard from '@components/Vehicles/VehicleCard';
import VehicleTable from '@components/Vehicles/VehicleTable';
import CheckInModal from '@components/Vehicles/CheckInModal';
import CheckOutModal from '@components/Vehicles/CheckOutModal';
import DamageReportForm from '@components/Vehicles/DamageReportForm';
import Button from '@components/Common/Button';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Spinner from '@components/Common/Spinner';
import EmptyState from '@components/Common/EmptyState';
import Pagination from '@components/Common/Pagination';
import { 
  IoAddOutline, 
  IoGridOutline, 
  IoListOutline, 
  IoSearchOutline,
  IoSyncOutline 
} from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useDebounce } from '@hooks/useDebounce';
import { VEHICLE_STATUS, VEHICLE_TYPES } from '@utils/constants';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Vehicles = () => {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [terminalId, setTerminalId] = useState(user?.role === 'Admin' ? user?.terminalId : '');
  const [page, setPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showDamageReport, setShowDamageReport] = useState(false);
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

  const { data: driversData } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => driversApi.getAvailable({ terminalId: terminalId || user?.terminalId }),
  });

  const checkInMutation = useMutation({
    mutationFn: (data) => vehiclesApi.checkIn(selectedVehicle._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle checked in successfully');
      setShowCheckIn(false);
      setSelectedVehicle(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to check in vehicle');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: () => vehiclesApi.checkOut(selectedVehicle._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle checked out successfully');
      setShowCheckOut(false);
      setSelectedVehicle(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to check out vehicle');
    }
  });

  const damageMutation = useMutation({
    mutationFn: (data) => vehiclesApi.reportDamage(selectedVehicle._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Damage reported successfully');
      setShowDamageReport(false);
      setSelectedVehicle(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to report damage');
    }
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

  const handleCheckIn = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowCheckIn(true);
  };

  const handleCheckOut = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowCheckOut(true);
  };

  const handleDamageReport = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDamageReport(true);
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all vehicles in the system</p>
        </div>
        <Link to="/vehicles/create">
          <Button icon={IoAddOutline}>
            Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Filters */}
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
      {vehicles.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="relative group">
                  <VehicleCard vehicle={vehicle} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    {vehicle.currentStatus === 'Checked-In' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCheckOut(vehicle);
                        }}
                        title="Check Out"
                      >
                        <IoSyncOutline className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCheckIn(vehicle);
                        }}
                        title="Check In"
                      >
                        <IoSyncOutline className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <VehicleTable 
              vehicles={vehicles} 
              isLoading={isLoading}
              onEdit={(vehicle) => window.location.href = `/vehicles/${vehicle._id}`}
              onCheckInOut={(vehicle) => 
                vehicle.currentStatus === 'Checked-In' 
                  ? handleCheckOut(vehicle) 
                  : handleCheckIn(vehicle)
              }
              onDelete={(vehicle) => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                  // Handle delete
                }
              }}
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
          title="No vehicles found"
          description="Get started by adding your first vehicle."
          actionLabel="Add Vehicle"
          onAction={() => window.location.href = '/vehicles/create'}
        />
      )}

      {/* Modals */}
      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => {
          setShowCheckIn(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onSubmit={checkInMutation.mutate}
        isLoading={checkInMutation.isPending}
      />

      <CheckOutModal
        isOpen={showCheckOut}
        onClose={() => {
          setShowCheckOut(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onConfirm={checkOutMutation.mutate}
        isLoading={checkOutMutation.isPending}
      />

      <DamageReportForm
        isOpen={showDamageReport}
        onClose={() => {
          setShowDamageReport(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onSubmit={damageMutation.mutate}
        isLoading={damageMutation.isPending}
      />
    </div>
  );
};

export default Vehicles;