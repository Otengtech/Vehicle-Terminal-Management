import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@api/vehicles';
import { driversApi } from '@api/drivers';
import VehicleForm from '@components/Vehicles/VehicleForm';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import { IoArrowBackOutline } from 'react-icons/io5';
import { CardHeader, CardBody } from '@components/Common/Card';
import { useAuth } from '@hooks/useAuth';
import toast from 'react-hot-toast';

const CreateVehicle = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: driversData, isLoading } = useQuery({
    queryKey: ['drivers', 'available', user?.terminalId],
    queryFn: () => driversApi.getAvailable({ terminalId: user?.terminalId }),
  });

  const mutation = useMutation({
    mutationFn: (data) => vehiclesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle created successfully');
      navigate('/vehicles');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    }
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/vehicles')}>
          <IoArrowBackOutline className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Vehicle</h1>
          <p className="text-gray-600 dark:text-gray-400">Add a new vehicle to the system</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <VehicleForm 
            onSubmit={handleSubmit} 
            isLoading={mutation.isPending}
            drivers={driversData?.data?.data || []}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateVehicle;