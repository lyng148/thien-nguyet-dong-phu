import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getHouseholdById, createHousehold, updateHousehold } from '../../services/householdService';
import { isAdmin, isToTruong } from '../../utils/auth';

const HouseholdForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const admin = isAdmin();
  const toTruong = isToTruong();
  const canCreateActive = admin || toTruong; // Both admin and tổ trưởng can create active households
  
  // Form state
  const [formData, setFormData] = useState({
    ownerName: '',
    address: '', // Will be built from the address components when submitting
    numMembers: 1, // Keeping this with default value of 1, but will hide from UI
    phoneNumber: '',
    email: '',
    active: canCreateActive, // Set active to true by default if user is admin or tổ trưởng
    // New fields
    soHoKhau: '',
    soNha: '',
    duong: '',
    phuong: '',
    quan: '',
    ngayLamHoKhau: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load household data if editing
  useEffect(() => {
    const fetchHousehold = async () => {
      if (isEdit) {
        try {
          setLoading(true);
          console.log('Fetching household with ID:', id);
          const data = await getHouseholdById(id);
          console.log('Received household data:', data);
          setFormData({
            ownerName: data.ownerName || '',
            address: data.address || '',
            numMembers: data.numMembers || 1,
            phoneNumber: data.phoneNumber || '',
            email: data.email || '',
            active: data.active !== undefined ? data.active : true,
            // New fields
            soHoKhau: data.soHoKhau || '',
            soNha: data.soNha || '',
            duong: data.duong || '',
            phuong: data.phuong || '',
            quan: data.quan || '',
            ngayLamHoKhau: data.ngayLamHoKhau ? formatDateForInput(data.ngayLamHoKhau) : ''
          });
        } catch (err) {
          console.error('Error fetching household:', err);
          setError('Lỗi khi tải dữ liệu hộ khẩu. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchHousehold();
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
    if (value === '' || parseInt(value) > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseInt(value)
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
      // Construct address from components
      const constructedAddress = `${formData.soNha}, ${formData.duong}, ${formData.phuong}, ${formData.quan}`;
      
      // Make sure numMembers is an integer
      const householdData = {
        ...formData,
        address: constructedAddress, // Set address to the constructed string
        numMembers: formData.numMembers ? parseInt(formData.numMembers, 10) : 1,
        active: canCreateActive ? formData.active : false // Force inactive if not admin or tổ trưởng
      };
      
      // Log data for debugging
      console.log('Submitting household data:', householdData);
      console.log('numMembers type:', typeof householdData.numMembers);
      console.log('active value:', householdData.active);
      
      let result;
      if (isEdit) {
        console.log(`Updating household with ID ${id}`);
        result = await updateHousehold(id, householdData);
        console.log('Household updated successfully:', result);
        setSuccess('Cập nhật hộ khẩu thành công');
      } else {
        console.log('Creating new household');
        result = await createHousehold(householdData);
        console.log('Household created successfully:', result);
        setSuccess('Tạo hộ khẩu thành công' + (!canCreateActive ? ' (Đang chờ phê duyệt)' : ''));
      }
      
      // Redirect after successful save
      setTimeout(() => {
        console.log('Redirecting to households list');
        navigate('/households');
      }, 1500);
      
    } catch (err) {
      console.error('Save household error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu thông tin hộ khẩu');
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
        title={isEdit ? 'Chỉnh sửa hộ khẩu' : 'Thêm hộ khẩu'} 
        subtitle={isEdit ? 'Cập nhật thông tin hộ khẩu' : 'Tạo hộ khẩu mới'}
        breadcrumbs={[
          { label: 'Trang chủ', path: '/dashboard' },
          { label: 'Hộ khẩu', path: '/households' },
          { label: isEdit ? 'Chỉnh sửa' : 'Thêm hộ khẩu' }
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
                Thông tin cơ bản
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tên chủ hộ"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số hộ khẩu"
                    name="soHoKhau"
                    value={formData.soHoKhau}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày làm hộ khẩu"
                    name="ngayLamHoKhau"
                    type="date"
                    value={formData.ngayLamHoKhau}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Thông tin liên hệ
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số điện thoại"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Thông tin địa chỉ
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Số nhà"
                    name="soNha"
                    value={formData.soNha}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Đường"
                    name="duong"
                    value={formData.duong}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Phường"
                    name="phuong"
                    value={formData.phuong}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Quận"
                    name="quan"
                    value={formData.quan}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                {canCreateActive && (
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
                {!canCreateActive && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Việc đăng ký hộ gia đình của bạn sẽ cần được quản trị viên phê duyệt.
                    </Alert>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/households')}
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
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu hộ khẩu'
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

export default HouseholdForm;