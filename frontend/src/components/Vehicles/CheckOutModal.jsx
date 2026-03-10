import React from 'react';
import Modal from '@components/Common/Modal';
import Button from '@components/Common/Button';
import { IoWarningOutline } from 'react-icons/io5';

const CheckOutModal = ({ isOpen, onClose, vehicle, onConfirm, isLoading }) => {
  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Check Out: ${vehicle.licensePlate}`}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
          <IoWarningOutline className="h-6 w-6 text-warning-600 dark:text-warning-400" />
          <p className="text-sm text-warning-700 dark:text-warning-300">
            Are you sure you want to check out this vehicle?
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Vehicle:</span> {vehicle.make} {vehicle.model}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">License Plate:</span> {vehicle.licensePlate}
          </p>
          {vehicle.assignedDriverId && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Assigned Driver:</span> {vehicle.assignedDriverId.fullName}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirm Check Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckOutModal;