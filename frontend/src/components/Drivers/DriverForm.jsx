import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import { IoCallOutline, IoMailOutline, IoIdCardOutline } from 'react-icons/io5';
import { LICENSE_CLASSES, DRIVER_STATUS } from '@utils/constants';

const DriverForm = ({ initialData = {}, onSubmit, isLoading = false, terminals = [] }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const statusOptions = Object.values(DRIVER_STATUS).map(status => ({
    value: status,
    label: status
  }));

  const licenseClassOptions = LICENSE_CLASSES.map(cls => ({
    value: cls,
    label: cls
  }));

  const terminalOptions = terminals.map(t => ({
    value: t._id,
    label: t.name
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          register={register}
          name="fullName"
          error={errors.fullName?.message}
          required
          rules={{ required: 'Full name is required' }}
        />

        <Input
          label="License Number"
          icon={IoIdCardOutline}
          register={register}
          name="licenseNumber"
          error={errors.licenseNumber?.message}
          required
          rules={{ required: 'License number is required' }}
        />

        <Input
          label="License Expiry Date"
          type="date"
          register={register}
          name="licenseExpiryDate"
          error={errors.licenseExpiryDate?.message}
          required
          rules={{ required: 'License expiry date is required' }}
        />

        <Select
          label="License Class"
          options={licenseClassOptions}
          register={register}
          name="licenseClass"
        />

        <Input
          label="Phone Number"
          icon={IoCallOutline}
          register={register}
          name="phoneNumber"
          error={errors.phoneNumber?.message}
          required
          rules={{ required: 'Phone number is required' }}
        />

        <Input
          label="Email"
          type="email"
          icon={IoMailOutline}
          register={register}
          name="email"
        />

        <Select
          label="Status"
          options={statusOptions}
          register={register}
          name="status"
        />

        <Select
          label="Assigned Terminal"
          options={terminalOptions}
          register={register}
          name="terminalId"
          required
          rules={{ required: 'Terminal is required' }}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Name"
            register={register}
            name="emergencyContact.name"
            required
          />
          <Input
            label="Relationship"
            register={register}
            name="emergencyContact.relationship"
          />
          <Input
            label="Phone Number"
            register={register}
            name="emergencyContact.phoneNumber"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData._id ? 'Update' : 'Create'} Driver
        </Button>
      </div>
    </form>
  );
};

export default DriverForm;