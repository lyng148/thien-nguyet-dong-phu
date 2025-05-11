import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PeopleAlt as PeopleIcon,
  Paid as PaidIcon,
  DateRange as DateRangeIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getFeeById, getHouseholdsPaidForFee } from '../../services/feeService';

const FeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [fee, setFee] = useState(null);
  const [paidHouseholds, setPaidHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPaidHouseholds: 0
  });

  // Load fee details and households that have paid
  useEffect(() => {
    const loadFeeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load fee details
        const feeData = await getFeeById(id);
        setFee(feeData);
        
        // Load households that have paid for this fee
        const paidHouseholdsData = await getHouseholdsPaidForFee(id);
        setPaidHouseholds(paidHouseholdsData.paidHouseholds || []);
        
        // Set statistics
        setStats({
          totalCollected: paidHouseholdsData.totalCollected || 0,
          totalPaidHouseholds: paidHouseholdsData.totalPaidHouseholds || 0
        });
        
      } catch (error) {
        console.error('Error loading fee details:', error);
        setError('Failed to load fee details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFeeDetails();
  }, [id]);

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
        title={fee ? `Khoản thu: ${fee.name}` : 'Chi tiết khoản thu'} 
        subtitle="Xem chi tiết khoản thu và trạng thái thanh toán"
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Khoản thu', path: '/fees' },
          { label: fee?.name || 'Chi tiết' }
        ]}
        backButton={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/fees')}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
        }
      />

      {loading ? (
        <LinearProgress />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            size="small" 
            sx={{ ml: 2 }} 
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </Alert>
      ) : (
        <>
          {/* Fee Details Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Thông tin khoản thu
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>Tên:</Typography>
                      <Typography variant="body1">{fee?.name}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>Loại:</Typography>
                      <Chip 
                        label={fee?.type === 'MANDATORY' ? 'Bắt buộc' : 'Tự nguyện'} 
                        color={fee?.type === 'MANDATORY' ? 'primary' : 'secondary'} 
                        size="small" 
                      />
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>Số tiền:</Typography>
                      <Typography variant="body1">{formatCurrency(fee?.amount || 0)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>Thời hạn:</Typography>
                      <Typography variant="body1">{formatDate(fee?.dueDate)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>Trạng thái:</Typography>
                      <Chip 
                        label={fee?.active ? 'Đang hoạt động' : 'Không hoạt động'} 
                        color={fee?.active ? 'success' : 'default'} 
                        size="small" 
                      />
                    </Box>
                    {fee?.description && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Mô tả:</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>{fee.description}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Thống kê thanh toán
                  </Typography>
                  <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PeopleIcon color="primary" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Hộ khẩu đã thanh toán
                            </Typography>
                            <Typography variant="h5" fontWeight="medium">
                              {stats.totalPaidHouseholds}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PaidIcon color="success" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Tổng đã thu
                            </Typography>
                            <Typography variant="h5" fontWeight="medium">
                              {formatCurrency(stats.totalCollected)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Paid Households Card */}
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 1 }} />
                Danh sách hộ khẩu đã thanh toán
              </Typography>
              
              {paidHouseholds.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Chưa có hộ khẩu nào thanh toán cho khoản thu này.
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Số hộ khẩu</TableCell>
                        <TableCell>Chủ hộ</TableCell>
                        <TableCell>Địa chỉ</TableCell>
                        <TableCell align="right">Số tiền đã nộp</TableCell>
                        <TableCell>Ngày nộp</TableCell>
                        <TableCell>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paidHouseholds.map((household) => (
                        <TableRow key={household.paymentId}>
                          <TableCell>{household.soHoKhau || 'N/A'}</TableCell>
                          <TableCell>{household.ownerName}</TableCell>
                          <TableCell>{household.address}</TableCell>
                          <TableCell align="right">{formatCurrency(household.amount)}</TableCell>
                          <TableCell>{formatDate(household.paymentDate)}</TableCell>
                          <TableCell>{household.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default FeeDetail;