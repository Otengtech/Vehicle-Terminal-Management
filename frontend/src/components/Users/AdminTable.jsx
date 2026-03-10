import React from 'react';
import Table from '@components/Common/Table';
import Badge from '@components/Common/Badge';
import Button from '@components/Common/Button';
import { IoCreateOutline, IoTrashOutline, IoLockClosedOutline } from 'react-icons/io5';
import { formatDate } from '@utils/formatters';

const AdminTable = ({ admins = [], onEdit, onDelete, onResetPassword, isLoading }) => {
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
      key: 'terminalId',
      label: 'Terminal',
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : value === 'Pending' ? 'warning' : 'error'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value ? formatDate(value) : 'Never'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(value)}
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
              onResetPassword(row);
            }}
            title="Reset Password"
          >
            <IoLockClosedOutline className="h-4 w-4" />
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
      data={admins}
      isLoading={isLoading}
      onRowClick={onEdit}
    />
  );
};

export default AdminTable;