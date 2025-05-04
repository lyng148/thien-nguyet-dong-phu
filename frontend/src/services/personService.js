import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (personData) => {
  return {
    hoTen: personData.fullName,
    biDanh: personData.nickname || '',
    ngaySinh: personData.dateOfBirth,
    gioiTinh: personData.gender,
    noiSinh: personData.placeOfBirth,
    nguyenQuan: personData.placeOfOrigin,
    diaChiHienNay: personData.currentAddress,
    soCMT: personData.idCardNumber || '',
    ngayCap: personData.idCardIssueDate || null,
    noiCap: personData.idCardIssuePlace || '',
    danToc: personData.ethnicity || '',
    tonGiao: personData.religion || '',
    quocTich: personData.nationality || 'Việt Nam',
    ngheNghiep: personData.occupation || '',
    noiLamViec: personData.workPlace || '',
    trangThai: personData.status || 'Thường trú'
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    fullName: backendData.hoTen,
    nickname: backendData.biDanh,
    dateOfBirth: backendData.ngaySinh,
    gender: backendData.gioiTinh,
    placeOfBirth: backendData.noiSinh,
    placeOfOrigin: backendData.nguyenQuan,
    currentAddress: backendData.diaChiHienNay,
    idCardNumber: backendData.soCMT,
    idCardIssueDate: backendData.ngayCap,
    idCardIssuePlace: backendData.noiCap,
    ethnicity: backendData.danToc,
    religion: backendData.tonGiao,
    nationality: backendData.quocTich,
    occupation: backendData.ngheNghiep,
    workPlace: backendData.noiLamViec,
    status: backendData.trangThai,
    householdId: backendData.hoKhauId,
    relationshipWithOwner: backendData.quanHeVoiChuHo
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