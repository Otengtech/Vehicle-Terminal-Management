import { useQuery } from '@tanstack/react-query';
import { terminalsApi } from '@api/terminals';
import { useAuth } from './useAuth';

export const useTerminal = (terminalId) => {
  const { user } = useAuth();

  const id = terminalId || user?.terminalId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['terminal', id],
    queryFn: () => terminalsApi.getById(id),
    enabled: !!id,
  });

  return {
    terminal: data?.data?.data,
    isLoading,
    error,
    refetch
  };
};