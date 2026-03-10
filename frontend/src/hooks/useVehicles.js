import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@api/vehicles';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useVehicles = (params = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Default to user's terminal if admin
  const defaultParams = {
    ...params,
    terminalId: user?.role === 'Admin' ? user?.terminalId : params.terminalId
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', defaultParams],
    queryFn: () => vehiclesApi.getAll(defaultParams),
  });

  const createMutation = useMutation({
    mutationFn: (data) => vehiclesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vehiclesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update vehicle');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  });

  const checkInMutation = useMutation({
    mutationFn: ({ id, data }) => vehiclesApi.checkIn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle checked in successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to check in vehicle');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: (id) => vehiclesApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle checked out successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to check out vehicle');
    }
  });

  return {
    vehicles: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    refetch,
    createVehicle: createMutation.mutate,
    updateVehicle: updateMutation.mutate,
    deleteVehicle: deleteMutation.mutate,
    checkIn: checkInMutation.mutate,
    checkOut: checkOutMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};