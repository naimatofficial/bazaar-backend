import Vendor from '../models/vendorModel.js';


export const validateVendorInput = (data) => {
  const errors = [];
  if (!data.firstName || typeof data.firstName !== 'string') errors.push('Invalid first name');
  if (!data.lastName || typeof data.lastName !== 'string') errors.push('Invalid last name');
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') errors.push('Invalid phone number');
  if (!data.email || typeof data.email !== 'string') errors.push('Invalid email');
  if (!data.password || typeof data.password !== 'string') errors.push('Invalid password');
  if (!data.shopName || typeof data.shopName !== 'string') errors.push('Invalid shop name');
  if (!data.address || typeof data.address !== 'string') errors.push('Invalid address');

  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const applyVendorSearchFilters = (filters) => {
  const query = {};
  if (filters.firstName) query.firstName = { $regex: filters.firstName, $options: 'i' };
  if (filters.lastName) query.lastName = { $regex: filters.lastName, $options: 'i' };
  if (filters.email) query.email = { $regex: filters.email, $options: 'i' };
  if (filters.shopName) query.shopName = { $regex: filters.shopName, $options: 'i' };

  return query;
};
