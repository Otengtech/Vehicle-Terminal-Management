import React from 'react';
import Badge from '@components/Common/Badge';

const LicenseStatus = ({ expiryDate }) => {
  const getLicenseStatus = () => {
    if (!expiryDate) return { text: 'Unknown', variant: 'default' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { text: 'Expired', variant: 'error' };
    } else if (daysUntilExpiry <= 30) {
      return { text: `Expires in ${daysUntilExpiry} days`, variant: 'warning' };
    } else {
      return { text: 'Valid', variant: 'success' };
    }
  };

  const status = getLicenseStatus();

  return (
    <Badge variant={status.variant} className="text-xs">
      {status.text}
    </Badge>
  );
};

export default LicenseStatus;