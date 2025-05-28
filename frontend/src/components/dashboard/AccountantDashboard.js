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
  Button,
  Alert,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as VerifiedIcon,
  Timeline as TimelineIcon,
  Assignment as FeeIcon,
  Warning as WarningIcon,
  AccountBalance as CollectionIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import PageHeader from '../common/PageHeader';
import DashboardCard from './DashboardCard';
import { getDashboardSummary, getRecentPayments, getMonthlyPaymentData, getAccountantDashboardSummary } from '../../services/dashboardService';
import { getAllPayments } from '../../services/paymentService';
import { getAllFees } from '../../services/feeService';

const AccountantDashboard = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFees: 0,
    totalPayments: 0,
    totalCollected: 0,
    totalMandatoryCollected: 0,
    totalVoluntaryCollected: 0,
    verifiedPayments: 0,
    unverifiedPayments: 0,
    verificationRate: 0,
    mandatoryFees: 0,
    voluntaryFees: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [feeTypeData, setFeeTypeData] = useState([]);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  // Load dashboard data specific to accountant needs
  useEffect(() => {
    const loadAccountantDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [summary, payments, chartData] = await Promise.all([
          getAccountantDashboardSummary(),
          getRecentPayments(5),
          getMonthlyPaymentData(6)
        ]);
        
        // Get fees for fee type chart
        const fees = await getAllFees();
        
        // Prepare fee type chart data
        const feeTypeChartData = [
          { 
            name: 'Phí Bắt Buộc', 
            value: summary.mandatoryFees, 
            amount: summary.totalMandatoryCollected 
          },
          { 
            name: 'Phí Tự Nguyện', 
            value: summary.voluntaryFees, 
            amount: summary.totalVoluntaryCollected 
          }
        ];
        
        setStats(summary);
        setRecentPayments(payments);
        setMonthlyData(chartData);
        setFeeTypeData(feeTypeChartData);
        
      } catch (error) {
        console.error('Error loading accountant dashboard data:', error);
        setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccountantDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Box>
      <PageHeader 
        title="Bảng Điều Khiển Kế Toán" 
        subtitle="Quản lý thu phí và thanh toán"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LinearProgress sx={{ mb: 3 }} />
      ) : (
        <>
          {/* Main Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tổng Khoản Thu"
                value={stats.totalFees}
                icon={<FeeIcon />}
                iconBgColor="#e8f5e9"
                iconColor="#4caf50"
                subtitle={`${stats.mandatoryFees} bắt buộc, ${stats.voluntaryFees} tự nguyện`}
                onClick={() => navigate('/fees')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tổng Thanh Toán"
                value={stats.totalPayments}
                icon={<ReceiptIcon />}
                iconBgColor="#fff8e1"
                iconColor="#ff9800"
                subtitle={`${stats.verifiedPayments} đã xác nhận`}
                onClick={() => navigate('/payments')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tổng Thu Được"
                value={formatCurrency(stats.totalCollected)}
                icon={<MoneyIcon />}
                iconBgColor="#e3f2fd"
                iconColor="#2196f3"
                onClick={() => navigate('/statistics')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Chưa Xác Nhận"
                value={stats.unverifiedPayments}
                icon={<WarningIcon />}
                iconBgColor="#ffebee"
                iconColor="#f44336"
                subtitle={`${stats.verificationRate}% đã xác nhận`}
                onClick={() => navigate('/payments?filter=unverified')}
              />
            </Grid>
          </Grid>

          {/* Collection by Fee Type */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Thu Phí Bắt Buộc
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {formatCurrency(stats.totalMandatoryCollected)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.mandatoryFees} khoản phí
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary">
                    Thu Phí Tự Nguyện
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {formatCurrency(stats.totalVoluntaryCollected)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.voluntaryFees} khoản phí
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phân Bố Theo Loại Phí
                  </Typography>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={feeTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                        >
                          {feeTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts and Recent Activity */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Thu Phí Theo Tháng (6 tháng gần đây)
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<TimelineIcon />}
                      onClick={() => navigate('/statistics')}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Box>
                  <Box sx={{ height: 300, pt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="amount" fill="#2196f3" name="Số Tiền Đã Thu" />
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
                      Thanh Toán Gần Đây
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => navigate('/payments')}
                    >
                      Xem Tất Cả
                    </Button>
                  </Box>
                  {recentPayments.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Chưa có thanh toán nào được ghi nhận.
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/payments/add')}
                        sx={{ mt: 2 }}
                      >
                        Thêm Thanh Toán
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Hộ Khẩu</TableCell>
                            <TableCell align="right">Số Tiền</TableCell>
                            <TableCell align="center">Trạng Thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <Typography variant="body2" noWrap>
                                  {payment.householdOwnerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {payment.feeName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatCurrency(payment.amountPaid || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={payment.verified ? "✓" : "!"}
                                  color={payment.verified ? "success" : "warning"}
                                  size="small"
                                  sx={{ minWidth: 40 }}
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
          </Grid>          {/* Quick Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thao Tác Nhanh
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/fees/add')}
                  >
                    Tạo Khoản Thu Mới
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/payments/add')}
                  >
                    Ghi Nhận Thanh Toán
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<VerifiedIcon />}
                    onClick={() => navigate('/payments?filter=unverified')}
                  >
                    Xác Nhận Thanh Toán
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    onClick={() => navigate('/statistics')}
                  >
                    Xem Báo Cáo
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/fees')}
                  >
                    Quản Lý Phí
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default AccountantDashboard;
