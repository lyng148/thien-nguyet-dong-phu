import api from './api';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (utilityData) => {
  return {
    loaiDichVu: utilityData.loaiDichVu || utilityData.serviceType,
    thang: utilityData.thang || utilityData.month,
    nam: utilityData.nam || utilityData.year,
    soTien: utilityData.soTien || utilityData.amount,
    tongTien: utilityData.soTien || utilityData.amount, // Đảm bảo cả hai trường đều có giá trị
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
    year: backendData.nam,    soTien: backendData.tongTien,
    amount: backendData.tongTien,
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

// Get utility bills by month and year
export const getUtilityBillsByMonthYear = async (month, year) => {
  try {
    const response = await api.get(`/utility-services/month/${month}/year/${year}`);
    return response.data.map(item => mapToFrontendFormat(item));
  } catch (error) {
    console.error(`Error fetching utility bills for month ${month} year ${year}:`, error);
    throw error;
  }
};


// Get all utility bills
export const getAllUtilityBills = async (filters = {}) => {
  try {
    const response = await api.get('/utility-services', { params: filters });
    return response.data.map(item => mapToFrontendFormat(item));
  } catch (error) {
    console.error('Error fetching utility bills:', error);
    throw error;
  }
};

// Get utility bills by household ID
export const getUtilityBillsByHousehold = async (householdId, month = null, year = null) => {
  try {
    let url = `/utility-services/household/${householdId}`;
    if (month && year) {
      url = `/utility-services/household/${householdId}/month/${month}/year/${year}`;
    }
    
    const response = await api.get(url);
    
    // Kiểm tra nếu không có dữ liệu, trả về mảng rỗng
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data.map(item => mapToFrontendFormat(item));
  } catch (error) {
    console.error(`Error fetching utility bills for household ${householdId}:`, error);
    // Trong trường hợp lỗi, trả về mảng rỗng thay vì ném ngoại lệ
    return [];
  }
};

// Get a utility bill by ID
export const getUtilityBillById = async (id) => {
  try {
    const response = await api.get(`/utility-services/${id}`);
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
    console.log("Data gửi đến server:", mappedData);
    console.log("Số tiền trong request:", mappedData.soTien, "tongTien:", mappedData.tongTien);
    const response = await api.post('/utility-services', mappedData);
    console.log("Response từ server:", response.data);
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
    console.log("Số tiền trong request:", mappedData.soTien, "tongTien:", mappedData.tongTien);
    const response = await api.put(`/utility-services/${id}`, mappedData);
    console.log("Response từ server:", response.data);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating utility bill with ID ${id}:`, error);
    throw error;
  }
};

// Delete a utility bill
export const deleteUtilityBill = async (id) => {
  try {
    await api.delete(`/utility-services/${id}`);
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