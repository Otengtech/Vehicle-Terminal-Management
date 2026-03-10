import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '@api/records';
import { terminalsApi } from '@api/terminals';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import ActivityLog from '@components/Records/ActivityLog';
import ActivityFilter from '@components/Records/ActivityFilter';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import { IoDownloadOutline } from 'react-icons/io5';
import { useAuth } from '@hooks/useAuth';
import { formatDate } from '@utils/formatters';
import * as XLSX from 'xlsx';

const ActivityReports = () => {
  const { user, hasRole } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    actionType: '',
    startDate: '',
    endDate: '',
    terminalId: user?.role === 'Admin' ? user?.terminalId : ''
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: terminalsData } = useQuery({
    queryKey: ['terminals', 'list'],
    queryFn: () => terminalsApi.getAll({ limit: 100 }),
    enabled: hasRole('Superadmin'),
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', filters, page, limit],
    queryFn: () => recordsApi.getAll({ 
      ...filters,
      page, 
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['reports-summary', filters],
    queryFn: () => {
      if (filters.terminalId) {
        return recordsApi.getTerminalSummary(filters.terminalId);
      }
      return null;
    },
    enabled: !!filters.terminalId,
  });

  const activities = reportsData?.data?.data || [];
  const pagination = reportsData?.data?.pagination;
  const summary = summaryData?.data?.data;

  const terminalOptions = [
    { value: '', label: 'All Terminals' },
    ...(terminalsData?.data?.data?.map(t => ({ value: t._id, label: t.name })) || [])
  ];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(activities.map(a => ({
      'Date': formatDate(a.timestamp),
      'Action': a.actionType,
      'Description': a.notes,
      'Vehicle': a.vehicleId?.licensePlate || 'N/A',
      'Driver': a.driverId?.fullName || 'N/A',
      'Performed By': a.performedBy?.fullName || 'N/A',
      'Terminal': a.terminalId?.name || 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activities');
    XLSX.writeFile(workbook, `activity-report-${formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">View and export system activity</p>
        </div>
        <Button 
          variant="secondary" 
          icon={IoDownloadOutline}
          onClick={exportToExcel}
          disabled={activities.length === 0}
        >
          Export to Excel
        </Button>
      </div>

      {/* Terminal Filter for Superadmin */}
      {hasRole('Superadmin') && (
        <Card>
          <CardBody>
            <div className="max-w-xs">
              <Select
                label="Select Terminal"
                options={terminalOptions}
                value={filters.terminalId}
                onChange={(e) => setFilters({ ...filters, terminalId: e.target.value })}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {summary.summary?.map((item) => (
            <Card key={item._id}>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item._id}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Last: {formatDate(item.lastOccurrence)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Filter */}
      <ActivityFilter 
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({
          search: '',
          actionType: '',
          startDate: '',
          endDate: '',
          terminalId: user?.role === 'Admin' ? user?.terminalId : ''
        })}
      />

      {/* Activity Log */}
      <ActivityLog 
        activities={activities} 
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ActivityReports;