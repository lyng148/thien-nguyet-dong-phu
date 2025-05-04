import api from './api';
import { getAllHouseholds } from './householdService';
import { getAllFees } from './feeService';
import { getAllPayments } from './paymentService';

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
    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
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
          monthlyData[monthIndex].amount += payment.amount;
        }
      }
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error fetching monthly payment data:', error);
    throw error;
  }
}; 