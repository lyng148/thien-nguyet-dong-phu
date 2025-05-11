import api from './api';
import { API_BASE_URL } from '../config/constants';

const API_URL = `${API_BASE_URL}/payments`;

// Helper function to map frontend data to backend Vietnamese field names
const mapToBackendFormat = (paymentData) => {
  return {
    hoKhau: { id: paymentData.householdId },
    khoanThu: { id: paymentData.feeId },
    ngayNop: paymentData.paymentDate,
    tongTien: paymentData.amount,
    soTien: paymentData.amountPaid || paymentData.amount,
    daXacNhan: paymentData.verified || false,
    ghiChu: paymentData.notes || '',
    nguoiNop: paymentData.payerName || ''
  };
};

// Helper function to map backend data to frontend field names
const mapToFrontendFormat = (backendData) => {
  if (!backendData) return null;
  
  // Kiểm tra xem hoKhau và khoanThu có tồn tại không
  const hoKhau = backendData.hoKhau || {};
  
  // Handle the case where khoanThu is just a number (the ID) instead of an object
  let khoanThu = {};
  if (backendData.khoanThu !== null && backendData.khoanThu !== undefined) {
    if (typeof backendData.khoanThu === 'object') {
      khoanThu = backendData.khoanThu;
    } else {
      // If khoanThu is just the ID (a number), create a proper object
      khoanThu = { id: backendData.khoanThu };
    }
  }
  
  // Explicitly check for khoan_thu_id in raw format (if khoanThu object is missing)
  const rawFeeId = backendData.khoan_thu_id || backendData.khoanThuId;
  if (rawFeeId && (!khoanThu.id)) {
    khoanThu.id = rawFeeId;
  }
  
  // Debug the household data
  console.log('Processing payment:', backendData.id, 'Household data:', JSON.stringify(hoKhau));
  
  // Extract household ID safely, ensuring we get a value even if the structure is unexpected
  const householdId = hoKhau.id || backendData.hoKhauId || backendData.ho_khau_id || null;
  
  // Tạo đối tượng kết quả, cẩn thận xử lý các trường có thể null/undefined
  const result = {
    id: backendData.id,
    // Household data - try different possible field names
    householdId: householdId,
    householdOwnerName: hoKhau.chuHo || hoKhau.ownerName || '',
    householdAddress: hoKhau.diaChi || hoKhau.address || '',
    soHoKhau: hoKhau.soHoKhau || '',
    // Fee data - try different possible field names - Always ensure we have the fee information
    feeId: khoanThu.id || backendData.khoanThuId || backendData.khoan_thu_id || rawFeeId || null,
    feeName: khoanThu.tenKhoanThu || khoanThu.ten || khoanThu.name || '',
    feeAmount: khoanThu.soTien || khoanThu.amount || 0,
    // Payment data
    paymentDate: backendData.ngayNop || backendData.ngay_nop,
    payerName: backendData.nguoiNop || backendData.nguoi_nop || '',
    amount: backendData.tongTien || backendData.tong_tien || 0,
    amountPaid: backendData.soTien || backendData.so_tien || 0,
    verified: backendData.daXacNhan || backendData.da_xac_nhan || false,
    notes: backendData.ghiChu || backendData.ghi_chu || ''
  };
  
  if (householdId && (!result.householdOwnerName || !result.householdAddress)) {
    console.warn(`Payment ${backendData.id} has household ID ${householdId} but missing household details`);
  }
  
  return result;
};

