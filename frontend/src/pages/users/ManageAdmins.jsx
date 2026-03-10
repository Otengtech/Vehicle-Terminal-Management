import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@api/users';
import { terminalsApi } from '@api/terminals';
import AdminTable from '@components/Users/AdminTable';
import AdminForm from '@components/Users/AdminForm';
import Button from '@components/Common/Button';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Modal from '@components/Common/Modal';
import ConfirmDialog from '@components/Common/ConfirmDialog';
import Spinner from '@components/Common/Spinner';
import EmptyState from '@components/Common/EmptyState';
import { IoAddOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
// jdjdjdj
const ManageAdmins = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: () => usersApi.getAdmins(),
  });

  const { data: terminalsData } = useQuery({
    queryKey: ['terminals', 'list'],
    queryFn: () => terminalsApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => usersApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admins']);
      toast.success('Admin created successfully');
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => usersApi.updateAdmin(selectedAdmin._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admins']);
      toast.success('Admin updated successfully');
      setShowModal(false);
      setSelectedAdmin(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteAdmin(selectedAdmin._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admins']);
      toast.success('Admin deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedAdmin(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => usersApi.resetPassword(selectedAdmin._id),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  const admins = adminsData?.data?.data || [];
  const terminals = terminalsData?.data?.data || [];

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleDelete = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteConfirm(true);
  };

  const handleResetPassword = (admin) => {
    if (confirm(`Send password reset email to ${admin.email}?`)) {
      resetPasswordMutation.mutate(admin);
    }
  };

  const handleSubmit = (data) => {
    if (selectedAdmin) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Admins</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage admin users</p>
        </div>
        <Button 
          icon={IoAddOutline}
          onClick={() => {
            setSelectedAdmin(null);
            setShowModal(true);
          }}
        >
          Add Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Admins</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{admins.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Admins</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {admins.filter(a => a.status === 'Active').length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {admins.filter(a => a.status === 'Suspended').length}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Admins Table */}
      {admins.length > 0 ? (
        <AdminTable 
          admins={admins}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
        />
      ) : (
        <EmptyState
          title="No admins found"
          description="Get started by creating your first admin."
          actionLabel="Add Admin"
          onAction={() => {
            setSelectedAdmin(null);
            setShowModal(true);
          }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setSelectedAdmin(null);
        }}
        title={selectedAdmin ? 'Edit Admin' : 'Create New Admin'}
        size="lg"
      >
        <AdminForm 
          initialData={selectedAdmin || {}}
          terminals={terminals}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedAdmin(null);
        }}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Admin"
        message={`Are you sure you want to delete ${selectedAdmin?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ManageAdmins;