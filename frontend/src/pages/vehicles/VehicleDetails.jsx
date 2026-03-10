import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@api/vehicles';
import { recordsApi } from '@api/records';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import Badge from '@components/Common/Badge';
import StatusBadge from '@components/Vehicles/StatusBadge';
import CheckInModal from '@components/Vehicles/CheckInModal';
import CheckOutModal from '@components/Vehicles/CheckOutModal';
import DamageReportForm from '@components/Vehicles/DamageReportForm';
import ActivityLog from '@components/Records/ActivityLog';
import { 
  IoArrowBackOutline, 
  IoCreateOutline, 
  IoSyncOutline,
  IoWarningOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline
} from 'react-icons/io5';
import { formatDate } from '@utils/formatters';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showDamageReport, setShowDamageReport] = useState(false);

  const { data: vehicleData, isLoading: loadingVehicle } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(id),
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['vehicle-history', id],
    queryFn: () => recordsApi.getVehicleHistory(id, 20),
  });

  const checkInMutation = useMutation({
    mutationFn: (data) => vehiclesApi.checkIn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicle', id]);
      queryClient.invalidateQueries(['vehicle-history', id]);
      toast.success('Vehicle checked in successfully');
      setShowCheckIn(false);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => vehiclesApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicle', id]);
      queryClient.invalidateQueries(['vehicle-history', id]);
      toast.success('Vehicle checked out successfully');
      setShowCheckOut(false);
    },
  });

  const damageMutation = useMutation({
    mutationFn: (data) => vehiclesApi.reportDamage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicle', id]);
      queryClient.invalidateQueries(['vehicle-history', id]);
      toast.success('Damage reported successfully');
      setShowDamageReport(false);
    },
  });

  const vehicle = vehicleData?.data?.data;
  const history = historyData?.data?.data || [];

  if (loadingVehicle) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehicle not found</p>
        <Button onClick={() => navigate('/vehicles')} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <IoArrowBackOutline className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{vehicle.make} {vehicle.model}</h1>
            <p className="text-gray-600">{vehicle.licensePlate}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" icon={IoCreateOutline} onClick={() => navigate(`/vehicles/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="secondary" icon={IoWarningOutline} onClick={() => setShowDamageReport(true)}>
            Report Damage
          </Button>
          {vehicle.currentStatus === 'Checked-In' ? (
            <Button variant="primary" icon={IoSyncOutline} onClick={() => setShowCheckOut(true)}>
              Check Out
            </Button>
          ) : (
            <Button variant="primary" icon={IoSyncOutline} onClick={() => setShowCheckIn(true)}>
              Check In
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={vehicle.currentStatus} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="font-medium">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium">{vehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">VIN</p>
                  <p className="font-medium">{vehicle.vin || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="font-medium mb-3">Location & Condition</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <IoLocationOutline className="h-4 w-4 text-gray-400 mr-2" />
                <span>
                  {vehicle.locationInYard 
                    ? `${vehicle.locationInYard.zone || ''} ${vehicle.locationInYard.row || ''} ${vehicle.locationInYard.spot || ''}`.trim()
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex items-center">
                <IoCarOutline className="h-4 w-4 text-gray-400 mr-2" />
                <span>Condition: {vehicle.condition} • Fuel: {vehicle.fuelLevel}</span>
              </div>
              <div className="flex items-center">
                <IoCalendarOutline className="h-4 w-4 text-gray-400 mr-2" />
                <span>Checked in: {vehicle.checkInTimestamp ? formatDate(vehicle.checkInTimestamp) : 'Not checked in'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="font-medium mb-3">Driver</h3>
            {vehicle.assignedDriverId ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <IoPersonOutline className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">{vehicle.assignedDriverId.fullName}</span>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  License: {vehicle.assignedDriverId.licenseNumber}
                </p>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/drivers/${vehicle.assignedDriverId._id}`)}>
                  View Driver
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">No driver assigned</p>
            )}
          </CardBody>
        </Card>
      </div>

      {vehicle.damages?.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Damage Reports</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {vehicle.damages.map((damage, index) => (
                <div key={index} className="border-l-4 border-error-500 bg-error-50 p-4">
                  <div className="flex justify-between">
                    <Badge variant={
                      damage.severity === 'Minor' ? 'warning' :
                      damage.severity === 'Moderate' ? 'error' : 'error'
                    }>
                      {damage.severity}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatDate(damage.reportedAt)}</span>
                  </div>
                  <p className="mt-2">{damage.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Location: {damage.location}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <ActivityLog activities={history} isLoading={loadingHistory} />

      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        vehicle={vehicle}
        onSubmit={checkInMutation.mutate}
        isLoading={checkInMutation.isPending}
      />

      <CheckOutModal
        isOpen={showCheckOut}
        onClose={() => setShowCheckOut(false)}
        vehicle={vehicle}
        onConfirm={checkOutMutation.mutate}
        isLoading={checkOutMutation.isPending}
      />

      <DamageReportForm
        isOpen={showDamageReport}
        onClose={() => setShowDamageReport(false)}
        vehicle={vehicle}
        onSubmit={damageMutation.mutate}
        isLoading={damageMutation.isPending}
      />
    </div>
  );
};

export default VehicleDetails;