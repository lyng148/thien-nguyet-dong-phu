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
  Typography
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getFeeById, createFee, updateFee } from '../../services/feeService';
import { isAdmin } from '../../utils/auth';

const FeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const admin = isAdmin();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'MANDATORY',
    amount: '',
    dueDate: '',
    description: '',
    active: admin, 
    ngayTao: formatDateForInput(new Date())
  });
  
  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load fee data if editing
  useEffect(() => {
    const fetchFee = async () => {
      if (isEdit) {
        try {
          setLoading(true);
          const data = await getFeeById(id);
          
          setFormData({
            name: data.name || '',
            type: data.type || 'MANDATORY',
            amount: data.amount || '',
            dueDate: data.dueDate ? formatDateForInput(data.dueDate) : '',
            description: data.description || '',
            active: data.active !== undefined ? data.active : true,
            ngayTao: data.ngayTao ? formatDateForInput(data.ngayTao) : formatDateForInput(new Date())
          });
        } catch (err) {
          console.error('Error fetching fee:', err);
          setError('Lỗi khi tải dữ liệu khoản thu. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFee();
  }, [isEdit, id]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    setSaving(true);
    
    try {
      // Validate form data
      if (!formData.name || formData.amount === '' || !formData.dueDate) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      // Create fee data object
      const feeData = {
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description,
        active: admin ? formData.active : false, // Force inactive if not admin
        ngayTao: formData.ngayTao
      };
      
      let result;
      if (isEdit) {
        result = await updateFee(id, feeData);
        console.log('Fee updated successfully:', result);
        setSuccess('Cập nhật khoản thu thành công');
      } else {
        result = await createFee(feeData);
        console.log('Fee created successfully:', result);
        setSuccess('Tạo khoản thu thành công' + (!admin ? ' (Đang chờ phê duyệt)' : ''));
      }
      
      // Redirect after successful save
      setTimeout(() => {
        navigate('/fees');
      }, 1500);
      
    } catch (err) {
      console.error('Save fee error:', err);
      setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin khoản thu');
    } finally {
      setSaving(false);
    }
  };

  // Format date for input
  function formatDateForInput(dateValue) {
    if (!dateValue) return '';
    
    // Handle different date formats
    let date;
    if (typeof dateValue === 'string') {
      if (dateValue.includes('T')) {
        // ISO format
        date = new Date(dateValue);
      } else {
        // Simple YYYY-MM-DD format
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue);
    }
    
    // Get year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Return in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  }

  return (
    <Box>
      <PageHeader 
        title={isEdit ? 'Chỉnh sửa khoản thu' : 'Thêm khoản thu'} 
        subtitle={isEdit ? 'Cập nhật thông tin khoản thu' : 'Tạo khoản thu mới'}
        breadcrumbs={[
          { label: 'Trang chủ', path: '/dashboard' },
          { label: 'Khoản thu', path: '/fees' },
          { label: isEdit ? 'Chỉnh sửa' : 'Thêm khoản thu' }
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

              <Typography variant="h6" gutterBottom>
                Thông tin khoản thu
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tên khoản thu"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                    placeholder="VD: Phí dịch vụ, Phí bảo trì"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={saving}>
                    <InputLabel>Loại khoản thu</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      label="Loại khoản thu"
                      onChange={handleChange}
                    >
                      <MenuItem value="MANDATORY">Bắt buộc</MenuItem>
                      <MenuItem value="VOLUNTARY">Tự nguyện</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số tiền"
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
                    label="Hạn thanh toán"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
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
                    label="Ngày tạo"
                    name="ngayTao"
                    type="date"
                    value={formData.ngayTao}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Mô tả (Tùy chọn)"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    disabled={saving}
                  />
                </Grid>
                
                {admin && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="active"
                          checked={formData.active}
                          onChange={handleChange}
                          disabled={saving}
                          color="success"
                        />
                      }
                      label="Đang hoạt động"
                    />
                  </Grid>
                )}
                {!admin && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Việc tạo khoản thu của bạn sẽ cần được quản trị viên phê duyệt.
                    </Alert>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/fees')}
                  startIcon={<ArrowBackIcon />}
                  disabled={saving}
                >
                  Hủy
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      Đang lưu...
                    </>
                  ) : (
                    isEdit ? 'Cập nhật khoản thu' : 'Tạo khoản thu'
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

export default FeeForm;