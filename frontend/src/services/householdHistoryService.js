import api from './api';

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    householdId: backendData.hoKhauId,
    householdNumber: backendData.soHoKhau,
    personId: backendData.nhanKhauId,
    personName: backendData.hoTenNhanKhau, // Changed to match the controller's field name
    changeType: backendData.loaiThayDoi,
    changeDate: backendData.thoiGian, // Changed to match the controller's field name
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
    // Try to fetch from correct backend endpoint - using the correct Vietnamese endpoint
    try {
      const response = await api.get(`/household-history/ho-khau/${householdId}`);
      
      if (Array.isArray(response.data)) {
        return response.data.map(record => mapToFrontendFormat(record));
      }
      return [];
    } catch (backendError) {
      console.warn(`Backend error fetching history for household ${householdId}:`, backendError);
      
      // Try alternative English endpoint if the Vietnamese one fails
      try {
        const response = await api.get(`/household-history/household/${householdId}`);
        
        if (Array.isArray(response.data)) {
          return response.data.map(record => mapToFrontendFormat(record));
        }
      } catch (englishEndpointError) {
        console.warn(`English endpoint also failed:`, englishEndpointError);
        
        // If both fail, try another alternative path
        try {
          const alternativeResponse = await api.get(`/households/${householdId}/history`);
          if (Array.isArray(alternativeResponse.data)) {
            return alternativeResponse.data.map(record => mapToFrontendFormat(record));
          }
        } catch (alternativeError) {
          console.warn(`Alternative route also failed:`, alternativeError);
        }
      }
    }
    
    // If no data was successfully retrieved, return empty array
    console.log(`Returning empty history array for household ${householdId}`);
    return [];
  } catch (error) {
    console.error(`Error fetching history for household ${householdId}:`, error);
    return []; // Return empty array instead of throwing to prevent UI breakage
  }
};

// Get household history by person ID
export const getHistoryByPerson = async (personId) => {
  try {
    // Using the correct Vietnamese endpoint
    const response = await api.get(`/household-history/nhan-khau/${personId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching history for person ${personId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

// Get household history by date range
export const getHistoryByDateRange = async (startDate, endDate) => {
  try {
    // Using the correct Vietnamese endpoint
    const response = await api.get(`/household-history/thoi-gian-range`, {
      params: { startDate, endDate }
    });
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching history for date range:`, error);
    return []; // Return empty array instead of throwing
  }
};