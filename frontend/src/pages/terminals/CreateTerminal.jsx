import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { terminalsApi } from '@api/terminals';
import TerminalForm from '@components/Terminals/TerminalForm';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import { IoArrowBackOutline } from 'react-icons/io5';
import { CardBody } from "reactstrap";
import toast from 'react-hot-toast';

const CreateTerminal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => terminalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['terminals']);
      toast.success('Terminal created successfully');
      navigate('/terminals');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create terminal');
    }
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/terminals')}>
          <IoArrowBackOutline className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Terminal</h1>
          <p className="text-gray-600 dark:text-gray-400">Add a new terminal to the system</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <TerminalForm 
            onSubmit={handleSubmit} 
            isLoading={mutation.isPending}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateTerminal;