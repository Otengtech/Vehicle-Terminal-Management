import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { terminalsApi } from '@api/terminals';
import { recordsApi } from '@api/records';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import Button from '@components/Common/Button';
import Spinner from '@components/Common/Spinner';
import ActivityLog from '@components/Records/ActivityLog';
import { IoArrowBackOutline, IoDownloadOutline } from 'react-icons/io5';
import { formatDate } from '@utils/formatters';
import * as XLSX from 'xlsx';

const TerminalReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));

  const { data: terminalData, isLoading: loadingTerminal } = useQuery({
    queryKey: ['terminal', id],
    queryFn: () => terminalsApi.getById(id),
  });

  const { data: dailyReport, isLoading: loadingReport } = useQuery({
    queryKey: ['terminal-report', id, date],
    queryFn: () => recordsApi.getDailyReport(id, date),
  });

  const terminal = terminalData?.data?.data;
  const report = dailyReport?.data?.data;

  const exportToExcel = () => {
    if (!report) return;

    const worksheet = XLSX.utils.json_to_sheet(report.records.map(r => ({
      'Time': formatDate(r.timestamp, 'HH:mm:ss'),
      'Action': r.actionType,
      'Description': r.notes,
      'Vehicle': r.vehicleId?.licensePlate || 'N/A',
      'Driver': r.driverId?.fullName || 'N/A',
      'Performed By': r.performedBy?.fullName || 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Report');
    XLSX.writeFile(workbook, `${terminal?.name}-report-${date}.xlsx`);
  };

  if (loadingTerminal) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <IoArrowBackOutline className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Terminal Report: {terminal?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{terminal?.location}</p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          icon={IoDownloadOutline}
          onClick={exportToExcel}
          disabled={!report}
        >
          Export Report
        </Button>
      </div>

      {/* Date Selection */}
      <Card>
        <CardBody>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      {loadingReport ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {report.totalRecords}
                </p>
              </CardBody>
            </Card>
            {Object.entries(report.summary).map(([action, data]) => (
              <Card key={action}>
                <CardBody>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {data.count}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Detailed Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Details - {formatDate(date)}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {report.records.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatDate(record.timestamp, 'HH:mm:ss')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.actionType.includes('Check-In') ? 'bg-success-100 text-success-700' :
                            record.actionType.includes('Check-Out') ? 'bg-warning-100 text-warning-700' :
                            record.actionType.includes('Damage') ? 'bg-error-100 text-error-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {record.actionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.vehicleId?.licensePlate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.driverId?.fullName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {record.notes}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.performedBy?.fullName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No data available for selected date</p>
        </div>
      )}
    </div>
  );
};

export default TerminalReport;