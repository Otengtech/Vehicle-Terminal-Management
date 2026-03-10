import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@api/drivers';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useDrivers = (params = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Default to user's terminal if admin
  const defaultParams = {
    ...params,
    terminalId: user?.role === 'Admin' ? user?.terminalId : params.terminalId
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['drivers', defaultParams],
    queryFn: () => driversApi.getAll(defaultParams),
  });

  const createMutation = useMutation({
    mutationFn: (data) => driversApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create driver');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driversApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update driver');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => driversApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    }
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ driverId, vehicleId }) => driversApi.assignVehicle(driverId, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Vehicle assigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign vehicle');
    }
  });

  return {
    drivers: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    refetch,
    createDriver: createMutation.mutate,
    updateDriver: updateMutation.mutate,
    deleteDriver: deleteMutation.mutate,
    assignVehicle: assignVehicleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};