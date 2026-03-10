import React from 'react';
import Table from '@components/Common/Table';
import StatusBadge from './StatusBadge';
import Button from '@components/Common/Button';
import Badge from '@components/Common/Badge';
import { IoCreateOutline, IoTrashOutline, IoSwapHorizontalOutline } from 'react-icons/io5';

const VehicleTable = ({ vehicles = [], onEdit, onDelete, onCheckInOut, isLoading }) => {
  const columns = [
    {
      key: 'licensePlate',
      label: 'License Plate',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.make} {row.model}</div>
        </div>
      )
    },
    {
      key: 'year',
      label: 'Year',
      sortable: true,
    },
    {
      key: 'color',
      label: 'Color',
    },
    {
      key: 'currentStatus',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'assignedDriverId',
      label: 'Driver',
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value?.fullName || 'Unassigned'}
        </span>
      )
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (value) => (
        <Badge variant={
          value === 'Excellent' ? 'success' :
          value === 'Good' ? 'info' :
          value === 'Fair' ? 'warning' : 'error'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'damages',
      label: 'Damages',
      render: (value) => value?.length > 0 && (
        <Badge variant="error">{value.length}</Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCheckInOut(row);
            }}
            title={row.currentStatus === 'Checked-In' ? 'Check Out' : 'Check In'}
          >
            <IoSwapHorizontalOutline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
          >
            <IoCreateOutline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            className="text-error-600 hover:text-error-700"
          >
            <IoTrashOutline className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={vehicles}
      isLoading={isLoading}
      onRowClick={onEdit}
    />
  );
};

export default VehicleTable;