// Utility functions for the application

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-red-100 text-red-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'wanted':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'AlertTriangle';
    case 'inactive':
      return 'UserX';
    case 'wanted':
      return 'Shield';
    default:
      return 'User';
  }
};

export const validateAge = (age) => {
  const numAge = parseInt(age);
  return numAge >= 1 && numAge <= 120;
};

export const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  if (!formData.full_name || formData.full_name.trim() === '') {
    errors.full_name = 'Full name is required';
  }
  
  if (!formData.age || !validateAge(formData.age)) {
    errors.age = 'Valid age is required (1-120)';
  }
  
  if (!formData.gender || formData.gender === '') {
    errors.gender = 'Gender is required';
  }
  
  if (!formData.crime || formData.crime.trim() === '') {
    errors.crime = 'Crime is required';
  }
  
  if (!formData.status || formData.status === '') {
    errors.status = 'Status is required';
  }
  
  if (!formData.file) {
    errors.file = 'Image file is required';
  }
  
  return errors;
};
