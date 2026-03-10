export const USER_ROLES = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin',
};

export const VEHICLE_STATUS = {
  CHECKED_IN: 'Checked-In',
  CHECKED_OUT: 'Checked-Out',
  IN_TRANSIT: 'In Transit',
  UNDER_INSPECTION: 'Under Inspection',
  MAINTENANCE: 'Maintenance',
  RESERVED: 'Reserved',
  AVAILABLE: 'Available',
};

export const VEHICLE_TYPES = [
  'Sedan',
  'SUV',
  'Truck',
  'Van',
  'Motorcycle',
  'Heavy Machinery',
  'Trailer',
  'Other',
];

export const DRIVER_STATUS = {
  AVAILABLE: 'Available',
  ON_ROUTE: 'On Route',
  OFF_DUTY: 'Off Duty',
  ON_LEAVE: 'On Leave',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated',
};

export const TERMINAL_STATUS = {
  OPERATIONAL: 'Operational',
  UNDER_MAINTENANCE: 'Under Maintenance',
  CLOSED: 'Closed',
};

export const ACTION_TYPES = [
  'Check-In',
  'Check-Out',
  'Inspection Pass',
  'Inspection Fail',
  'Transfer',
  'Status Change',
  'Driver Assignment',
  'Driver Unassignment',
  'Damage Reported',
  'Maintenance Started',
  'Maintenance Completed',
  'Location Update',
];

export const LICENSE_CLASSES = ['A', 'B', 'C', 'D', 'E', 'CDL'];

export const FUEL_LEVELS = ['Empty', '1/4', '1/2', '3/4', 'Full'];

export const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

export const DAMAGE_SEVERITY = ['Minor', 'Moderate', 'Severe'];