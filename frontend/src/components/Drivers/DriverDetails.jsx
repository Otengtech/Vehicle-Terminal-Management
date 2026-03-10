import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@api/drivers';
import { vehiclesApi } from '@api/vehicles';
import { recordsApi } from '@api/records';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import Badge from '@components/Common/Badge';
import LicenseStatus from '@components/Drivers/LicenseStatus';
import ConfirmDialog from '@components/Common/ConfirmDialog';
import ActivityLog from '@components/Records/ActivityLog';
import { 
  IoArrowBackOutline, 
  IoCreateOutline, 
  IoTrashOutline,
  IoCallOutline,
  IoMailOutline,
  IoIdCardOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoPersonOutline
} from 'react-icons/io5';
import { formatDate } from '@utils/formatters';
import toast from 'react-hot-toast';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignVehicle, setShowAssignVehicle] = useState(false);

  const { data: driverData, isLoading: loadingDriver } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversApi.getById(id),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', 'available', driverData?.data?.data?.assignedTerminalId],
    queryFn: () => vehiclesApi.getAll({ 
      terminalId: driverData?.data?.data?.assignedTerminalId,
      status: 'Available',
      limit: 100
    }),
    enabled: !!driverData?.data?.data?.assignedTerminalId,
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['driver-history', id],
    queryFn: () => recordsApi.getAll({ 
      driverId: id,
      limit: 20,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => driversApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver deleted successfully');
      navigate('/drivers');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    }
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ vehicleId }) => driversApi.assignVehicle(id, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['driver', id]);
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle assigned successfully');
      setShowAssignVehicle(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign vehicle');
    }
  });

  const unassignVehicleMutation = useMutation({
    mutationFn: () => driversApi.unassignVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['driver', id]);
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle unassigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unassign vehicle');
    }
  });

  const driver = driverData?.data?.data;
  const vehicles = vehiclesData?.data?.data || [];
  const history = historyData?.data?.data || [];

  if (loadingDriver) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Driver not found</p>
        <Button onClick={() => navigate('/drivers')} className="mt-4">
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
          <Button variant="ghost" onClick={() => navigate('/drivers')}>
            <IoArrowBackOutline className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{driver.fullName}</h1>
            <p className="text-gray-600 dark:text-gray-400">Driver ID: {driver._id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            icon={IoCreateOutline}
            onClick={() => navigate(`/drivers/${id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            icon={IoTrashOutline}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Driver Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center">
              <IoPersonOutline className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{driver.fullName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <IoCallOutline className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{driver.phoneNumber}</p>
              </div>
            </div>
            {driver.email && (
              <div className="flex items-center">
                <IoMailOutline className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{driver.email}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* License Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">License Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center">
              <IoIdCardOutline className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">License Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{driver.licenseNumber}</p>
              </div>
            </div>
            <div className="flex items-center">
              <IoCalendarOutline className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(driver.licenseExpiryDate)}
                  </p>
                  <LicenseStatus expiryDate={driver.licenseExpiryDate} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">License Class</p>
              <Badge variant="info">{driver.licenseClass || 'D'}</Badge>
            </div>
          </CardBody>
        </Card>

        {/* Status & Assignment */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Status & Assignment</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
              <Badge variant={
                driver.status === 'Available' ? 'success' :
                driver.status === 'On Route' ? 'warning' :
                driver.status === 'Off Duty' ? 'default' : 'error'
              }>
                {driver.status}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Assigned Vehicle</p>
              {driver.currentVehicleId ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {driver.currentVehicleId.make} {driver.currentVehicleId.model}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {driver.currentVehicleId.licensePlate}
                      </p>
                    </div>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Unassign vehicle from this driver?')) {
                          unassignVehicleMutation.mutate();
                        }
                      }}
                      isLoading={unassignVehicleMutation.isPending}
                    >
                      Unassign
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No vehicle assigned</p>
                  {vehicles.length > 0 && (
                    <select 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800"
                      onChange={(e) => {
                        if (e.target.value) {
                          assignVehicleMutation.mutate({ vehicleId: e.target.value });
                        }
                      }}
                    >
                      <option value="">Select vehicle to assign</option>
                      {vehicles.map(v => (
                        <option key={v._id} value={v._id}>
                          {v.make} {v.model} - {v.licensePlate}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Emergency Contact */}
      {driver.emergencyContact && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Emergency Contact</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {driver.emergencyContact.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Relationship</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {driver.emergencyContact.relationship || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {driver.emergencyContact.phoneNumber}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Activity Log */}
      <ActivityLog 
        activities={history} 
        isLoading={loadingHistory}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Driver"
        message={`Are you sure you want to delete ${driver.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default DriverDetails;