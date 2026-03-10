export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhone = (phone) => {
  const re = /^\+\d{1,3}\d{9,}$/;
  return re.test(String(phone));
};

export const isValidLicensePlate = (plate) => {
  const re = /^[A-Z0-9-]{2,15}$/;
  return re.test(String(plate).toUpperCase());
};

export const isValidVIN = (vin) => {
  const re = /^[A-HJ-NPR-Z0-9]{17}$/;
  return re.test(String(vin).toUpperCase());
};

export const isStrongPassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isLongEnough = password.length >= 8;
  
  return {
    isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecial && isLongEnough,
    errors: {
      hasUpperCase: !hasUpperCase && 'Missing uppercase letter',
      hasLowerCase: !hasLowerCase && 'Missing lowercase letter',
      hasNumbers: !hasNumbers && 'Missing number',
      hasSpecial: !hasSpecial && 'Missing special character',
      isLongEnough: !isLongEnough && 'Must be at least 8 characters',
    }
  };
};