import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (feeData) => {
  return {
    tenKhoanThu: feeData.name,
    batBuoc: feeData.type === 'MANDATORY', // Convert to boolean
    soTien: feeData.amount,
    thoiHan: feeData.dueDate,
    ghiChu: feeData.description,
    hoatDong: feeData.active,
    // Add creation date if not provided
    ngayTao: feeData.ngayTao || new Date().toISOString().split('T')[0]
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    name: backendData.tenKhoanThu,
    type: backendData.batBuoc ? 'MANDATORY' : 'VOLUNTARY', // Convert boolean to string type
    amount: backendData.soTien,
    dueDate: backendData.thoiHan,
    description: backendData.ghiChu,
    active: backendData.hoatDong,
    ngayTao: backendData.ngayTao
  };
};

// Get all fees with optional filters
export const getAllFees = async (filters = {}) => {
  try {
    // Always include showAll=true to get all fees regardless of active status
    const params = { ...filters, showAll: true };
    const response = await api.get('/fees', { params });
    
    // Map backend data to frontend format
    if (Array.isArray(response.data)) {
      return response.data.map(fee => mapToFrontendFormat(fee));
    }
    return [];
  } catch (error) {
    console.error('Error fetching fees:', error);
    throw error;
  }
};

// Get a fee by ID
export const getFeeById = async (id) => {
  try {
    const response = await api.get(`/fees/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching fee with ID ${id}:`, error);
    throw error;
  }
};

// Create a new fee
export const createFee = async (feeData) => {
  try {
    const mappedData = mapToBackendFormat(feeData);
    const response = await api.post('/fees', mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating fee:', error);
    throw error;
  }
};

// Update a fee
export const updateFee = async (id, feeData) => {
  try {
    const mappedData = mapToBackendFormat(feeData);
    const response = await api.put(`/fees/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating fee with ID ${id}:`, error);
    throw error;
  }
};

// Toggle fee active status
export const toggleFeeStatus = async (id, active) => {
  try {
    console.log(`Making API call to toggle fee ${id} to ${active ? 'active' : 'inactive'}`);
    // Fixed: Using the correct property name "hoatDong" instead of "active" to match the backend
    const response = await api.patch(`/fees/${id}/status`, { hoatDong: active });
    console.log(`API response for fee toggle:`, response);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error toggling status for fee with ID ${id}:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Delete a fee (deactivate)
export const deleteFee = async (id) => {
  try {
    await api.delete(`/fees/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting fee with ID ${id}:`, error);
    throw error;
  }
};

// Get payments for a fee
export const getFeePayments = async (id) => {
  try {
    const response = await api.get(`/payments/fee/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for fee with ID ${id}:`, error);
    throw error;
  }
};

// Get statistics for a fee
export const getFeeStatistics = async (id) => {
  try {
    const response = await api.get(`/fees/${id}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for fee with ID ${id}:`, error);
    throw error;
  }
};

// Get fees by type
export const getFeesByType = async (type) => {
  try {
    // Convert string type to boolean for backend
    const isMandatory = type === 'MANDATORY';
    const response = await api.get(`/fees/type/${isMandatory}`);
    
    // Map backend data to frontend format
    if (Array.isArray(response.data)) {
      return response.data.map(fee => mapToFrontendFormat(fee));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching fees of type ${type}:`, error);
    throw error;
  }
};

// Get households that have paid for a fee
export const getHouseholdsPaidForFee = async (id) => {
  try {
    const response = await api.get(`/fees/${id}/paid-households`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching paid households for fee with ID ${id}:`, error);
    throw error;
  }
};