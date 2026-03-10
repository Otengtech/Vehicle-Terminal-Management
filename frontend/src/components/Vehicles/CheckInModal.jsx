import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@components/Common/Modal';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import { FUEL_LEVELS, VEHICLE_CONDITIONS } from '@utils/constants';

const CheckInModal = ({ isOpen, onClose, vehicle, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fuelLevel: 'Full',
      condition: 'Good',
      locationInYard: { zone: '', row: '', spot: '' }
    }
  });

  const fuelOptions = FUEL_LEVELS.map(level => ({ value: level, label: level }));
  const conditionOptions = VEHICLE_CONDITIONS.map(cond => ({ value: cond, label: cond }));

  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Check In: ${vehicle.licensePlate}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Fuel Level"
              options={fuelOptions}
              register={register}
              name="fuelLevel"
              required
            />
            <Select
              label="Condition"
              options={conditionOptions}
              register={register}
              name="condition"
              required
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Yard Location
            </h4>
            <div className="grid grid-cols-3 gap-4">
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
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Confirm Check In
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckInModal;