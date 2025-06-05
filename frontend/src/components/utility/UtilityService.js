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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  LinearProgress,
  InputAdornment,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ElectricBolt as ElectricIcon,
  Water as WaterIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  getAllUtilityBills,
  getUtilityBillsByHousehold,
  getUtilityBillsByMonthYear,
  deleteUtilityBill,
  SERVICE_TYPES
} from '../../services/utilityService';
import { getAllHouseholds } from '../../services/householdService';
import { formatCurrency } from '../../services/feePaymentService';

const UtilityService = () => {
  const navigate = useNavigate();
  const [utilityBills, setUtilityBills] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHousehold, setFilterHousehold] = useState('ALL');
  const [filterService, setFilterService] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBills();
  }, [utilityBills, filterHousehold, filterService, filterMonth, filterYear]);
  const loadData = async () => {
    setLoading(true);
    try {
      const householdsData = await getAllHouseholds();
      console.log('Loaded households data:', householdsData);
      setHouseholds(householdsData);
      
      // Lấy dữ liệu từ API thay vì tạo dữ liệu mẫu
      const utilityBillsData = await getUtilityBillsByMonthYear(filterMonth, filterYear);
      console.log('Loaded utility bills data:', utilityBillsData);
      setUtilityBills(utilityBillsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filterBills = () => {
    let filtered = utilityBills;

    // Filter by household
    if (filterHousehold !== 'ALL') {
      filtered = filtered.filter(bill => bill.householdId === parseInt(filterHousehold));
    }

    // Filter by service type
    if (filterService !== 'ALL') {
      filtered = filtered.filter(bill => bill.serviceType === filterService);
    }

    // Filter by month and year không cần filter nữa vì đã lấy theo tháng/năm từ API
    // filtered = filtered.filter(bill => 
    //   bill.month === filterMonth && bill.year === filterYear
    // );

    setFilteredBills(filtered);
  };

  const handleRefresh = () => {
    loadData();
  };
  const handleMonthYearChange = () => {
    loadData();
  };

  const handleDeleteClick = (bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!billToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteUtilityBill(billToDelete.id);
      setSnackbarMessage('Xóa hóa đơn thành công!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error deleting utility bill:', error);
      let errorMessage = 'Có lỗi xảy ra khi xóa hóa đơn';
      
      if (error.response?.status === 400) {
        errorMessage = 'Không thể xóa hóa đơn đã thanh toán';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBillToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const getHouseholdNumber = (householdId) => {
    console.log('getHouseholdNumber called with:', householdId);
    console.log('Available households:', households);
    const household = households.find(h => h.id === householdId);
    console.log('Found household:', household);
    return household ? (household.ownerName || household.soHoKhau || 'Không có số HK') : 'N/A';
  };

  const getServiceTypeLabel = (type) => {
    return SERVICE_TYPES[type] || type;
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'DIEN':
        return <ElectricIcon />;
      case 'NUOC':
        return <WaterIcon />;
      case 'INTERNET':
        return <WifiIcon />;
      default:
        return null;
    }
  };

  const getServiceColor = (type) => {
    switch (type) {
      case 'DIEN':
        return 'warning';
      case 'NUOC':
        return 'info';
      case 'INTERNET':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatReading = (oldReading, newReading, unit) => {
    if (!oldReading && !newReading) return '-';
    return `${oldReading || 0} → ${newReading || 0} ${unit}`;
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`
  }));
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year, label: year.toString() };
  });

  return (
    <Box>
      <PageHeader 
        title="Phí dịch vụ" 
        subtitle="Quản lý các khoản phí điện, nước, internet của các hộ gia đình"
        actionText="Tạo hóa đơn"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/utilities/add')}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Phí dịch vụ' }
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
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setTimeout(handleMonthYearChange, 100);
                  }}
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
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setTimeout(handleMonthYearChange, 100);
                  }}
                >
                  {years.map(year => (
                    <MenuItem key={year.value} value={year.value}>
                      {year.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Loại dịch vụ</InputLabel>
                <Select
                  value={filterService}
                  label="Loại dịch vụ"
                  onChange={(e) => setFilterService(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {Object.entries(SERVICE_TYPES).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
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
                      {household.ownerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title="Làm mới">
              <IconButton 
                onClick={handleRefresh} 
                color="primary"
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {filteredBills.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không có hóa đơn dịch vụ nào cho tháng {filterMonth}/{filterYear}.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/utilities/add')}
                    sx={{ mt: 2 }}
                  >
                    Tạo hóa đơn
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dịch vụ</TableCell>
                        <TableCell>Hộ gia đình</TableCell>
                        <TableCell>Chỉ số</TableCell>
                        <TableCell>Số tiền</TableCell>
                        <TableCell>Ghi chú</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getServiceIcon(bill.serviceType)}
                              <Chip 
                                label={getServiceTypeLabel(bill.serviceType)}
                                color={getServiceColor(bill.serviceType)}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{getHouseholdNumber(bill.householdId)}</TableCell>
                          <TableCell>
                            {formatReading(bill.oldReading, bill.newReading, bill.unit)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatCurrency(bill.amount)}
                            </Box>
                          </TableCell>
                          <TableCell>{bill.notes}</TableCell>                          <TableCell align="right">
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => navigate(`/utilities/edit/${bill.id}`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(bill)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa hóa đơn
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa hóa đơn{' '}
            <strong>
              {billToDelete && getServiceTypeLabel(billToDelete.serviceType)}
            </strong>{' '}
            của hộ gia đình{' '}
            <strong>
              {billToDelete && getHouseholdNumber(billToDelete.householdId)}
            </strong>{' '}
            tháng {filterMonth}/{filterYear} không?
            <br />
            <br />
            <strong>Hành động này không thể hoàn tác.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            color="primary"
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UtilityService;