import React from 'react';
import Table from '@components/Common/Table';
import Badge from '@components/Common/Badge';
import Button from '@components/Common/Button';
import LicenseStatus from './LicenseStatus';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';

const DriverTable = ({ drivers = [], onEdit, onDelete, isLoading }) => {
  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
        </div>
      )
    },
    {
      key: 'licenseNumber',
      label: 'License',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-gray-900 dark:text-white">{value}</div>
          <LicenseStatus expiryDate={row.licenseExpiryDate} />
        </div>
      )
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      render: (value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={
          value === 'Available' ? 'success' :
          value === 'On Route' ? 'warning' :
          value === 'Off Duty' ? 'default' : 'error'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'assignedTerminalId',
      label: 'Terminal',
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value?.name || 'N/A'}
        </span>
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
      data={drivers}
      isLoading={isLoading}
      onRowClick={onEdit}
    />
  );
};

export default DriverTable;