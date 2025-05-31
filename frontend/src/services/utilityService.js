import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (utilityData) => {
  return {
    loaiDichVu: utilityData.loaiDichVu || utilityData.serviceType,
    thang: utilityData.thang || utilityData.month,
    nam: utilityData.nam || utilityData.year,
    soTien: utilityData.soTien || utilityData.amount,
    donViTinh: utilityData.donViTinh || utilityData.unit,
    chiSoMoi: utilityData.chiSoMoi || utilityData.newReading,
    chiSoCu: utilityData.chiSoCu || utilityData.oldReading,
    hoKhauId: utilityData.hoKhauId || utilityData.householdId,
    ghiChu: utilityData.ghiChu || utilityData.notes
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    loaiDichVu: backendData.loaiDichVu,
    serviceType: backendData.loaiDichVu,
    thang: backendData.thang,
    month: backendData.thang,
    nam: backendData.nam,
    year: backendData.nam,
    soTien: backendData.soTien,
    amount: backendData.soTien,
    donViTinh: backendData.donViTinh,
    unit: backendData.donViTinh,
    chiSoMoi: backendData.chiSoMoi,
    newReading: backendData.chiSoMoi,
    chiSoCu: backendData.chiSoCu,
    oldReading: backendData.chiSoCu,
    hoKhauId: backendData.hoKhauId,
    householdId: backendData.hoKhauId,
    ghiChu: backendData.ghiChu,
    notes: backendData.ghiChu,
    soHoKhau: backendData.soHoKhau,
    householdNumber: backendData.soHoKhau
  };
};

// Service types and their configurations
export const SERVICE_TYPES = {
  DIEN: 'Điện',
  NUOC: 'Nước',
  INTERNET: 'Internet',
  VE_SINH: 'Vệ sinh',
  BAO_VE: 'Bảo vệ'
};

// Generate random utility bills (since no API exists yet)
export const generateRandomUtilityBills = (householdId, month, year) => {
  const bills = [];
  
  // Electric bill
  const electricUsage = Math.floor(Math.random() * 200) + 100; // 100-300 kWh
  bills.push({
    id: Date.now() + Math.random(),
    loaiDichVu: 'DIEN',
    serviceType: 'DIEN',
    thang: month,
    month: month,
    nam: year,
    year: year,
    chiSoCu: Math.floor(Math.random() * 1000) + 500,
    oldReading: Math.floor(Math.random() * 1000) + 500,
    chiSoMoi: 0,
    newReading: 0,
    soTien: electricUsage * (Math.floor(Math.random() * 1000) + 2500), // 2500-3500 per kWh
    amount: electricUsage * (Math.floor(Math.random() * 1000) + 2500),
    donViTinh: 'kWh',
    unit: 'kWh',
    hoKhauId: householdId,
    householdId: householdId,
    ghiChu: 'Tiền điện tháng ' + month + '/' + year,
    notes: 'Tiền điện tháng ' + month + '/' + year
  });
  
  // Set newReading
  bills[0].chiSoMoi = bills[0].chiSoCu + electricUsage;
  bills[0].newReading = bills[0].chiSoCu + electricUsage;

  // Water bill
  const waterUsage = Math.floor(Math.random() * 20) + 10; // 10-30 m3
  bills.push({
    id: Date.now() + Math.random() + 1,
    loaiDichVu: 'NUOC',
    serviceType: 'NUOC',
    thang: month,
    month: month,
    nam: year,
    year: year,
    chiSoCu: Math.floor(Math.random() * 100) + 50,
    oldReading: Math.floor(Math.random() * 100) + 50,
    chiSoMoi: 0,
    newReading: 0,
    soTien: waterUsage * (Math.floor(Math.random() * 5000) + 15000), // 15000-20000 per m3
    amount: waterUsage * (Math.floor(Math.random() * 5000) + 15000),
    donViTinh: 'm3',
    unit: 'm3',
    hoKhauId: householdId,
    householdId: householdId,
    ghiChu: 'Tiền nước tháng ' + month + '/' + year,
    notes: 'Tiền nước tháng ' + month + '/' + year
  });
  
  // Set newReading
  bills[1].chiSoMoi = bills[1].chiSoCu + waterUsage;
  bills[1].newReading = bills[1].chiSoCu + waterUsage;

  // Internet bill
  bills.push({
    id: Date.now() + Math.random() + 2,
    loaiDichVu: 'INTERNET',
    serviceType: 'INTERNET',
    thang: month,
    month: month,
    nam: year,
    year: year,
    chiSoCu: 0,
    oldReading: 0,
    chiSoMoi: 0,
    newReading: 0,
    soTien: Math.floor(Math.random() * 200000) + 300000, // 300k-500k
    amount: Math.floor(Math.random() * 200000) + 300000,
    donViTinh: 'Gói',
    unit: 'Gói',
    hoKhauId: householdId,
    householdId: householdId,
    ghiChu: 'Internet tháng ' + month + '/' + year,
    notes: 'Internet tháng ' + month + '/' + year
  });

  return bills;
};

// Get all utility bills
export const getAllUtilityBills = async (filters = {}) => {
  try {
    // Since no API exists, return empty array or mock data
    console.log('No utility API available, using mock data');
    return [];
  } catch (error) {
    console.error('Error fetching utility bills:', error);
    throw error;
  }
};

// Get utility bills by household ID
export const getUtilityBillsByHousehold = async (householdId, month = null, year = null) => {
  try {
    // Since no API exists, generate random bills
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    return generateRandomUtilityBills(householdId, currentMonth, currentYear);
  } catch (error) {
    console.error(`Error fetching utility bills for household ${householdId}:`, error);
    throw error;
  }
};

// Get a utility bill by ID
export const getUtilityBillById = async (id) => {
  try {
    const response = await api.get(`/utilities/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching utility bill with ID ${id}:`, error);
    throw error;
  }
};

// Create a new utility bill
export const createUtilityBill = async (utilityData) => {
  try {
    const mappedData = mapToBackendFormat(utilityData);
    const response = await api.post('/utilities', mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating utility bill:', error);
    throw error;
  }
};

// Update a utility bill
export const updateUtilityBill = async (id, utilityData) => {
  try {
    const mappedData = mapToBackendFormat(utilityData);
    console.log('Updating utility bill with data:', mappedData);
    const response = await api.put(`/utilities/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating utility bill with ID ${id}:`, error);
    throw error;
  }
};

// Delete a utility bill
export const deleteUtilityBill = async (id) => {
  try {
    await api.delete(`/utilities/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting utility bill with ID ${id}:`, error);
    throw error;
  }
};

// Calculate total utility cost for a household
export const calculateUtilityCost = (utilityBills) => {
  if (!Array.isArray(utilityBills)) return 0;
  
  return utilityBills.reduce((total, bill) => {
    return total + (bill.soTien || bill.amount || 0);
  }, 0);
};

// Get utility bills for multiple households (for payment processing)
export const getUtilityBillsForPayment = async (householdIds, month, year) => {
  try {
    const allBills = [];
    
    for (const householdId of householdIds) {
      const bills = await getUtilityBillsByHousehold(householdId, month, year);
      allBills.push(...bills);
    }
    
    return allBills;
  } catch (error) {
    console.error('Error fetching utility bills for payment:', error);
    throw error;
  }
};