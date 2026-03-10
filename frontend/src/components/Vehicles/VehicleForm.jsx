import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import { VEHICLE_TYPES, VEHICLE_STATUS, FUEL_LEVELS, VEHICLE_CONDITIONS } from '@utils/constants';

const VehicleForm = ({ initialData = {}, onSubmit, isLoading = false, drivers = [] }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const typeOptions = VEHICLE_TYPES.map(type => ({ value: type, label: type }));
  const statusOptions = Object.values(VEHICLE_STATUS).map(status => ({ value: status, label: status }));
  const fuelOptions = FUEL_LEVELS.map(level => ({ value: level, label: level }));
  const conditionOptions = VEHICLE_CONDITIONS.map(cond => ({ value: cond, label: cond }));
  
  const driverOptions = [
    { value: '', label: 'No Driver' },
    ...drivers.map(d => ({ value: d._id, label: d.fullName }))
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Input
          label="License Plate"
          register={register}
          name="licensePlate"
          error={errors.licensePlate?.message}
          required
          rules={{ required: 'License plate is required' }}
        />

        <Input
          label="VIN"
          register={register}
          name="vin"
        />

        <Input
          label="Make"
          register={register}
          name="make"
          required
          rules={{ required: 'Make is required' }}
        />

        <Input
          label="Model"
          register={register}
          name="model"
          required
          rules={{ required: 'Model is required' }}
        />

        <Input
          label="Year"
          type="number"
          register={register}
          name="year"
          required
          rules={{ 
            required: 'Year is required',
            min: { value: 1900, message: 'Invalid year' },
            max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
          }}
        />

        <Input
          label="Color"
          register={register}
          name="color"
        />

        <Select
          label="Vehicle Type"
          options={typeOptions}
          register={register}
          name="vehicleType"
          required
          rules={{ required: 'Vehicle type is required' }}
        />

        <Select
          label="Status"
          options={statusOptions}
          register={register}
          name="currentStatus"
        />

        <Select
          label="Fuel Level"
          options={fuelOptions}
          register={register}
          name="fuelLevel"
        />

        <Select
          label="Condition"
          options={conditionOptions}
          register={register}
          name="condition"
        />

        <Input
          label="Mileage"
          type="number"
          register={register}
          name="mileage"
        />

        <Select
          label="Assign Driver"
          options={driverOptions}
          register={register}
          name="assignedDriverId"
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Yard Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Zone"
            register={register}
            name="locationInYard.zone"
          />
          <Input
            label="Row"
            register={register}
            name="locationInYard.row"
          />
          <Input
            label="Spot"
            register={register}
            name="locationInYard.spot"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData._id ? 'Update' : 'Create'} Vehicle
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;