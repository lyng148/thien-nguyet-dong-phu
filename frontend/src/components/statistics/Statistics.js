import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

import PageHeader from '../common/PageHeader';
import { 
  getPaymentTrendsByMonth,
  getPaymentsByFee,
  getCollectionRateByMonth,
  getTopPayingHouseholds
} from '../../services/statisticsService';

// Chart colors
const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

const Statistics = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('LAST_6_MONTHS');
  const [feeType, setFeeType] = useState('ALL');
  
  // Data state
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [paymentsByFee, setPaymentsByFee] = useState([]);
  const [collectionRate, setCollectionRate] = useState([]);
  const [topHouseholds, setTopHouseholds] = useState([]);

  // Map time range to number of months
  const getMonthsFromTimeRange = (range) => {
    switch (range) {
      case 'LAST_3_MONTHS':
        return 3;
      case 'LAST_YEAR':
        return 12;
      case 'LAST_6_MONTHS':
      default:
        return 6;
    }
  };

  // Load statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const months = getMonthsFromTimeRange(timeRange);
        
        // Load all data in parallel
        const [trends, feePayments, rates, households] = await Promise.all([
          getPaymentTrendsByMonth(months),
          getPaymentsByFee(),
          getCollectionRateByMonth(months),
          getTopPayingHouseholds(5)
        ]);
        
        setPaymentTrends(trends);
        setPaymentsByFee(feePayments);
        setCollectionRate(rates);
        setTopHouseholds(households);
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError('Failed to load statistics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, [timeRange, feeType]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
        title="Statistics" 
        subtitle="Analyze fee collection patterns and payment statistics"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Statistics' }
        ]}
      />

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="LAST_3_MONTHS">Last 3 Months</MenuItem>
            <MenuItem value="LAST_6_MONTHS">Last 6 Months</MenuItem>
            <MenuItem value="LAST_YEAR">Last Year</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Fee Type</InputLabel>
          <Select
            value={feeType}
            label="Fee Type"
            onChange={(e) => setFeeType(e.target.value)}
          >
            <MenuItem value="ALL">All Types</MenuItem>
            <MenuItem value="MANDATORY">Mandatory Only</MenuItem>
            <MenuItem value="VOLUNTARY">Voluntary Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Payment Trends Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Trends
                </Typography>
                <Box sx={{ height: 350, pt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={paymentTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="mandatory" name="Mandatory Fees" fill="#2196f3" />
                      <Bar dataKey="voluntary" name="Voluntary Fees" fill="#4caf50" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Collection Rate Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Collection Rate
                </Typography>
                <Box sx={{ height: 350, pt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={collectionRate}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        name="Collection Rate" 
                        stroke="#ff9800" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Payments by Fee Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payments by Fee Type
                </Typography>
                {paymentsByFee.length === 0 ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No payment data available for this period
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentsByFee}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentsByFee.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Paying Households */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Paying Households
                </Typography>
                {topHouseholds.length === 0 ? (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No household payment data available
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Household</TableCell>
                          <TableCell align="right">Total Paid</TableCell>
                          <TableCell>Last Payment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topHouseholds.map((household) => (
                          <TableRow key={household.id}>
                            <TableCell>{household.ownerName}</TableCell>
                            <TableCell align="right">{formatCurrency(household.totalPaid)}</TableCell>
                            <TableCell>{formatDate(household.lastPayment)}</TableCell>
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
      )}
    </Box>
  );
};

export default Statistics; 