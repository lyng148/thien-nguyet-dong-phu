import api from './api';

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    householdId: backendData.hoKhauId,
    householdNumber: backendData.soHoKhau,
    personId: backendData.nhanKhauId,
    personName: backendData.hoTen,
    changeType: backendData.loaiThayDoi,
    changeDate: backendData.ngayThayDoi,
    note: backendData.ghiChu,
    userId: backendData.nguoiThayDoi
  };
};

// Get all household history
export const getHouseholdHistory = async (filters = {}) => {
  try {
    const response = await api.get('/household-history', { params: filters });
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error('Error fetching household history:', error);
    throw error;
  }
};

// Get household history by household ID
export const getHistoryByHousehold = async (householdId) => {
  try {
    const response = await api.get(`/household-history/household/${householdId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching history for household ${householdId}:`, error);
    throw error;
  }
};

// Get household history by person ID
export const getHistoryByPerson = async (personId) => {
  try {
    const response = await api.get(`/household-history/person/${personId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching history for person ${personId}:`, error);
    throw error;
  }
};

// Get household history by date range
export const getHistoryByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/household-history/date-range`, {
      params: { startDate, endDate }
    });
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching history for date range:`, error);
    throw error;
  }
};