import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@components/Common/Modal';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import { DAMAGE_SEVERITY } from '@utils/constants';

const DamageReportForm = ({ isOpen, onClose, vehicle, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const severityOptions = DAMAGE_SEVERITY.map(s => ({ value: s, label: s }));

  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report Damage: ${vehicle.licensePlate}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Damage Location"
            register={register}
            name="location"
            error={errors.location?.message}
            required
            rules={{ required: 'Damage location is required' }}
            placeholder="e.g., Front bumper, Driver side door"
          />

          <Select
            label="Severity"
            options={severityOptions}
            register={register}
            name="severity"
            required
            rules={{ required: 'Severity is required' }}
          />

          <Input
            label="Description"
            register={register}
            name="description"
            error={errors.description?.message}
            required
            rules={{ required: 'Description is required' }}
            placeholder="Describe the damage in detail"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Report Damage
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DamageReportForm;