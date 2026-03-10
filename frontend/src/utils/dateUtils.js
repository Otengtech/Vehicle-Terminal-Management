import { format, parse, differenceInDays, addDays, subDays, isAfter, isBefore } from 'date-fns';

export const formatDisplayDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

export const formatDisplayDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatDisplayTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
};

export const getDaysDifference = (date1, date2) => {
  return differenceInDays(new Date(date1), new Date(date2));
};

export const isExpired = (date) => {
  return isBefore(new Date(date), new Date());
};

export const isExpiringSoon = (date, days = 30) => {
  const expiryDate = new Date(date);
  const warningDate = addDays(new Date(), days);
  return isAfter(expiryDate, new Date()) && isBefore(expiryDate, warningDate);
};

export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = addDays(currentDate, 1);
  }
  return dates;
};

export const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDisplayDate(date);
};