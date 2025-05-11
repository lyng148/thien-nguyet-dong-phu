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
  DialogTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getAllPayments, verifyPayment, unverifyPayment, deletePayment } from '../../services/paymentService';
import { ROLE_ADMIN } from '../../config/constants';
import { isAdmin as checkIsAdmin } from '../../utils/auth';

const PaymentList = () => {
  const navigate = useNavigate();
  
  // Get user role from auth utility
  const isAdmin = checkIsAdmin();
  
  // State
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
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setError('Failed to load payments. Please try again.');
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
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
        await unverifyPayment(id); // Đã cập nhật để sử dụng PATCH trong paymentService.js
      } else {
        await verifyPayment(id); // Đã cập nhật để sử dụng PATCH trong paymentService.js
      }
      
      // Reload payments after verification change
      await loadPayments();
    } catch (error) {
      console.error('Error toggling verification status:', error);
      setError(`Failed to ${verified ? 'unverify' : 'verify'} payment. Please try again.`);
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
      setError(`Failed to delete payment. Please try again.`);
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
        title="Payments" 
        subtitle="Manage all payment records"
        actionText="Add Payment"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/payments/add')}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Payments' }
        ]}
      />

      <Card>
        <CardContent>
          {/* Filters and Actions */}
          <Grid container spacing={2} mb={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search Payments"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by household, fee, or notes"
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
                <InputLabel id="verification-filter-label">Verification Status</InputLabel>
                <Select
                  labelId="verification-filter-label"
                  id="verification-filter"
                  value={verificationFilter}
                  label="Verification Status"
                  onChange={handleVerificationFilterChange}
                >
                  <MenuItem value="all">All Payments</MenuItem>
                  <MenuItem value="verified">Verified Only</MenuItem>
                  <MenuItem value="unverified">Unverified Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/payments/add')}
              >
                Add Payment
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
                Retry
              </Button>
            </Alert>
          )}

          {loading ? (
            <LinearProgress />
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Household</TableCell>
                      <TableCell>Fee</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell>Verification</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPayments.length > 0 ? (
                      paginatedPayments.map((payment) => (
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
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.verified ? "Verified" : "Unverified"}
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
                                <Tooltip title={payment.verified ? "Mark as Unverified" : "Verify Payment"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleVerification(payment.id, payment.verified)}
                                    color={payment.verified ? "default" : "success"}
                                  >
                                    {payment.verified ? <UnverifiedIcon /> : <VerifiedIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Payment">
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
                            <Tooltip title="Edit Payment">
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
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="textSecondary">
                            No payments found matching your criteria
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/payments/add')}
                            sx={{ mt: 2 }}
                          >
                            Add Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
          Delete Payment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-payment-dialog-description">
            Are you sure you want to delete this payment from {paymentToDelete?.householdOwnerName} 
            for {paymentToDelete?.feeName} ({formatCurrency(paymentToDelete?.amount || 0)})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePayment} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentList;