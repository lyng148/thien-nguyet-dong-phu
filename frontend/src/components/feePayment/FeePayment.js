import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as CarIcon,
  ElectricBolt as ElectricIcon,
  Water as WaterIcon,
  Wifi as WifiIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  calculateHouseholdFees,
  createPayment,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  formatCurrency
} from '../../services/feePaymentService';
import { getAllHouseholds } from '../../services/householdService';

const FeePayment = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState([]);
  const [householdFees, setHouseholdFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHousehold, setFilterHousehold] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [filterMonth, filterYear]);

  useEffect(() => {
    filterFees();
  }, [householdFees, filterHousehold]);

  const loadData = async () => {
    setLoading(true);
    try {
      const householdsData = await getAllHouseholds();
      setHouseholds(householdsData);
      
      // Calculate fees for all households
      const feesData = [];
      for (const household of householdsData) {
        try {
          const fees = await calculateHouseholdFees(household.id, filterMonth, filterYear);
          feesData.push({
            ...fees,
            householdNumber: household.householdNumber,
            ownerName: household.ownerName
          });
        } catch (error) {
          console.error(`Error calculating fees for household ${household.id}:`, error);
        }
      }
      setHouseholdFees(feesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filterFees = () => {
    let filtered = householdFees;

    if (filterHousehold !== 'ALL') {
      filtered = filtered.filter(fee => fee.householdId === parseInt(filterHousehold));
    }

    setFilteredFees(filtered);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handlePaymentDialogOpen = (householdFee) => {
    setSelectedHousehold(householdFee);
    setPaymentDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setSelectedHousehold(null);
    setPaymentMethod('TIEN_MAT');
    setPaymentNotes('');
    setError('');
    setSuccess('');
  };

  const handleProcessPayment = async () => {
    if (!selectedHousehold) return;

    setSaving(true);
    setError('');

    try {
      const paymentData = {
        hoKhauId: selectedHousehold.householdId,
        thang: filterMonth,
        nam: filterYear,
        phiGuiXe: selectedHousehold.parkingFee,
        phiDichVu: selectedHousehold.utilityFee,
        tongTien: selectedHousehold.totalAmount,
        trangThaiThanhToan: 'DA_THANH_TOAN',
        ngayThanhToan: new Date().toISOString().split('T')[0],
        phuongThucThanhToan: paymentMethod,
        ghiChu: paymentNotes || `Thanh toán phí tháng ${filterMonth}/${filterYear}`
      };

      await createPayment(paymentData);
      setSuccess('Thanh toán thành công!');
      
      setTimeout(() => {
        handlePaymentDialogClose();
        loadData(); // Refresh data
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    }
    setSaving(false);
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'DIEN':
        return <ElectricIcon fontSize="small" />;
      case 'NUOC':
        return <WaterIcon fontSize="small" />;
      case 'INTERNET':
        return <WifiIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`
  }));

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year, label: year.toString() };
  });

  const totalAmount = filteredFees.reduce((sum, fee) => sum + fee.totalAmount, 0);

  return (
    <Box>
      <PageHeader 
        title="Thanh toán phí dịch vụ" 
        subtitle="Quản lý thanh toán phí gửi xe và các dịch vụ của hộ gia đình"
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Thanh toán phí' }
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={filterMonth}
                  label="Tháng"
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  {months.map(month => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Năm</InputLabel>
                <Select
                  value={filterYear}
                  label="Năm"
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  {years.map(year => (
                    <MenuItem key={year.value} value={year.value}>
                      {year.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Hộ gia đình</InputLabel>
                <Select
                  value={filterHousehold}
                  label="Hộ gia đình"
                  onChange={(e) => setFilterHousehold(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {households.map(household => (
                    <MenuItem key={household.id} value={household.id}>
                      {household.householdNumber} - {household.ownerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={2}>
              <Tooltip title="Làm mới">
                <IconButton 
                  onClick={handleRefresh} 
                  color="primary"
                  disabled={loading}
                  sx={{ height: 56, width: '100%' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Tổng phí cần thu: {formatCurrency(totalAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tháng {filterMonth}/{filterYear} - {filteredFees.length} hộ gia đình
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {filteredFees.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không có phí nào cần thu cho tháng {filterMonth}/{filterYear}.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Hộ gia đình</TableCell>
                        <TableCell>Phí gửi xe</TableCell>
                        <TableCell>Phí dịch vụ</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell>Chi tiết</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee.householdId}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {fee.householdNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {fee.ownerName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CarIcon fontSize="small" />
                              {formatCurrency(fee.parkingFee)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(fee.utilityFee)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatCurrency(fee.totalAmount)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="caption">Xem chi tiết</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="subtitle2" gutterBottom>
                                  Xe ({fee.vehicleCount} xe):
                                </Typography>
                                {fee.vehicles.map((vehicle, index) => (
                                  <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                    • {vehicle.licensePlate} - {vehicle.vehicleType}
                                  </Typography>
                                ))}
                                
                                <Divider sx={{ my: 1 }} />
                                
                                <Typography variant="subtitle2" gutterBottom>
                                  Dịch vụ:
                                </Typography>
                                {fee.utilityBills.map((bill, index) => (
                                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                                    {getServiceIcon(bill.serviceType)}
                                    <Typography variant="body2">
                                      {bill.serviceType}: {formatCurrency(bill.amount)}
                                    </Typography>
                                  </Box>
                                ))}
                              </AccordionDetails>
                            </Accordion>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              startIcon={<PaymentIcon />}
                              onClick={() => handlePaymentDialogOpen(fee)}
                              size="small"
                            >
                              Thanh toán
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handlePaymentDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Thanh toán phí dịch vụ
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {selectedHousehold && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedHousehold.householdNumber} - {selectedHousehold.ownerName}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phí gửi xe:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(selectedHousehold.parkingFee)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phí dịch vụ:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(selectedHousehold.utilityFee)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="h6" color="primary" gutterBottom>
                Tổng tiền: {formatCurrency(selectedHousehold.totalAmount)}
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Phương thức thanh toán"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={saving}
                >
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Ghi chú"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                disabled={saving}
                placeholder="Ghi chú về thanh toán..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentDialogClose} disabled={saving}>
            Hủy
          </Button>
          <Button 
            onClick={handleProcessPayment} 
            variant="contained"
            disabled={saving}
            startIcon={<PaymentIcon />}
          >
            {saving ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeePayment;
