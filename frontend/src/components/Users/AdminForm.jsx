import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import { IoMailOutline, IoPersonOutline } from 'react-icons/io5';

const AdminForm = ({ initialData = {}, onSubmit, isLoading = false, terminals = [] }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const terminalOptions = terminals.map(t => ({
    value: t._id,
    label: `${t.name} - ${t.location}`
  }));

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Pending', label: 'Pending' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          icon={IoPersonOutline}
          register={register}
          name="fullName"
          error={errors.fullName?.message}
          required
          rules={{ required: 'Full name is required' }}
        />

        <Input
          label="Email"
          type="email"
          icon={IoMailOutline}
          register={register}
          name="email"
          error={errors.email?.message}
          required
          rules={{ 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
        />

        <Select
          label="Assigned Terminal"
          options={terminalOptions}
          register={register}
          name="terminalId"
          required
          rules={{ required: 'Terminal is required' }}
        />

        <Select
          label="Status"
          options={statusOptions}
          register={register}
          name="status"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A temporary password will be generated and sent to the admin's email.
          They will be required to change it on first login.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData._id ? 'Update' : 'Create'} Admin
        </Button>
      </div>
    </form>
  );
};

export default AdminForm;