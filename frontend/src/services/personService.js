import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (personData) => {
  // Map only the fields that match the backend entity
  return {
    hoTen: personData.hoTen || personData.fullName,
    ngaySinh: personData.ngaySinh || personData.dateOfBirth,
    gioiTinh: personData.gioiTinh || personData.gender,
    danToc: personData.danToc || personData.ethnicity,
    tonGiao: personData.tonGiao || personData.religion,
    cccd: personData.cccd || personData.idCardNumber,
    ngayCap: personData.ngayCap || personData.idCardIssueDate,
    noiCap: personData.noiCap || personData.idCardIssuePlace,
    ngheNghiep: personData.ngheNghiep || personData.occupation,
    ghiChu: personData.ghiChu || personData.notes,
    quanHeVoiChuHo: personData.quanHeVoiChuHo || personData.relationshipWithOwner
    // Other fields will be preserved if already present in the personData
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    hoTen: backendData.hoTen,
    fullName: backendData.hoTen,
    ngaySinh: backendData.ngaySinh,
    dateOfBirth: backendData.ngaySinh,
    gioiTinh: backendData.gioiTinh,
    gender: backendData.gioiTinh,
    danToc: backendData.danToc,
    ethnicity: backendData.danToc,
    tonGiao: backendData.tonGiao,
    religion: backendData.tonGiao,
    cccd: backendData.cccd,
    idCardNumber: backendData.cccd,
    ngayCap: backendData.ngayCap,
    idCardIssueDate: backendData.ngayCap,
    noiCap: backendData.noiCap,
    idCardIssuePlace: backendData.noiCap,
    ngheNghiep: backendData.ngheNghiep,
    occupation: backendData.ngheNghiep,
    ghiChu: backendData.ghiChu,
    notes: backendData.ghiChu,
    hoKhauId: backendData.hoKhauId,
    householdId: backendData.hoKhauId,
    quanHeVoiChuHo: backendData.quanHeVoiChuHo,
    relationshipWithOwner: backendData.quanHeVoiChuHo,
    soHoKhau: backendData.soHoKhau
  };
};

// Get all people
export const getAllPeople = async (filters = {}) => {
  try {
    const response = await api.get('/persons', { params: filters });
    
    if (Array.isArray(response.data)) {
      return response.data.map(person => mapToFrontendFormat(person));
    }
    return [];
  } catch (error) {
    console.error('Error fetching people:', error);
    throw error;
  }
};

// Get a person by ID
export const getPersonById = async (id) => {
  try {
    const response = await api.get(`/persons/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching person with ID ${id}:`, error);
    throw error;
  }
};

// Create a new person
export const createPerson = async (personData) => {
  try {
    const mappedData = mapToBackendFormat(personData);
    const response = await api.post('/persons', mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating person:', error);
    throw error;
  }
};

// Update a person
export const updatePerson = async (id, personData) => {
  try {
    const mappedData = mapToBackendFormat(personData);
    console.log('Updating person with data:', mappedData);
    const response = await api.put(`/persons/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating person with ID ${id}:`, error);
    throw error;
  }
};

// Delete a person
export const deletePerson = async (id) => {
  try {
    await api.delete(`/persons/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting person with ID ${id}:`, error);
    throw error;
  }
};

// Search people by name or ID card number
export const searchPeople = async (searchTerm) => {
  try {
    const response = await api.get(`/persons/search`, { 
      params: { q: searchTerm } 
    });
    
    if (Array.isArray(response.data)) {
      return response.data.map(person => mapToFrontendFormat(person));
    }
    return [];
  } catch (error) {
    console.error(`Error searching people with term ${searchTerm}:`, error);
    throw error;
  }
};

// Get unassigned people (not in any household)
export const getUnassignedPeople = async () => {
  try {
    const response = await api.get('/persons/unassigned');
    
    if (Array.isArray(response.data)) {
      return response.data.map(person => mapToFrontendFormat(person));
    }
    return [];
  } catch (error) {
    console.error('Error fetching unassigned people:', error);
    throw error;
  }
};