// Get all payments with optional filters
export const getAllPayments = async (filters = {}) => {
  try {
    const response = await api.get('/payments', { params: filters });
    
    // Map backend data to frontend format
    if (Array.isArray(response.data)) {
      // First create a map of household IDs to household objects to handle JSON reference serialization
      const householdMap = {};
      
      // First pass: extract all household data from payments that have complete household objects
      response.data.forEach(payment => {
        if (payment.hoKhau && typeof payment.hoKhau === 'object' && payment.hoKhau.id) {
          // Store the complete household object for later use
          householdMap[payment.hoKhau.id] = payment.hoKhau;
        }
      });
      
      console.log("Extracted household map:", householdMap);
      
      // Second pass: process all payments, replacing household IDs with full objects when needed
      const mappedPayments = response.data.map(payment => {
        // If the hoKhau is just an ID (number), replace it with the full object from our map
        if (payment.hoKhau && typeof payment.hoKhau === 'number' && householdMap[payment.hoKhau]) {
          console.log(`Replacing household ID ${payment.hoKhau} with full object for payment ID ${payment.id}`);
          payment.hoKhau = householdMap[payment.hoKhau];
        }
        
        return mapToFrontendFormat(payment);
      });
      
      // Create a lookup table for fee IDs to fee names from the available data
      const feeIdToNameMap = {};
      mappedPayments.forEach(payment => {
        if (payment.feeId && payment.feeName) {
          feeIdToNameMap[payment.feeId] = payment.feeName;
        }
      });
      
      // Create a lookup table for household IDs to household information
      const householdInfoMap = {};
      mappedPayments.forEach(payment => {
        if (payment.householdId && payment.householdOwnerName) {
          householdInfoMap[payment.householdId] = {
            ownerName: payment.householdOwnerName,
            address: payment.householdAddress,
            soHoKhau: payment.soHoKhau
          };
        }
      });
      
      // Fill in missing fee names and household information using our lookup tables
      const processedPayments = mappedPayments.map(payment => {
        let updatedPayment = {...payment};
        
        // Fill in missing fee names
        if (payment.feeId && !payment.feeName && feeIdToNameMap[payment.feeId]) {
          updatedPayment.feeName = feeIdToNameMap[payment.feeId];
        }
        
        // Fill in missing household information
        if (payment.householdId && (!payment.householdOwnerName || !payment.householdAddress) && 
            householdInfoMap[payment.householdId]) {
          updatedPayment.householdOwnerName = householdInfoMap[payment.householdId].ownerName;
          updatedPayment.householdAddress = householdInfoMap[payment.householdId].address;
          updatedPayment.soHoKhau = householdInfoMap[payment.householdId].soHoKhau;
        }
        
        return updatedPayment;
      });
      
      return processedPayments;
    }
    return [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Get a payment by ID
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
    const payload = mapToBackendFormat(paymentData);
    const response = await api.post('/payments', payload);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Update an existing payment
export const updatePayment = async (id, paymentData) => {
  try {
    const payload = mapToBackendFormat(paymentData);
    
    console.log(`Updating payment ${id} with payload:`, JSON.stringify(payload));
    const response = await api.put(`/payments/${id}`, payload);
    console.log('Payment updated successfully:', response.data);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error);
    console.error('Update payload that caused error:', JSON.stringify(paymentData));
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// Toggle payment verification
export const togglePaymentVerification = async (id, verified) => {
  try {
    if (verified) {
      await api.patch(`/payments/${id}/verify`);
    } else {
      await api.patch(`/payments/${id}/unverify`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Error toggling verification for payment with ID ${id}:`, error);
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

export const getPaymentsByHousehold = async (householdId) => {
  try {
    const response = await api.get(`/payments/household/${householdId}`);
    return Array.isArray(response.data) 
      ? response.data.map(payment => mapToFrontendFormat(payment))
      : [];
  } catch (error) {
    console.error(`Get payments by household ${householdId} error:`, error);
    throw error;
  }
};

export const getPaymentsByFee = async (feeId) => {
  try {
    const response = await api.get(`/payments/fee/${feeId}`);
    return Array.isArray(response.data) 
      ? response.data.map(payment => mapToFrontendFormat(payment))
      : [];
  } catch (error) {
    console.error(`Get payments by fee ${feeId} error:`, error);
    throw error;
  }
};

export const getPaymentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/payments/date-range`, {
      params: { startDate, endDate }
    });
    return Array.isArray(response.data) 
      ? response.data.map(payment => mapToFrontendFormat(payment))
      : [];
  } catch (error) {
    console.error('Get payments by date range error:', error);
    throw error;
  }
};

export const getUnverifiedPayments = async () => {
  try {
    const response = await api.get(`/payments/unverified`);
    return Array.isArray(response.data) 
      ? response.data.map(payment => mapToFrontendFormat(payment))
      : [];
  } catch (error) {
    console.error('Get unverified payments error:', error);
    throw error;
  }
};

export const getPaymentByHouseholdAndFee = async (householdId, feeId) => {
  try {
    const response = await api.get(`/payments/household/${householdId}/fee/${feeId}`);
    return mapToFrontendFormat(response.data);
  } catch (error) {
    // Nếu lỗi là 404 (Not Found), có nghĩa là không tìm thấy khoản phí nào
    // Trong trường hợp này, chúng ta nên trả về null thay vì ném ra lỗi
    if (error.response && error.response.status === 404) {
      console.log(`No payment found for household ${householdId} and fee ${feeId}`);
      return null;
    }
    console.error(`Get payment by household ${householdId} and fee ${feeId} error:`, error);
    throw error;
  }
};

export const verifyPayment = async (id) => {
  try {
    await api.patch(`/payments/${id}/verify`);
    return true;
  } catch (error) {
    console.error(`Verify payment ${id} error:`, error);
    throw error;
  }
};

export const unverifyPayment = async (id) => {
  try {
    await api.patch(`/payments/${id}/unverify`);
    return true;
  } catch (error) {
    console.error(`Unverify payment ${id} error:`, error);
    throw error;
  }
};

// Statistics 
export const getTotalPaymentsByHousehold = async (householdId) => {
  try {
    const response = await api.get(`/payments/statistics/household/${householdId}/total`);
    return response.data;
  } catch (error) {
    console.error(`Get total payments by household ${householdId} error:`, error);
    throw error;
  }
};

export const getTotalPaymentsByFee = async (feeId) => {
  try {
    const response = await api.get(`/payments/statistics/fee/${feeId}/total`);
    return response.data;
  } catch (error) {
    console.error(`Get total payments by fee ${feeId} error:`, error);
    throw error;
  }
};

export const getTotalPaymentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/payments/statistics/date-range/total`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Get total payments by date range error:', error);
    throw error;
  }
};