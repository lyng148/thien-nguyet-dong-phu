import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  TablePagination,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Grid,
  Paper,
  LinearProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  Delete as DeleteIcon,
  List as ListIcon,
  Description as DescriptionIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getAllPayments, verifyPayment, unverifyPayment, deletePayment } from '../../services/paymentService';
import { getAllFees } from '../../services/feeService';
import { getAllHouseholds } from '../../services/householdService';
import { ROLE_ADMIN } from '../../config/constants';
import { isAdmin as checkIsAdmin } from '../../utils/auth';

// TabPanel component for handling tab content display
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PaymentList = () => {
  const navigate = useNavigate();
  
  // Get user role from auth utility
  const isAdmin = checkIsAdmin();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // State for all payments
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  
  // State for fee tab
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState('');
  const [feePayments, setFeePayments] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  
  // State for household tab
  const [households, setHouseholds] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState('');
  const [householdPayments, setHouseholdPayments] = useState([]);
  const [householdsLoading, setHouseholdsLoading] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load data specific to each tab when first accessed
    if (newValue === 1 && fees.length === 0) {
      loadFees();
    }
    if (newValue === 2 && households.length === 0) {
      loadHouseholds();
    }
  };

  // Load payments
  useEffect(() => {
    loadPayments();
  }, [verificationFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create filter object based on verification filter
      const filters = {};
      if (verificationFilter === 'verified') {
        filters.verified = true;
      } else if (verificationFilter === 'unverified') {
        filters.verified = false;
      }
      
      console.log("Fetching payments with filters:", filters);
      const data = await getAllPayments(filters);
      console.log("Payment data received:", data);
      
      if (Array.isArray(data)) {
        // Create a lookup of household IDs to household information
        const householdIdToInfoMap = {};
        
        // First pass - collect all available household information
        data.forEach(payment => {
          if (payment.householdId && (payment.householdOwnerName || payment.householdAddress)) {
            householdIdToInfoMap[payment.householdId] = {
              ownerName: payment.householdOwnerName || '',
              address: payment.householdAddress || '',
              soHoKhau: payment.soHoKhau || ''
            };
          }
        });
        
        console.log("Household lookup map:", householdIdToInfoMap);
        
        // Create a lookup of fee IDs to names from the available data
        const feeIdToNameMap = {};
        data.forEach(payment => {
          if (payment.feeId && payment.feeName) {
            feeIdToNameMap[payment.feeId] = payment.feeName;
          }
        });
        
        // Second pass - ensure all payments have household information if the household ID exists in our lookup
        const processedData = data.map(payment => {
          let updatedPayment = {...payment};
          
          // Fill in missing fee names
          if (!payment.feeName && payment.feeId && feeIdToNameMap[payment.feeId]) {
            console.log(`Filling in missing fee name for payment ${payment.id} with fee ${payment.feeId}`);
            updatedPayment.feeName = feeIdToNameMap[payment.feeId];
          }
          
          // Fill in missing household information
          if (payment.householdId && householdIdToInfoMap[payment.householdId]) {
            // Always use the information from our lookup to ensure consistency
            const householdInfo = householdIdToInfoMap[payment.householdId];
            
            // Check if there's missing information that we can fill in
            if (!payment.householdOwnerName || !payment.householdAddress) {
              console.log(`Filling in missing household info for payment ${payment.id} with household ${payment.householdId}`);
            }
            
            // Always use the lookup data for consistency
            updatedPayment.householdOwnerName = householdInfo.ownerName;
            updatedPayment.householdAddress = householdInfo.address;
            updatedPayment.soHoKhau = householdInfo.soHoKhau;
          }
          
          return updatedPayment;
        });
        
        setPayments(processedData);
        setTotal(processedData.length);
      } else {
        setPayments([]);
        setTotal(0);
        setError('Dữ liệu nhận được từ máy chủ không hợp lệ');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setError('Không thể tải danh sách thanh toán. Vui lòng thử lại.');
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Load all fees
  const loadFees = async () => {
    try {
      setFeesLoading(true);
      const data = await getAllFees();
      if (Array.isArray(data)) {
        setFees(data);
      } else {
        setFees([]);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setFeesLoading(false);
    }
  };
  
  // Load all households
  const loadHouseholds = async () => {
    try {
      setHouseholdsLoading(true);
      const data = await getAllHouseholds();
      if (Array.isArray(data)) {
        setHouseholds(data);
      } else {
        setHouseholds([]);
      }
    } catch (error) {
      console.error('Error loading households:', error);
    } finally {
      setHouseholdsLoading(false);
    }
  };
  
  // Handle fee selection
  const handleFeeChange = (event) => {
    const feeId = event.target.value;
    setSelectedFee(feeId);
    
    if (feeId) {
      // Filter payments for the selected fee
      const feeSpecificPayments = payments.filter(payment => payment.feeId === feeId);
      setFeePayments(feeSpecificPayments);
    } else {
      setFeePayments([]);
    }
  };
  
  // Handle household selection
  const handleHouseholdChange = (event) => {
    const householdId = event.target.value;
    setSelectedHousehold(householdId);
    
    if (householdId) {
      // Filter payments for the selected household
      const householdSpecificPayments = payments.filter(payment => payment.householdId === householdId);
      setHouseholdPayments(householdSpecificPayments);
    } else {
      setHouseholdPayments([]);
    }
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/payments/edit/${id}`);
  };

  // Handle toggle verification
  const handleToggleVerification = async (id, verified) => {
    try {
      setLoading(true);
      if (verified) {
        await unverifyPayment(id);
      } else {
        await verifyPayment(id);
      }
      
      // Reload payments after verification change
      await loadPayments();
    } catch (error) {
      console.error('Error toggling verification status:', error);
      setError(`Không thể ${verified ? 'hủy xác nhận' : 'xác nhận'} thanh toán. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  // Handle delete payment
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      setLoading(true);
      await deletePayment(paymentToDelete.id);
      
      // Update the payments state to remove the deleted payment
      setPayments(payments.filter(payment => payment.id !== paymentToDelete.id));
      
      // Close the dialog
      handleDeleteDialogClose();
    } catch (error) {
      console.error(`Delete payment ${paymentToDelete.id} error:`, error);
      setError(`Không thể xóa thanh toán. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle verification filter change
  const handleVerificationFilterChange = (event) => {
    setVerificationFilter(event.target.value);
    setPage(0);
  };

  // Filter payments based on search term and verification status
  const filteredPayments = payments.filter(payment => {
    const searchMatch = 
      payment.householdOwnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.feeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (verificationFilter === 'all') {
      return searchMatch;
    } else if (verificationFilter === 'verified') {
      return searchMatch && payment.verified;
    } else {
      return searchMatch && !payment.verified;
    }
  });

  // Paginate
  const paginatedPayments = filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Render payment table
  const renderPaymentTable = (paymentsToShow) => (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hộ khẩu</TableCell>
            <TableCell>Khoản thu</TableCell>
            <TableCell align="right">Số tiền yêu cầu</TableCell>
            <TableCell align="right">Số tiền đã nộp</TableCell>
            <TableCell>Ngày thanh toán</TableCell>
            <TableCell>Xác nhận</TableCell>
            <TableCell>Ghi chú</TableCell>
            <TableCell align="right">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paymentsToShow.length > 0 ? (
            paymentsToShow.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Typography variant="body2">{payment.householdOwnerName}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {payment.householdAddress}
                  </Typography>
                </TableCell>
                <TableCell>{payment.feeName}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="medium">
                    {formatCurrency(payment.amount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="medium" color={payment.amountPaid < payment.amount ? "warning.main" : "success.main"}>
                    {formatCurrency(payment.amountPaid || 0)}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.verified ? "Đã xác nhận" : "Chưa xác nhận"}
                    color={payment.verified ? "success" : "default"}
                    size="small"
                    icon={payment.verified ? <VerifiedIcon /> : <UnverifiedIcon />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap style={{ maxWidth: '200px' }}>
                    {payment.notes || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {isAdmin && (
                    <>
                      <Tooltip title={payment.verified ? "Đánh dấu chưa xác nhận" : "Xác nhận thanh toán"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleVerification(payment.id, payment.verified)}
                          color={payment.verified ? "default" : "success"}
                        >
                          {payment.verified ? <UnverifiedIcon /> : <VerifiedIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa thanh toán">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDialogOpen(payment)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Chỉnh sửa thanh toán">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(payment.id)}
                      sx={{ ml: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="textSecondary">
                  Không tìm thấy thanh toán nào phù hợp với tiêu chí của bạn
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/payments/add')}
                  sx={{ mt: 2 }}
                >
                  Thêm thanh toán
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <PageHeader 
        title="Thanh toán" 
        subtitle="Quản lý tất cả thanh toán"
        actionText="Thêm thanh toán"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/payments/add')}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Thanh toán' }
        ]}
      />

      <Card>
        <CardContent>
          {/* Tab Navigation */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<ListIcon />} label="Tất cả thanh toán" />
            <Tab icon={<DescriptionIcon />} label="Theo khoản thu" />
            <Tab icon={<HomeIcon />} label="Theo hộ khẩu" />
          </Tabs>
          
          {/* Tab 1: All Payments */}
          <TabPanel value={tabValue} index={0}>
            {/* Filters and Actions */}
            <Grid container spacing={2} mb={3} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm thanh toán"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Tìm theo hộ khẩu, khoản thu hoặc ghi chú"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="verification-filter-label">Trạng thái xác nhận</InputLabel>
                  <Select
                    labelId="verification-filter-label"
                    id="verification-filter"
                    value={verificationFilter}
                    label="Trạng thái xác nhận"
                    onChange={handleVerificationFilterChange}
                  >
                    <MenuItem value="all">Tất cả thanh toán</MenuItem>
                    <MenuItem value="verified">Chỉ đã xác nhận</MenuItem>
                    <MenuItem value="unverified">Chỉ chưa xác nhận</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/payments/add')}
                >
                  Thêm thanh toán
                </Button>
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
                <Button 
                  size="small" 
                  sx={{ ml: 2 }} 
                  onClick={loadPayments}
                >
                  Thử lại
                </Button>
              </Alert>
            )}

            {loading ? (
              <LinearProgress />
            ) : (
              <>
                {renderPaymentTable(paginatedPayments)}
                <TablePagination
                  component="div"
                  count={filteredPayments.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                                  />
              </>
            )}
          </TabPanel>
          
          {/* Tab 2: By Fee */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="fee-select-label">Chọn khoản thu</InputLabel>
                <Select
                  labelId="fee-select-label"
                  id="fee-select"
                  value={selectedFee}
                  label="Chọn khoản thu"
                  onChange={handleFeeChange}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Chọn khoản thu...</em>
                  </MenuItem>
                  {fees.map((fee) => (
                    <MenuItem key={fee.id} value={fee.id}>
                      {fee.name} - {formatCurrency(fee.amount)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {feesLoading ? (
              <LinearProgress />
            ) : selectedFee ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Thanh toán khoản thu {fees.find(f => f.id === selectedFee)?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Hiển thị tất cả thanh toán cho khoản thu này
                  </Typography>
                </Box>
                {renderPaymentTable(feePayments)}
                
                {/* Fee-specific stats */}
                {feePayments.length > 0 && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Tổng hộ khẩu đã nộp</Typography>
                        <Typography variant="h6">{feePayments.length}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Tổng số tiền đã thu</Typography>
                        <Typography variant="h6">
                          {formatCurrency(feePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0))}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Thanh toán đã xác nhận</Typography>
                        <Typography variant="h6">
                          {feePayments.filter(p => p.verified).length} / {feePayments.length}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="info">
                Vui lòng chọn một khoản thu để xem các thanh toán liên quan
              </Alert>
            )}
          </TabPanel>
          
          {/* Tab 3: By Household */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="household-select-label">Chọn hộ khẩu</InputLabel>
                <Select
                  labelId="household-select-label"
                  id="household-select"
                  value={selectedHousehold}
                  label="Chọn hộ khẩu"
                  onChange={handleHouseholdChange}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Chọn hộ khẩu...</em>
                  </MenuItem>
                  {households.map((household) => (
                    <MenuItem key={household.id} value={household.id}>
                      {household.soHoKhau || 'Không có'} - {household.chuHo || household.ownerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {householdsLoading ? (
              <LinearProgress />
            ) : selectedHousehold ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Thanh toán của {households.find(h => h.id === selectedHousehold)?.ownerName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Hiển thị tất cả thanh toán của hộ khẩu này
                  </Typography>
                </Box>
                {renderPaymentTable(householdPayments)}
                
                {/* Household-specific stats */}
                {householdPayments.length > 0 && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Tổng khoản thu đã nộp</Typography>
                        <Typography variant="h6">{householdPayments.length}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Tổng số tiền đã nộp</Typography>
                        <Typography variant="h6">
                          {formatCurrency(householdPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0))}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Lần thanh toán cuối</Typography>
                        <Typography variant="h6">
                          {formatDate(householdPayments.sort((a, b) => 
                            new Date(b.paymentDate) - new Date(a.paymentDate))[0]?.paymentDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="info">
                Vui lòng chọn một hộ khẩu để xem các thanh toán của họ
              </Alert>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-payment-dialog-title"
        aria-describedby="delete-payment-dialog-description"
      >
        <DialogTitle id="delete-payment-dialog-title">
          Xóa thanh toán
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-payment-dialog-description">
            Bạn có chắc chắn muốn xóa thanh toán này từ {paymentToDelete?.householdOwnerName} 
            cho {paymentToDelete?.feeName} ({formatCurrency(paymentToDelete?.amount || 0)})?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePayment} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentList;