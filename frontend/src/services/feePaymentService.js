import api from './api';
import { getVehiclesByHousehold, calculateParkingFee } from './vehicleService';
import { getUtilityBillsByHousehold, calculateUtilityCost } from './utilityService';

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (paymentData) => {
  // Bỏ việc xác định khoanThuId vì không còn phụ thuộc vào utilityServiceId
    // Tính tổng tiền từ phiGuiXe và phiDichVu nếu totalAmount là 0
  const phiGuiXe = paymentData.phiGuiXe || paymentData.parkingFee || 0;
  const phiDichVu = paymentData.phiDichVu || paymentData.utilityFee || 0;
  let tongTien = paymentData.tongTien || paymentData.totalAmount;
  
  // Nếu tongTien không được cung cấp hoặc là 0, tính từ phiGuiXe và phiDichVu
  if (!tongTien || tongTien <= 0) {
    tongTien = phiGuiXe + phiDichVu;
  }
  
  return {
    // Không còn cần truyền hoKhau dưới dạng object, chỉ cần id
    hoKhauId: paymentData.hoKhauId || paymentData.householdId,
    
    // utilityServiceId không còn bắt buộc, nhưng vẫn có thể truyền nếu có
    utilityServiceId: paymentData.utilityServiceId,
    
    thang: paymentData.thang || paymentData.month,
    nam: paymentData.nam || paymentData.year,
    phiGuiXe: phiGuiXe,
    phiDichVu: phiDichVu,
    soTienThanhToan: tongTien,
    ngayThanhToan: paymentData.ngayThanhToan || paymentData.paymentDate || new Date().toISOString().split('T')[0],
    phuongThucThanhToan: paymentData.phuongThucThanhToan || paymentData.paymentMethod || 'TIEN_MAT',
    trangThai: paymentData.trangThai || 'DA_THANH_TOAN', // Đảm bảo trạng thái được set
    ghiChu: paymentData.ghiChu || paymentData.notes || ''
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
    return {
    id: backendData.id,
    hoKhauId: backendData.hoKhauId,
    householdId: backendData.hoKhauId,
    utilityServiceId: backendData.utilityServiceId,
    thang: backendData.thang,
    month: backendData.thang,
    nam: backendData.nam,
    year: backendData.nam,
    phiGuiXe: backendData.phiGuiXe || 0,
    parkingFee: backendData.phiGuiXe || 0,
    phiDichVu: backendData.phiDichVu || 0,
    utilityFee: backendData.phiDichVu || 0,
    tongTien: backendData.soTienThanhToan || 0,
    totalAmount: backendData.soTienThanhToan || 0,
    trangThai: backendData.trangThai,
    paymentStatus: backendData.trangThai,
    ngayThanhToan: backendData.ngayThanhToan,
    paymentDate: backendData.ngayThanhToan,
    phuongThucThanhToan: backendData.phuongThucThanhToan,
    paymentMethod: backendData.phuongThucThanhToan,
    ghiChu: backendData.ghiChu,
    notes: backendData.ghiChu,
    soHoKhau: backendData.soHoKhau,
    householdNumber: backendData.soHoKhau,
    chuHo: backendData.chuHo,
    ownerName: backendData.chuHo,
    maGiaoDich: backendData.maGiaoDich,
    transactionCode: backendData.maGiaoDich
  };
};

// Payment status constants
export const PAYMENT_STATUS = {
  CHUA_THANH_TOAN: 'Chưa thanh toán',
  THANH_CONG: 'Đã thanh toán',
  DA_THANH_TOAN: 'Đã thanh toán',
  THANH_TOAN_MUON: 'Thanh toán muộn',
  HUY_BO: 'Hủy',
  HUY: 'Hủy'
};

export const PAYMENT_METHODS = {
  TIEN_MAT: 'Tiền mặt',
  CHUYEN_KHOAN: 'Chuyển khoản',
  THE_ATM: 'Thẻ ATM',
  VI_DIEN_TU: 'Ví điện tử'
};

// Check if a payment exists for a specific household, month, and year
export const checkPaymentExists = async (householdId, month, year) => {
  try {
    console.log(`Checking payment for household ${householdId}, month ${month}, year ${year}`);
    
    // Sử dụng endpoint chính xác để lấy thanh toán theo hộ gia đình, tháng và năm
    const response = await api.get(`/utility-payments/household/${householdId}/month/${month}/year/${year}`);
    
    console.log(`Raw response for household ${householdId}:`, response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const payments = response.data.map(payment => mapToFrontendFormat(payment));
      console.log(`Formatted payments for household ${householdId}:`, payments);
      
      // Check if any payment has a status of paid ("DA_THANH_TOAN" or "THANH_CONG")
      const isPaid = payments.some(payment => {
        console.log(`Payment ${payment.id} status: ${payment.trangThai}`);
        return payment.trangThai === 'DA_THANH_TOAN' || 
               payment.trangThai === 'THANH_CONG';
      });
      
      console.log(`Household ${householdId} payment status: ${isPaid ? 'PAID' : 'UNPAID'}`);
      return isPaid;
    }
    
    console.log(`No payments found for household ${householdId}`);
    return false;
  } catch (error) {
    console.error(`Error checking payment existence for household ${householdId}:`, error);
    return false;
  }
};

// Alternative method using the new function (more reliable)
export const checkPaymentExistsAlternative = async (householdId, month, year) => {
  try {
    const payments = await getPaymentsByHouseholdAndMonth(householdId, month, year);
    
    if (payments && payments.length > 0) {
      // Check if any payment has a status of paid
      const isPaid = payments.some(payment => 
        payment.trangThai === 'DA_THANH_TOAN' || 
        payment.trangThai === 'THANH_CONG'
      );
      
      console.log(`Alternative check - Household ${householdId} payment status: ${isPaid ? 'PAID' : 'UNPAID'}`);
      return isPaid;
    }
    
    return false;
  } catch (error) {
    console.error(`Error in alternative payment check for household ${householdId}:`, error);
    return false;
  }
};

// Calculate fees for a household
export const calculateHouseholdFees = async (householdId, month, year) => {
  try {
    // Get vehicles and calculate parking fee
    const vehicles = await getVehiclesByHousehold(householdId) || [];
    const parkingFee = calculateParkingFee(vehicles);
    
    // Get utility bills and calculate utility fee
    const utilityBills = await getUtilityBillsByHousehold(householdId, month, year) || [];
    const utilityFee = calculateUtilityCost(utilityBills);
    
    // Đảm bảo các giá trị là số lớn hơn hoặc bằng 0
    const safeParking = Math.max(0, parkingFee || 0);
    const safeUtility = Math.max(0, utilityFee || 0);
    const totalAmount = safeParking + safeUtility;
      // Kiểm tra xem hộ gia đình đã thanh toán cho tháng này chưa
    const isPaid = await checkPaymentExistsAlternative(householdId, month, year);
    const paymentStatus = isPaid ? 'DA_THANH_TOAN' : 'CHUA_THANH_TOAN';
    
    return {
      householdId,
      month,
      year,
      parkingFee: safeParking,
      utilityFee: safeUtility,
      totalAmount,
      vehicles: vehicles || [],
      utilityBills: utilityBills || [],
      vehicleCount: (vehicles || []).length,
      paymentStatus: paymentStatus,
      isPaid: isPaid
    };
  } catch (error) {
    console.error(`Error calculating fees for household ${householdId}:`, error);
    // Trả về dữ liệu an toàn thay vì throw lỗi
    return {
      householdId,
      month, 
      year,
      parkingFee: 0,
      utilityFee: 0,
      totalAmount: 0,
      vehicles: [],
      utilityBills: [],
      vehicleCount: 0,
      paymentStatus: 'CHUA_THANH_TOAN',
      isPaid: false
    };
  }
};

// Get all payments
export const getAllPayments = async (filters = {}) => {
  try {
    const response = await api.get('/utility-payments', { params: filters });
    
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
    const response = await api.get(`/utility-payments/household/${householdId}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(payment => mapToFrontendFormat(payment));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching payments for household ${householdId}:`, error);
    throw error;
  }
};

// Get payments by household ID, month and year
export const getPaymentsByHouseholdAndMonth = async (householdId, month, year) => {
  try {
    const response = await api.get(`/utility-payments/household/${householdId}/month/${month}/year/${year}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(payment => mapToFrontendFormat(payment));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching payments for household ${householdId}, month ${month}, year ${year}:`, error);
    throw error;
  }
};

// Get payment by ID
export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/utility-payments/${id}`);
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
    
    // Đảm bảo trạng thái thanh toán được set đúng
    if (!mappedData.trangThai) {
      mappedData.trangThai = 'DA_THANH_TOAN';
    }
    
    console.log('Creating payment with data:', mappedData);
    
    // Sử dụng endpoint utility-payments thay vì payments để phù hợp với backend mới
    const response = await api.post('/utility-payments', mappedData);
    
    console.log('Payment created successfully:', response.data);
    
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
    const response = await api.put(`/utility-payments/${id}`, mappedData);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error);
    throw error;
  }
};

// Delete a payment
export const deletePayment = async (id) => {
  try {
    await api.delete(`/utility-payments/${id}`);
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
    const response = await api.get('/utility-payments/outstanding', {
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
      trangThai: 'THANH_CONG',
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

// Debug function to test payment checking
export const debugPaymentCheck = async (householdId, month, year) => {
  console.log('=== DEBUG PAYMENT CHECK ===');
  console.log(`Testing household ${householdId}, month ${month}, year ${year}`);
  
  try {
    // Test original method
    console.log('--- Testing original checkPaymentExists ---');
    const result1 = await checkPaymentExists(householdId, month, year);
    console.log('Original result:', result1);
    
    // Test alternative method
    console.log('--- Testing alternative checkPaymentExistsAlternative ---');
    const result2 = await checkPaymentExistsAlternative(householdId, month, year);
    console.log('Alternative result:', result2);
    
    // Test direct API call
    console.log('--- Testing direct API call ---');
    const response = await api.get(`/utility-payments/household/${householdId}/month/${month}/year/${year}`);
    console.log('Direct API response:', response.data);
    
    return {
      original: result1,
      alternative: result2,
      directAPI: response.data
    };
  } catch (error) {
    console.error('Debug error:', error);
    return { error: error.message };
  }
};

// Generate summary report for fee payments
export const generatePaymentSummary = async (month, year) => {
  try {
    // Get all households
    const response = await api.get('/households');
    const households = response.data;
    
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalHouseholds = households.length;
    let paidHouseholds = 0;
    let unpaidHouseholds = 0;
    
    // For each household, check payment status
    const paymentData = [];
    for (const household of households) {
      const isPaid = await checkPaymentExists(household.id, month, year);
      const fees = await calculateHouseholdFees(household.id, month, year);
      
      paymentData.push({
        householdId: household.id,
        householdNumber: household.householdNumber,
        ownerName: household.ownerName,
        isPaid,
        totalAmount: fees.totalAmount,
        parkingFee: fees.parkingFee,
        utilityFee: fees.utilityFee
      });
      
      if (isPaid) {
        totalCollected += fees.totalAmount;
        paidHouseholds++;
      } else {
        totalOutstanding += fees.totalAmount;
        unpaidHouseholds++;
      }
    }
    
    return {
      month,
      year,
      totalCollected,
      totalOutstanding,
      totalHouseholds,
      paidHouseholds,
      unpaidHouseholds,
      paidPercentage: totalHouseholds > 0 ? (paidHouseholds / totalHouseholds * 100) : 0,
      paymentData
    };
  } catch (error) {
    console.error('Error generating payment summary:', error);
    throw error;
  }
};
