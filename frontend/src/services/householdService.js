import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (householdData) => {
  return {
    chuHo: householdData.ownerName,
    address: householdData.address,
    soThanhVien: parseInt(householdData.numMembers, 10), // Đảm bảo chuyển đổi thành số nguyên
    soDienThoai: householdData.phoneNumber,
    email: householdData.email,
    hoatDong: householdData.active === true, // Đảm bảo chuyển đổi thành boolean
    // Add new fields if they exist in the data
    ...(householdData.soHoKhau && { soHoKhau: householdData.soHoKhau }),
    ...(householdData.soNha && { soNha: householdData.soNha }),
    ...(householdData.duong && { duong: householdData.duong }),
    ...(householdData.phuong && { phuong: householdData.phuong }),
    ...(householdData.quan && { quan: householdData.quan }),
    ...(householdData.ngayLamHoKhau && { ngayLamHoKhau: householdData.ngayLamHoKhau })
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    ownerName: backendData.chuHo,
    address: backendData.address,
    numMembers: typeof backendData.soThanhVien === 'number' ? backendData.soThanhVien : parseInt(backendData.soThanhVien, 10) || 1,
    phoneNumber: backendData.soDienThoai,
    email: backendData.email,
    active: backendData.hoatDong === true, // Đảm bảo chuyển đổi thành boolean
    // Include new fields
    soHoKhau: backendData.soHoKhau,
    soNha: backendData.soNha,
    duong: backendData.duong,
    phuong: backendData.phuong,
    quan: backendData.quan,
    ngayLamHoKhau: backendData.ngayLamHoKhau
  };
};

// Get all households with optional filters
export const getAllHouseholds = async (filters = {}) => {
  try {
    console.log('Fetching households with filters:', filters);
    const response = await api.get('/households', { params: filters });
    console.log('API response for households:', response);
    
    if (!response.data) {
      console.error('API response has no data property:', response);
      return [];
    }
    
    // Handle case where the data might be a string (JSON parse error from backend)
    let households = response.data;
    
    // If the response is a string, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        console.log('Response data is a string, attempting to parse');
        // If the backend returns a string due to serialization error, try to extract just the households array
        // Looking for something that resembles JSON array structure
        const match = response.data.match(/\[\s*\{\s*"id".*?\}\s*\]/s);
        if (match) {
          const jsonStr = match[0];
          households = JSON.parse(jsonStr);
          console.log('Successfully parsed households from string');
        } else {
          console.error('Could not find households array in response string');
          return [];
        }
      } catch (parseError) {
        console.error('Error parsing response data as JSON:', parseError);
        return [];
      }
    }
    
    if (!Array.isArray(households)) {
      console.error('API response data is not an array:', households);
      
      // If it's an object with a property that could be the households array, try to use that
      if (households && typeof households === 'object') {
        // Look for any property that is an array
        const arrayProps = Object.keys(households).filter(key => 
          Array.isArray(households[key])
        );
        
        if (arrayProps.length > 0) {
          console.log('Found array property:', arrayProps[0]);
          households = households[arrayProps[0]];
        } else {
          // If it's just a single household object, wrap it in an array
          if (households.id) {
            console.log('Converting single household to array');
            households = [households];
          } else {
            return [];
          }
        }
      } else {
        return [];
      }
    }
    
    if (households.length === 0) {
      console.log('API returned empty households array');
    } else {
      console.log('Successfully fetched', households.length, 'households');
    }
    
    // Map backend data to frontend format
    return households.map(household => mapToFrontendFormat(household));
  } catch (error) {
    console.error('Error fetching households:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return []; // Return empty array instead of throwing to avoid UI errors
  }
};

// Get a household by ID
export const getHouseholdById = async (id) => {
  try {
    const response = await api.get(`/households/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching household with ID ${id}:`, error);
    throw error;
  }
};

// Create a new household
export const createHousehold = async (householdData) => {
  try {
    console.log('Creating household with data:', householdData);
    const mappedData = mapToBackendFormat(householdData);
    console.log('Mapped to backend format:', mappedData);
    const response = await api.post('/households', mappedData);
    console.log('Household created response:', response);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating household:', error);
    throw error;
  }
};

// Update a household
export const updateHousehold = async (id, householdData) => {
  try {
    const mappedData = mapToBackendFormat(householdData);
    const response = await api.put(`/households/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating household with ID ${id}:`, error);
    throw error;
  }
};

// Delete a household (deactivate)
export const deleteHousehold = async (id) => {
  try {
    await api.delete(`/households/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting household with ID ${id}:`, error);
    throw error;
  }
};

// Activate a household
export const activateHousehold = async (id) => {
  try {
    await api.put(`/households/${id}/activate`);
    return true;
  } catch (error) {
    console.error(`Error activating household with ID ${id}:`, error);
    throw error;
  }
};

// Search households by owner name or address
export const searchHouseholds = async (searchParams) => {
  try {
    const response = await api.get('/households/search', { params: searchParams });
    return response.data.map(household => mapToFrontendFormat(household));
  } catch (error) {
    console.error('Error searching households:', error);
    throw error;
  }
};

// Get household payment history
export const getHouseholdPaymentHistory = async (id) => {
  try {
    const response = await api.get(`/households/${id}/payments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment history for household with ID ${id}:`, error);
    throw error;
  }
};

// Get household statistics
export const getHouseholdStatistics = async (id) => {
  try {
    const response = await api.get(`/households/${id}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for household with ID ${id}:`, error);
    throw error;
  }
};

// Get household members
export const getHouseholdMembers = async (id) => {
  try {
    const response = await api.get(`/households/${id}/members`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching members for household with ID ${id}:`, error);
    throw error;
  }
};

// Add person to household
export const addPersonToHousehold = async (householdId, personData) => {
  try {
    const payload = {
      nhanKhauId: personData.nhanKhauId,
      quanHeVoiChuHo: personData.relationship,
      ghiChu: personData.note
    };
    const response = await api.post(`/households/${householdId}/members`, payload);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error adding person to household with ID ${householdId}:`, error);
    throw error;
  }
};

// Remove person from household
export const removePersonFromHousehold = async (householdId, personId, note) => {
  try {
    const params = note ? { ghiChu: note } : {};
    const response = await api.delete(`/households/${householdId}/members/${personId}`, { params });
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error removing person from household with ID ${householdId}:`, error);
    throw error;
  }
};