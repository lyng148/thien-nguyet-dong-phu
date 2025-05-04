import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';
import { 
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as VerifiedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import PageHeader from '../common/PageHeader';
import DashboardCard from './DashboardCard';
import { getDashboardSummary, getRecentPayments, getMonthlyPaymentData } from '../../services/dashboardService';
import { isAdmin } from '../../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const admin = isAdmin();
  
  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHouseholds: 0,
    totalFees: 0,
    totalPayments: 0,
    totalCollected: 0,
    collectionRate: 0,
    verifiedPayments: 0,
    verificationRate: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [summary, payments, chartData] = await Promise.all([
          getDashboardSummary(),
          getRecentPayments(5),
          getMonthlyPaymentData(6)
        ]);
        
        setStats(summary);
        setRecentPayments(payments);
        setMonthlyData(chartData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Box>
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of fee collection and apartment management"
      />

      {loading ? (
        <LinearProgress sx={{ mb: 3 }} />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Active Households"
                value={stats.totalHouseholds}
                icon={<HomeIcon />}
                iconBgColor="#e3f2fd"
                iconColor="#2196f3"
                onClick={() => navigate('/households')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Active Fees"
                value={stats.totalFees}
                icon={<MoneyIcon />}
                iconBgColor="#e8f5e9"
                iconColor="#4caf50"
                onClick={() => navigate('/fees')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Total Payments"
                value={stats.totalPayments}
                icon={<ReceiptIcon />}
                iconBgColor="#fff8e1"
                iconColor="#ff9800"
                onClick={() => navigate('/payments')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Total Collected"
                value={formatCurrency(stats.totalCollected)}
                icon={<TrendingUpIcon />}
                iconBgColor="#fce4ec"
                iconColor="#e91e63"
                subtitle={`${stats.collectionRate}% collection rate`}
                onClick={() => navigate('/statistics')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Fee Collection (Last 6 months)
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<TimelineIcon />}
                      onClick={() => navigate('/statistics')}
                    >
                      View Statistics
                    </Button>
                  </Box>
                  <Box sx={{ height: 300, pt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="amount" fill="#2196f3" name="Amount Collected" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Recent Payments
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => navigate('/payments')}
                    >
                      View All
                    </Button>
                  </Box>
                  {recentPayments.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No payments have been recorded yet.
                      </Typography>
                      {admin && (
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/payments/add')}
                          sx={{ mt: 2 }}
                        >
                          Add Payment
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Household</TableCell>
                            <TableCell>Fee</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.householdOwnerName}</TableCell>
                              <TableCell>{payment.feeName}</TableCell>
                              <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={payment.verified ? "Verified" : "Unverified"}
                                  color={payment.verified ? "success" : "default"}
                                  size="small"
                                  icon={payment.verified ? <VerifiedIcon fontSize="small" /> : null}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 