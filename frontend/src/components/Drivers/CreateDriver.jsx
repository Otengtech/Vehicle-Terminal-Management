import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@api/drivers';
import { terminalsApi } from '@api/terminals';
import DriverForm from '@components/Drivers/DriverForm';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useAuth } from '@hooks/useAuth';
import toast from 'react-hot-toast';

const CreateDriver = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();

  const { data: terminalsData, isLoading } = useQuery({
    queryKey: ['terminals', 'list'],
    queryFn: () => terminalsApi.getAll({ limit: 100 }),
    enabled: hasRole('Superadmin'),
  });

  const mutation = useMutation({
    mutationFn: (data) => driversApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver created successfully');
      navigate('/drivers');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create driver');
    }
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  const terminals = terminalsData?.data?.data || [];
  
  // For admin, use their terminal
  const initialData = user?.role === 'Admin' 
    ? { terminalId: user.terminalId }
    : {};

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
        <Button variant="ghost" onClick={() => navigate('/drivers')}>
          <IoArrowBackOutline className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Driver</h1>
          <p className="text-gray-600 dark:text-gray-400">Add a new driver to the system</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <DriverForm 
            initialData={initialData}
            onSubmit={handleSubmit} 
            isLoading={mutation.isPending}
            terminals={terminals}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateDriver;