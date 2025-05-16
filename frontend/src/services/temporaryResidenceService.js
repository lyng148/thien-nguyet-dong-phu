import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (data) => {
  console.log("Before mapping:", data);
  // Nếu backend yêu cầu object nhanKhau thay vì nhanKhauId
  const mappedData = {
    trangThai: data.trangThai,
    diaChiTamTruTamVang: data.diaChiTamTruTamVang,
    thoiGian: data.thoiGian,
    noiDungDeNghi: data.noiDungDeNghi || '',
    nhanKhau: data.personId ? { id: Number(data.personId) } : null
  };
  console.log("After mapping:", mappedData);
  return mappedData;
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    trangThai: backendData.trangThai,
    diaChiTamTruTamVang: backendData.diaChiTamTruTamVang,
    thoiGian: backendData.thoiGian,
    noiDungDeNghi: backendData.noiDungDeNghi,
    personId: backendData.nhanKhauId, // Map nhanKhauId back to personId
    personName: backendData.hoTen, // Person's name may be included in response
    ngayDangKy: backendData.ngayDangKy
  };
};

// Get all temporary residence records
export const getAllTemporaryResidences = async (filters = {}) => {
  try {
    // Use paging to avoid loading everything at once - backend might paginate the response
    const params = {};
    
    // Add any filters if they exist
    if (filters && Object.keys(filters).length > 0) {
      Object.keys(filters).forEach(key => {
        params[key] = filters[key];
      });
    }
    
    // Add pagination parameters if not already provided
    if (!params.page) {
      params.page = 0;
    }
    if (!params.size) {
      params.size = 50; // Default page size
    }
    
    // Make API request with parameters
    const response = await api.get('/temporary-residence', { params });
    
    // Handle different response formats (array or paginated object)
    let data = [];
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      data = response.data.content;
    } else if (response.data) {
      data = [response.data];
    }
    
    // Map data to frontend format
    return data.map(record => mapToFrontendFormat(record));
  } catch (error) {
    console.error('Error fetching temporary residence records:', error);
    
    // Check for specific error types and handle appropriately
    if (error.response && error.response.status === 400) {
      console.warn('There might be a serialization issue with lazy-loaded relationships');
      // Return empty array instead of throwing
      return [];
    }
    
    throw error;
  }
};

// Get a temporary residence record by ID
export const getTemporaryResidenceById = async (id) => {
  try {
    const response = await api.get(`/temporary-residence/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching temporary residence record with ID ${id}:`, error);
    throw error;
  }
};

// Create a new temporary residence record
export const createTemporaryResidence = async (data) => {
  try {
    const mappedData = mapToBackendFormat(data);
    const response = await api.post('/temporary-residence', mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating temporary residence record:', error);
    throw error;
  }
};

// Update a temporary residence record
export const updateTemporaryResidence = async (id, data) => {
  try {
    const mappedData = mapToBackendFormat(data);
    const response = await api.put(`/temporary-residence/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating temporary residence record with ID ${id}:`, error);
    throw error;
  }
};

// Delete a temporary residence record
export const deleteTemporaryResidence = async (id) => {
  try {
    await api.delete(`/temporary-residence/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting temporary residence record with ID ${id}:`, error);
    throw error;
  }
};

// Get temporary residence records by person ID
export const getTemporaryResidenceByPerson = async (personId) => {
  try {
    if (!personId) {
      console.warn('Person ID is required for search');
      return [];
    }
    
    const response = await api.get(`/temporary-residence/person/${personId}`);
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    } else if (response.data && typeof response.data === 'object') {
      // Handle case when a single object is returned
      return [mapToFrontendFormat(response.data)];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching temporary residence records for person ${personId}:`, error);
    // Return empty array instead of throwing to prevent UI from breaking
    return [];
  }
};