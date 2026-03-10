import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { terminalsApi } from '@api/terminals';
import { vehiclesApi } from '@api/vehicles';
import { driversApi } from '@api/drivers';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import Badge from '@components/Common/Badge';
import ConfirmDialog from '@components/Common/ConfirmDialog';
import CapacityIndicator from '@components/Terminals/CapacityIndicator';
import VehicleTable from '@components/Vehicles/VehicleTable';
import DriverTable from '@components/Drivers/DriverTable';
import { IoArrowBackOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/useAuth';

const TerminalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: terminalData, isLoading: loadingTerminal } = useQuery({
    queryKey: ['terminal', id],
    queryFn: () => terminalsApi.getById(id),
  });

  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles', 'terminal', id],
    queryFn: () => vehiclesApi.getByTerminal(id),
  });

  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers', 'terminal', id],
    queryFn: () => driversApi.getAll({ terminalId: id }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => terminalsApi.delete(id),
    onSuccess: () => {
      toast.success('Terminal deleted successfully');
      navigate('/terminals');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete terminal');
    }
  });

  const terminal = terminalData?.data?.data;
  const vehicles = vehiclesData?.data?.data || [];
  const drivers = driversData?.data?.data || [];

  if (loadingTerminal) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!terminal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Terminal not found</p>
        <Button onClick={() => navigate('/terminals')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/terminals')}>
            <IoArrowBackOutline className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{terminal.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{terminal.location}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            icon={IoCreateOutline}
            onClick={() => navigate(`/terminals/${id}/edit`)}
          >
            Edit
          </Button>
          {hasRole('Superadmin') && (
            <Button 
              variant="danger" 
              icon={IoTrashOutline}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</h3>
                <Badge variant={terminal.status === 'Operational' ? 'success' : 'warning'}>
                  {terminal.status}
                </Badge>
              </div>
              <CapacityIndicator 
                current={terminal.currentOccupancy} 
                capacity={terminal.capacity} 
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              {terminal.contactNumber && (
                <p className="text-gray-900 dark:text-white">{terminal.contactNumber}</p>
              )}
              {terminal.contactEmail && (
                <p className="text-gray-900 dark:text-white">{terminal.contactEmail}</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Address</h3>
            <div className="space-y-1 text-sm">
              {terminal.address?.street && <p>{terminal.address.street}</p>}
              <p>
                {terminal.address?.city && `${terminal.address.city}, `}
                {terminal.address?.state && `${terminal.address.state} `}
                {terminal.address?.zipCode}
              </p>
              {terminal.address?.country && <p>{terminal.address.country}</p>}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Vehicles Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vehicles in Terminal</h2>
            <Button variant="primary" size="sm" onClick={() => navigate('/vehicles/create')}>
              Add Vehicle
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <VehicleTable 
            vehicles={vehicles} 
            isLoading={loadingVehicles}
            onEdit={(vehicle) => navigate(`/vehicles/${vehicle._id}`)}
          />
        </CardBody>
      </Card>

      {/* Drivers Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Assigned Drivers</h2>
            <Button variant="primary" size="sm" onClick={() => navigate('/drivers/create')}>
              Add Driver
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <DriverTable 
            drivers={drivers} 
            isLoading={loadingDrivers}
            onEdit={(driver) => navigate(`/drivers/${driver._id}`)}
          />
        </CardBody>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Terminal"
        message={`Are you sure you want to delete ${terminal.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default TerminalDetails;