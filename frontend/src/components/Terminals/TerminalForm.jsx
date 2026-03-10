import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import { IoLocationOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5';

const TerminalForm = ({ initialData = {}, onSubmit, isLoading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const statusOptions = [
    { value: 'Operational', label: 'Operational' },
    { value: 'Under Maintenance', label: 'Under Maintenance' },
    { value: 'Closed', label: 'Closed' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Terminal Name"
          register={register}
          name="name"
          error={errors.name?.message}
          required
          rules={{ required: 'Terminal name is required' }}
        />

        <Input
          label="Location"
          icon={IoLocationOutline}
          register={register}
          name="location"
          error={errors.location?.message}
          required
          rules={{ required: 'Location is required' }}
        />

        <Input
          label="Capacity"
          type="number"
          register={register}
          name="capacity"
          error={errors.capacity?.message}
          required
          rules={{ 
            required: 'Capacity is required',
            min: { value: 1, message: 'Capacity must be at least 1' }
          }}
        />

        <Select
          label="Status"
          options={statusOptions}
          register={register}
          name="status"
          error={errors.status?.message}
        />

        <Input
          label="Contact Number"
          icon={IoCallOutline}
          register={register}
          name="contactNumber"
          error={errors.contactNumber?.message}
        />

        <Input
          label="Contact Email"
          type="email"
          icon={IoMailOutline}
          register={register}
          name="contactEmail"
          error={errors.contactEmail?.message}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Street"
            register={register}
            name="address.street"
          />
          <Input
            label="City"
            register={register}
            name="address.city"
          />
          <Input
            label="State"
            register={register}
            name="address.state"
          />
          <Input
            label="Country"
            register={register}
            name="address.country"
          />
          <Input
            label="Zip Code"
            register={register}
            name="address.zipCode"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData._id ? 'Update' : 'Create'} Terminal
        </Button>
      </div>
    </form>
  );
};

export default TerminalForm;