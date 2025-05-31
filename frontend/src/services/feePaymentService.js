import api from './api';
import { getVehiclesByHousehold, calculateParkingFee } from './vehicleService';
import { getUtilityBillsByHousehold, calculateUtilityCost } from './utilityService';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (paymentData) => {
  return {
    hoKhauId: paymentData.hoKhauId || paymentData.householdId,
    thang: paymentData.thang || paymentData.month,
    nam: paymentData.nam || paymentData.year,
    phiGuiXe: paymentData.phiGuiXe || paymentData.parkingFee,
    phiDichVu: paymentData.phiDichVu || paymentData.utilityFee,
    tongTien: paymentData.tongTien || paymentData.totalAmount,
    trangThaiThanhToan: paymentData.trangThaiThanhToan || paymentData.paymentStatus,
    ngayThanhToan: paymentData.ngayThanhToan || paymentData.paymentDate,
    phuongThucThanhToan: paymentData.phuongThucThanhToan || paymentData.paymentMethod,
    ghiChu: paymentData.ghiChu || paymentData.notes
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    hoKhauId: backendData.hoKhauId,
    householdId: backendData.hoKhauId,
    thang: backendData.thang,
    month: backendData.thang,
    nam: backendData.nam,
    year: backendData.nam,
    phiGuiXe: backendData.phiGuiXe,
    parkingFee: backendData.phiGuiXe,
    phiDichVu: backendData.phiDichVu,
    utilityFee: backendData.phiDichVu,
    tongTien: backendData.tongTien,
    totalAmount: backendData.tongTien,
    trangThaiThanhToan: backendData.trangThaiThanhToan,
    paymentStatus: backendData.trangThaiThanhToan,
    ngayThanhToan: backendData.ngayThanhToan,
    paymentDate: backendData.ngayThanhToan,
    phuongThucThanhToan: backendData.phuongThucThanhToan,
    paymentMethod: backendData.phuongThucThanhToan,
    ghiChu: backendData.ghiChu,
    notes: backendData.ghiChu,
    soHoKhau: backendData.soHoKhau,
    householdNumber: backendData.soHoKhau
  };
};

// Payment status constants
export const PAYMENT_STATUS = {
  CHUA_THANH_TOAN: 'Chưa thanh toán',
  DA_THANH_TOAN: 'Đã thanh toán',
  THANH_TOAN_MUON: 'Thanh toán muộn',
  HUY: 'Hủy'
};

export const PAYMENT_METHODS = {
  TIEN_MAT: 'Tiền mặt',
  CHUYEN_KHOAN: 'Chuyển khoản',
  THE_ATM: 'Thẻ ATM',
  VI_DIEN_TU: 'Ví điện tử'
};

// Calculate fees for a household
export const calculateHouseholdFees = async (householdId, month, year) => {
  try {
    // Get vehicles and calculate parking fee
    const vehicles = await getVehiclesByHousehold(householdId);
    const parkingFee = calculateParkingFee(vehicles);
    
    // Get utility bills and calculate utility fee
    const utilityBills = await getUtilityBillsByHousehold(householdId, month, year);
    const utilityFee = calculateUtilityCost(utilityBills);
    
    const totalAmount = parkingFee + utilityFee;
    
    return {
      householdId,
      month,
      year,
      parkingFee,
      utilityFee,
      totalAmount,
      vehicles,
      utilityBills,
      vehicleCount: vehicles.length
    };
  } catch (error) {
    console.error(`Error calculating fees for household ${householdId}:`, error);
    throw error;
  }
};

// Get all payments
export const getAllPayments = async (filters = {}) => {
  try {
    const response = await api.get('/payments', { params: filters });
    
    if (Array.isArray(response.data)) {
      return response.data.map(payment => mapToFrontendFormat(payment));
    }
    return [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Get payments by household ID
export const getPaymentsByHousehold = async (householdId) => {
  try {
    const response = await api.get(`/payments/household/${householdId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(payment => mapToFrontendFormat(payment));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching payments for household ${householdId}:`, error);
    throw error;
  }
};

// Get payment by ID
export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/payments/${id}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw error;
  }
};

// Create a new payment
export const createPayment = async (paymentData) => {
  try {
    const mappedData = mapToBackendFormat(paymentData);
    const response = await api.post('/payments', mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Update a payment
export const updatePayment = async (id, paymentData) => {
  try {
    const mappedData = mapToBackendFormat(paymentData);
    console.log('Updating payment with data:', mappedData);
    const response = await api.put(`/payments/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error);
    throw error;
  }
};

// Delete a payment
export const deletePayment = async (id) => {
  try {
    await api.delete(`/payments/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting payment with ID ${id}:`, error);
    throw error;
  }
};

// Process multiple payments
export const processPayments = async (paymentDataList) => {
  try {
    const results = [];
    
    for (const paymentData of paymentDataList) {
      const result = await createPayment(paymentData);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error processing payments:', error);
    throw error;
  }
};

// Get outstanding payments (unpaid)
export const getOutstandingPayments = async (month, year) => {
  try {
    const response = await api.get('/payments/outstanding', {
      params: { thang: month, nam: year }
    });
    
    if (Array.isArray(response.data)) {
      return response.data.map(payment => mapToFrontendFormat(payment));
    }
    return [];
  } catch (error) {
    console.error('Error fetching outstanding payments:', error);
    throw error;
  }
};

// Mark payment as paid
export const markPaymentAsPaid = async (id, paymentMethod = 'TIEN_MAT') => {
  try {
    const paymentData = {
      trangThaiThanhToan: 'DA_THANH_TOAN',
      ngayThanhToan: new Date().toISOString().split('T')[0],
      phuongThucThanhToan: paymentMethod
    };
    
    return await updatePayment(id, paymentData);
  } catch (error) {
    console.error(`Error marking payment ${id} as paid:`, error);
    throw error;
  }
};

// Format currency
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
