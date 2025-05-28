import api from './api';
import { getAllHouseholds } from './householdService';
import { getAllFees } from './feeService';
import { getAllPayments } from './paymentService';
import { getAllPeople } from './personService';

// Get dashboard summary statistics
export const getDashboardSummary = async () => {
  try {
    // Get all the data needed for the dashboard in parallel
    const [households, fees, payments] = await Promise.all([
      getAllHouseholds({ showAll: false }),  // Only active households
      getAllFees({ showAll: false }),        // Only active fees
      getAllPayments()
    ]);
    
    // Calculate total collected amount
    const totalCollected = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    
    // Calculate collection rate (assuming each household should pay each fee)
    const potentialPayments = households.length * fees.length;
    const collectionRate = potentialPayments > 0 
      ? Math.round((payments.length / potentialPayments) * 100) 
      : 0;
    
    // Calculate the number of verified payments
    const verifiedPayments = payments.filter(payment => payment.verified).length;
    const verificationRate = payments.length > 0 
      ? Math.round((verifiedPayments / payments.length) * 100) 
      : 0;
    
    return {
      totalHouseholds: households.length,
      totalFees: fees.length,
      totalPayments: payments.length,
      totalCollected,
      collectionRate,
      verifiedPayments,
      verificationRate
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

// Get recent payments for dashboard display
export const getRecentPayments = async (limit = 5) => {
  try {
    const payments = await getAllPayments();
    
    // Sort payments by date (most recent first) and take the requested number
    return payments
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    throw error;
  }
};

// Get monthly payment data for charts
export const getMonthlyPaymentData = async (months = 6) => {
  try {
    const payments = await getAllPayments();
    
    // Get the date range - from X months ago until now
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months - 1)); // -5 for 6 months including current
    
    // Create array of month names for the period
    const monthLabels = [];
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      monthLabels.push(date.toLocaleString('default', { month: 'short' }));
    }
    
    // Initialize data with zeros
    const monthlyData = monthLabels.map(month => ({
      name: month,
      amount: 0
    }));
    
    // Populate with actual payment data
    payments.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      
      // Check if payment is within our date range
      if (paymentDate >= startDate && paymentDate <= endDate) {
        const monthIndex = Math.floor((paymentDate - startDate) / (30 * 24 * 60 * 60 * 1000));
        if (monthIndex >= 0 && monthIndex < months) {
          monthlyData[monthIndex].amount += (payment.amountPaid || 0);
        }
      }
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error fetching monthly payment data:', error);
    throw error;
  }
};

// Get accountant-specific dashboard summary
export const getAccountantDashboardSummary = async () => {
  try {
    const [payments, fees] = await Promise.all([
      getAllPayments(),
      getAllFees()
    ]);
    
    // Calculate verification statistics
    const verifiedPayments = payments.filter(payment => payment.verified).length;
    const unverifiedPayments = payments.filter(payment => !payment.verified).length;
    const verificationRate = payments.length > 0 
      ? Math.round((verifiedPayments / payments.length) * 100) 
      : 0;
    
    // Separate fee types
    const mandatoryFees = fees.filter(f => f.feeType === 'MANDATORY' || f.feeType === 'Mandatory');
    const voluntaryFees = fees.filter(f => f.feeType === 'VOLUNTARY' || f.feeType === 'Optional' || f.feeType === 'Voluntary');
    
    // Calculate collections by fee type
    const mandatoryPayments = payments.filter(p => {
      const fee = fees.find(f => f.id === p.feeId);
      return fee && (fee.feeType === 'MANDATORY' || fee.feeType === 'Mandatory');
    });
    const voluntaryPayments = payments.filter(p => {
      const fee = fees.find(f => f.id === p.feeId);
      return fee && (fee.feeType === 'VOLUNTARY' || fee.feeType === 'Optional' || fee.feeType === 'Voluntary');
    });
    
    const totalMandatoryCollected = mandatoryPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalVoluntaryCollected = voluntaryPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalCollected = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    
    return {
      totalFees: fees.length,
      totalPayments: payments.length,
      totalCollected,
      totalMandatoryCollected,
      totalVoluntaryCollected,
      verifiedPayments,
      unverifiedPayments,
      verificationRate,
      mandatoryFees: mandatoryFees.length,
      voluntaryFees: voluntaryFees.length
    };
  } catch (error) {
    console.error('Error fetching accountant dashboard summary:', error);
    throw error;
  }
};

// Get tổ trưởng-specific dashboard summary
export const getToTruongDashboardSummary = async () => {
  try {
    const [households, people] = await Promise.all([
      getAllHouseholds({ showAll: true }),  // Get all households for tổ trưởng
      getAllPeople()
    ]);
    
    // Calculate statistics specific to tổ trưởng role
    const activeHouseholds = households.filter(h => h.active).length;
    const inactiveHouseholds = households.filter(h => !h.active).length;
    const totalPeople = people.length;
    
    // Calculate household member distribution
    const householdMemberData = [
      { name: '1 người', count: households.filter(h => h.numMembers === 1).length },
      { name: '2-3 người', count: households.filter(h => h.numMembers >= 2 && h.numMembers <= 3).length },
      { name: '4-5 người', count: households.filter(h => h.numMembers >= 4 && h.numMembers <= 5).length },
      { name: '6+ người', count: households.filter(h => h.numMembers >= 6).length }
    ];
    
    // Calculate average people per household
    const averagePeoplePerHousehold = households.length > 0 
      ? Math.round((totalPeople / households.length) * 100) / 100 
      : 0;
    
    // Calculate recent growth (dummy data - would need actual date-based calculation)
    const householdGrowth = 5.2; // This would be calculated based on actual data
    
    return {
      totalHouseholds: households.length,
      activeHouseholds,
      inactiveHouseholds,
      totalPeople,
      averagePeoplePerHousehold,
      householdGrowth,
      householdMemberData,
      // Add some additional useful stats for tổ trưởng
      householdsWithPhoneNumber: households.filter(h => h.phoneNumber).length,
      householdsWithEmail: households.filter(h => h.email).length
    };
  } catch (error) {
    console.error('Error fetching tổ trưởng dashboard summary:', error);
    throw error;
  }
};

// Get recent households for tổ trưởng dashboard
export const getRecentHouseholds = async (limit = 5) => {
  try {
    const households = await getAllHouseholds({ showAll: true });
    
    // Sort households by creation date (most recent first) and take the requested number
    // Note: This assumes households have a createdAt field, adjust if different
    return households
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.ngayLamHoKhau || 0);
        const dateB = new Date(b.createdAt || b.ngayLamHoKhau || 0);
        return dateB - dateA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent households:', error);
    throw error;
  }
};

// ...existing code...