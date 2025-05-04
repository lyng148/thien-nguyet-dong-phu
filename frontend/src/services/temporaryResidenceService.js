import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (data) => {
  return {
    maGiay: data.documentNumber,
    loaiGiay: data.documentType,
    tuNgay: data.startDate,
    denNgay: data.endDate,
    lyDo: data.reason,
    nhanKhauId: data.personId
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    documentNumber: backendData.maGiay,
    documentType: backendData.loaiGiay,
    startDate: backendData.tuNgay,
    endDate: backendData.denNgay,
    reason: backendData.lyDo,
    personId: backendData.nhanKhauId,
    personName: backendData.hoTen, // Person's name may be included in response
    registrationDate: backendData.ngayDangKy
  };
};

// Get all temporary residence records
export const getAllTemporaryResidences = async (filters = {}) => {
  try {
    const response = await api.get('/temporary-residence', { params: filters });
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error('Error fetching temporary residence records:', error);
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
    const response = await api.get(`/temporary-residence/person/${personId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(record => mapToFrontendFormat(record));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching temporary residence records for person ${personId}:`, error);
    throw error;
  }
};