import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Autocomplete,
  Typography
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getPaymentById, createPayment, updatePayment, getPaymentByHouseholdAndFee } from '../../services/paymentService';
import { getAllHouseholds } from '../../services/householdService';
import { getAllFees } from '../../services/feeService';
import { isAdmin } from '../../utils/auth';

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const admin = isAdmin();
  
  // Form state
  const [formData, setFormData] = useState({
    householdId: '',
    household: null,
    feeId: '',
    fee: null,
    amount: '',
    amountPaid: '',
    paymentDate: formatDateForInput(new Date()),
    verified: false,
    notes: '',
    payerName: '' // Added new field
  });
  
  // Data state
  const [households, setHouseholds] = useState([]);
  const [fees, setFees] = useState([]);
  const [existingPayment, setExistingPayment] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load payment data if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load households and fees from API
        const [householdsData, feesData] = await Promise.all([
          getAllHouseholds(),
          getAllFees()
        ]);
        
        console.log('Loaded households:', householdsData);
        console.log('Loaded fees:', feesData);
        
        setHouseholds(householdsData);
        setFees(feesData);
        
        // If editing, load payment data from API
        if (isEdit) {
          const paymentData = await getPaymentById(id);
          console.log('Received payment data (DTO format):', paymentData);
          
          // Parse IDs as integers for safer comparison
          const householdId = parseInt(paymentData.householdId, 10);
          const feeId = parseInt(paymentData.feeId, 10);
          
          // Find the actual household and fee objects from the loaded data
          const selectedHousehold = householdsData.find(h => parseInt(h.id, 10) === householdId);
          const selectedFee = feesData.find(f => parseInt(f.id, 10) === feeId);
          
          console.log(`Searching for household ID ${householdId} in`, householdsData.map(h => h.id));
          console.log(`Searching for fee ID ${feeId} in`, feesData.map(f => f.id));
          console.log('Edit mode - found household:', selectedHousehold);
          console.log('Edit mode - found fee:', selectedFee);
          
          // Format data for form
          setFormData({
            ...paymentData,
            householdId: paymentData.householdId || '',
            household: selectedHousehold || null,
            feeId: paymentData.feeId || '',
            fee: selectedFee || null,
            amount: paymentData.amount || 0,
            amountPaid: paymentData.amountPaid || paymentData.amount || 0,
            paymentDate: formatDateForInput(paymentData.paymentDate),
            payerName: paymentData.payerName || '' // Added new field
          });
        }
      } catch (err) {
        console.error('Load data error:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isEdit, id]);

  // Check if the household has already paid this fee
  useEffect(() => {
    const checkExistingPayment = async () => {
      // Only check if not in edit mode and both household and fee are selected
      if (!isEdit && formData.householdId && formData.feeId) {
        try {
          const existingPaymentData = await getPaymentByHouseholdAndFee(
            formData.householdId, 
            formData.feeId
          );
          
          // If we got data back, a payment exists
          if (existingPaymentData && existingPaymentData.id) {
            console.log('Found existing payment:', existingPaymentData);
            setExistingPayment(existingPaymentData);
          } else {
            setExistingPayment(null);
          }
        } catch (err) {
          console.error('Error checking existing payment:', err);
          // Don't set an error message here - just log it
          setExistingPayment(null);
        }
      }
    };
    
    checkExistingPayment();
  }, [formData.householdId, formData.feeId, isEdit]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle household selection
  const handleHouseholdChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      household: newValue,
      householdId: newValue ? newValue.id : '',
      payerName: prev.payerName || (newValue ? newValue.ownerName : '') // Default payer name to household owner
    }));
    console.log('Selected household:', newValue?.id);
  };

  // Handle fee selection
  const handleFeeChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      fee: newValue,
      feeId: newValue ? newValue.id : '',
      amount: newValue ? newValue.amount : '',
      amountPaid: newValue ? newValue.amount : ''
    }));
    console.log('Selected fee:', newValue?.id);
  };

  // Handle number input
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || parseFloat(value) >= 0) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate form data
    if (!formData.householdId) {
      setError('Vui lòng chọn hộ khẩu');
      return;
    }
    
    if (!formData.feeId) {
      setError('Vui lòng chọn khoản thu');
      return;
    }
    
    if (formData.amount === '' || formData.amount < 0) {
      setError('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }
    
    setSaving(true);
    
    try {
      // Format data for API
      const paymentData = {
        householdId: parseInt(formData.householdId, 10),
        feeId: parseInt(formData.feeId, 10),
        amount: parseFloat(formData.amount),
        amountPaid: parseFloat(formData.amountPaid || formData.amount),
        paymentDate: formData.paymentDate,
        verified: admin ? formData.verified : false,
        notes: formData.notes || '',
        payerName: formData.payerName || '' // Added new field
      };
      
      console.log('Submitting payment data:', paymentData);
      
      if (isEdit) {
        await updatePayment(id, paymentData);
        setSuccess('Cập nhật thanh toán thành công');
      } else {
        await createPayment(paymentData);
        setSuccess('Tạo thanh toán thành công' + (!admin ? ' (Đang chờ xác nhận)' : ''));
      }
      
      // Redirect after successful save
      setTimeout(() => {
        navigate('/payments');
      }, 1500);
      
    } catch (err) {
      console.error('Save payment error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thanh toán');
    } finally {
      setSaving(false);
    }
  };

  // Format date for input
  function formatDateForInput(dateValue) {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return date.toISOString().split('T')[0];
  }

  return (
    <Box>
      <PageHeader 
        title={isEdit ? 'Chỉnh sửa thanh toán' : 'Thêm thanh toán'} 
        subtitle={isEdit ? 'Cập nhật thông tin thanh toán' : 'Tạo bản ghi thanh toán mới'}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Thanh toán', path: '/payments' },
          { label: isEdit ? 'Chỉnh sửa' : 'Thêm thanh toán' }
        ]}
      />

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}
              
              {existingPayment && !isEdit && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <strong>Chú ý:</strong> Hộ khẩu này đã nộp khoản phí này vào ngày {formatDateForInput(existingPayment.paymentDate)}. 
                  Số tiền đã nộp: {existingPayment.amountPaid.toLocaleString()} ₫. 
                  {existingPayment.verified ? ' (Đã xác nhận)' : ' (Chưa xác nhận)'}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                Chi tiết thanh toán
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={households}
                    getOptionLabel={(option) => `${option.ownerName} (${option.address})`}
                    value={formData.household}
                    onChange={handleHouseholdChange}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hộ khẩu"
                        required
                        error={!formData.householdId && formData.householdId !== ''}
                        helperText={!formData.householdId && 'Hộ khẩu là bắt buộc'}
                        disabled={saving}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={fees}
                    getOptionLabel={(option) => `${option.name} (${option.amount} ₫)`}
                    value={formData.fee}
                    onChange={handleFeeChange}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Khoản thu"
                        required
                        error={!formData.feeId && formData.feeId !== ''}
                        helperText={!formData.feeId && 'Khoản thu là bắt buộc'}
                        disabled={saving}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tổng số tiền"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleNumberChange}
                    fullWidth
                    required
                    disabled={saving}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số tiền đã nộp"
                    name="amountPaid"
                    type="number"
                    value={formData.amountPaid}
                    onChange={handleNumberChange}
                    fullWidth
                    required
                    disabled={saving}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày thanh toán"
                    name="paymentDate"
                    type="date"
                    value={formatDateForInput(formData.paymentDate)}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tên người nộp"
                    name="payerName"
                    value={formData.payerName}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    placeholder="Tên người thực hiện thanh toán"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Ghi chú"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={saving}
                    placeholder="Ghi chú tùy chọn về thanh toán này"
                  />
                </Grid>
                
                {admin && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="verified"
                          checked={formData.verified}
                          onChange={handleChange}
                          disabled={saving}
                          color="success"
                        />
                      }
                      label="Đã xác nhận"
                    />
                  </Grid>
                )}
                {!admin && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Thanh toán của bạn sẽ cần được xác nhận bởi quản trị viên.
                    </Alert>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/payments')}
                  startIcon={<ArrowBackIcon />}
                  disabled={saving}
                >
                  Hủy
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving || (existingPayment && !isEdit)}
                >
                  {saving ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      Đang lưu...
                    </>
                  ) : (
                    isEdit ? 'Cập nhật thanh toán' : 'Tạo thanh toán'
                  )}
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentForm;