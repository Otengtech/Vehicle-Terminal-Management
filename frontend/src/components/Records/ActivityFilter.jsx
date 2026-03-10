import React from 'react';
import Input from '@components/Common/Input';
import Select from '@components/Common/Select';
import Button from '@components/Common/Button';
import Card, { CardHeader, CardBody } from '@components/Common/Card';
import { ACTION_TYPES } from '@utils/constants';
import { IoSearchOutline, IoRefreshOutline } from 'react-icons/io5';

const ActivityFilter = ({ filters = {}, onFilterChange, onReset }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    ...ACTION_TYPES.map(type => ({ value: type, label: type }))
  ];

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search..."
            icon={IoSearchOutline}
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />

          <Select
            options={actionOptions}
            value={filters.actionType || ''}
            onChange={(e) => handleChange('actionType', e.target.value)}
          />

          <Input
            type="date"
            label="From"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />

          <Input
            type="date"
            label="To"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="secondary" size="sm" onClick={onReset} className="mr-2">
            <IoRefreshOutline className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={() => onFilterChange(filters)}>
            Apply Filters
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ActivityFilter;