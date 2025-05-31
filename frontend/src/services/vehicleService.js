import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (vehicleData) => {
  return {
    bienSoXe: vehicleData.bienSoXe || vehicleData.licensePlate,
    loaiXe: vehicleData.loaiXe || vehicleData.vehicleType,
    hangXe: vehicleData.hangXe || vehicleData.brand,
    mauXe: vehicleData.mauXe || vehicleData.model,
    namSanXuat: vehicleData.namSanXuat || vehicleData.year,
    mauSac: vehicleData.mauSac || vehicleData.color,
    hoKhauId: vehicleData.hoKhauId || vehicleData.householdId,
    ghiChu: vehicleData.ghiChu || vehicleData.notes
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    bienSoXe: backendData.bienSoXe,
    licensePlate: backendData.bienSoXe,
    loaiXe: backendData.loaiXe,
    vehicleType: backendData.loaiXe,
    hangXe: backendData.hangXe,
    brand: backendData.hangXe,
    mauXe: backendData.mauXe,
    model: backendData.mauXe,
    namSanXuat: backendData.namSanXuat,
    year: backendData.namSanXuat,
    mauSac: backendData.mauSac,
    color: backendData.mauSac,
    hoKhauId: backendData.hoKhauId,
    householdId: backendData.hoKhauId,
    ghiChu: backendData.ghiChu,
    notes: backendData.ghiChu,
    soHoKhau: backendData.soHoKhau,
    householdNumber: backendData.soHoKhau
  };
};

// Get all vehicles
export const getAllVehicles = async (filters = {}) => {
  try {
    const response = await api.get('/vehicles', { params: filters });
    
    if (Array.isArray(response.data)) {
      return response.data.map(vehicle => mapToFrontendFormat(vehicle));
    }
    return [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

// Get vehicles by household ID
export const getVehiclesByHousehold = async (householdId) => {
  try {
    const response = await api.get(`/vehicles/household/${householdId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(vehicle => mapToFrontendFormat(vehicle));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching vehicles for household ${householdId}:`, error);
    throw error;
  }
};

// Get a vehicle by ID
export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`/vehicles/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    throw error;
  }
};

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    const mappedData = mapToBackendFormat(vehicleData);
    const response = await api.post('/vehicles', mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

// Update a vehicle
export const updateVehicle = async (id, vehicleData) => {
  try {
    const mappedData = mapToBackendFormat(vehicleData);
    console.log('Updating vehicle with data:', mappedData);
    const response = await api.put(`/vehicles/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating vehicle with ID ${id}:`, error);
    throw error;
  }
};

// Delete a vehicle
export const deleteVehicle = async (id) => {
  try {
    await api.delete(`/vehicles/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    throw error;
  }
};

// Check if license plate is unique
export const checkLicensePlateUnique = async (licensePlate, excludeVehicleId = null) => {
  try {
    const vehicles = await getAllVehicles();
    
    const existingVehicle = vehicles.find(
      vehicle => vehicle.licensePlate === licensePlate && vehicle.id !== excludeVehicleId
    );
    
    return !existingVehicle;
  } catch (error) {
    console.error('Error checking license plate uniqueness:', error);
    throw error;
  }
};

// Search vehicles by license plate or brand
export const searchVehicles = async (searchTerm) => {
  try {
    const response = await api.get(`/vehicles/search`, { 
      params: { q: searchTerm } 
    });
    
    if (Array.isArray(response.data)) {
      return response.data.map(vehicle => mapToFrontendFormat(vehicle));
    }
    return [];
  } catch (error) {
    console.error(`Error searching vehicles with term ${searchTerm}:`, error);
    throw error;
  }
};

// Vehicle constants
export const VEHICLE_TYPES = {
  XE_MAY: 'Xe máy',
  O_TO: 'Ô tô',
  XE_DAP: 'Xe đạp',
  XE_DIEN: 'Xe điện'
};

export const MONTHLY_FEES = {
  XE_MAY: 70000,
  O_TO: 1200000,
  XE_DAP: 0,
  XE_DIEN: 50000
};

// Calculate monthly parking fee for vehicles
export const calculateParkingFee = (vehicles) => {
  if (!Array.isArray(vehicles)) return 0;
  
  return vehicles.reduce((total, vehicle) => {
    const vehicleType = vehicle.loaiXe || vehicle.vehicleType;
    return total + (MONTHLY_FEES[vehicleType] || 0);
  }, 0);
};