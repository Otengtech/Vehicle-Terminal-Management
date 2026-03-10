import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { terminalsApi } from '@api/terminals';
import TerminalCard from '@components/Terminals/TerminalCard';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import EmptyState from '@components/Common/EmptyState';
import { IoAddOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

const Terminals = () => {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['terminals', search],
    queryFn: () => terminalsApi.getAll({ search }),
  });

  const terminals = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terminals</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all terminals</p>
        </div>
        {hasRole('Superadmin') && (
          <Link to="/terminals/create">
            <Button icon={IoAddOutline}>
              Add Terminal
            </Button>
          </Link>
        )}
      </div>

      {terminals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terminals.map((terminal) => (
            <TerminalCard key={terminal._id} terminal={terminal} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No terminals found"
          description="Get started by creating your first terminal."
          actionLabel="Add Terminal"
          onAction={() => window.location.href = '/terminals/create'}
        />
      )}
    </div>
  );
};

export default Terminals;