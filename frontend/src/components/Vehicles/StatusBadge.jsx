import React from 'react';
import Badge from '@components/Common/Badge';

const StatusBadge = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'Checked-In':
        return 'success';
      case 'Checked-Out':
        return 'default';
      case 'In Transit':
        return 'warning';
      case 'Under Inspection':
        return 'info';
      case 'Maintenance':
        return 'warning';
      case 'Reserved':
        return 'primary';
      case 'Available':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant()}>
      {status}
    </Badge>
  );
};

export default StatusBadge;