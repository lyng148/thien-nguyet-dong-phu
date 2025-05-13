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
  Alert,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getPersonById, createPerson, updatePerson } from '../../services/personService';
import { isAdmin } from '../../utils/auth';

const PersonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const admin = isAdmin();
  
  // Form state
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: '',
    danToc: '',
    tonGiao: '',
    cccd: '',
    ngayCap: '',
    noiCap: '',
    ngheNghiep: '',
    ghiChu: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load person data if editing
  useEffect(() => {
    const fetchPerson = async () => {
      if (isEdit) {
        try {
          setLoading(true);
          const data = await getPersonById(id);
          
          if (data) {
            console.log("Received person data:", data);
            setFormData({
              hoTen: data.hoTen || '',
              ngaySinh: data.ngaySinh ? formatDateForInput(data.ngaySinh) : '',
              gioiTinh: data.gioiTinh || '',
              danToc: data.danToc || '',
              tonGiao: data.tonGiao || '',
              cccd: data.cccd || '',
              ngayCap: data.ngayCap ? formatDateForInput(data.ngayCap) : '',
              noiCap: data.noiCap || '',
              ngheNghiep: data.ngheNghiep || '',
              ghiChu: data.ghiChu || ''
            });
          } else {
            setError('Không tìm thấy thông tin nhân khẩu.');
          }
        } catch (err) {
          console.error('Error fetching person:', err);
          setError('Lỗi khi tải thông tin nhân khẩu. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPerson();
  }, [isEdit, id]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      // Validate form data
      if (!formData.hoTen || !formData.ngaySinh || !formData.gioiTinh) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      // Create person data object
      const personData = {
        hoTen: formData.hoTen,
        ngaySinh: formData.ngaySinh,
        gioiTinh: formData.gioiTinh,
        danToc: formData.danToc,
        tonGiao: formData.tonGiao,
        cccd: formData.cccd,
        ngayCap: formData.ngayCap,
        noiCap: formData.noiCap,
        ngheNghiep: formData.ngheNghiep,
        ghiChu: formData.ghiChu
      };
      
      console.log('Submitting person data:', personData);
      
      let result;
      if (isEdit) {
        result = await updatePerson(id, personData);
        console.log('Person updated successfully:', result);
        setSuccess('Cập nhật nhân khẩu thành công');
      } else {
        result = await createPerson(personData);
        console.log('Person created successfully:', result);
        setSuccess('Thêm nhân khẩu thành công');
      }
      
      // Redirect after successful save
      setTimeout(() => {
        navigate('/persons');
      }, 1500);
      
    } catch (err) {
      console.error('Save person error:', err);
      setError(err.message || (err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin nhân khẩu'));
    } finally {
      setSaving(false);
    }
  };

  // Format date for input
  function formatDateForInput(dateValue) {
    if (!dateValue) return '';
    
    try {
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
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date value:', dateValue);
        return '';
      }
      
      // Get year, month, and day
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Return in YYYY-MM-DD format
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return '';
    }
  }

  return (
    <Box>
      <PageHeader 
        title={isEdit ? 'Sửa Nhân khẩu' : 'Thêm Nhân khẩu'} 
        subtitle={isEdit ? 'Cập nhật thông tin nhân khẩu' : 'Thêm mới thông tin nhân khẩu'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Nhân khẩu', path: '/persons' },
          { label: isEdit ? 'Sửa' : 'Thêm' }
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
                Thông tin nhân khẩu
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Họ và tên"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày sinh"
                    name="ngaySinh"
                    type="date"
                    value={formData.ngaySinh}
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
                  <FormControl fullWidth required disabled={saving}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      name="gioiTinh"
                      value={formData.gioiTinh}
                      label="Giới tính"
                      onChange={handleChange}
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                      <MenuItem value="Khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dân tộc"
                    name="danToc"
                    value={formData.danToc}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tôn giáo"
                    name="tonGiao"
                    value={formData.tonGiao}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số CCCD"
                    name="cccd"
                    value={formData.cccd}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày cấp"
                    name="ngayCap"
                    type="date"
                    value={formData.ngayCap}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nơi cấp"
                    name="noiCap"
                    value={formData.noiCap}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nghề nghiệp"
                    name="ngheNghiep"
                    value={formData.ngheNghiep}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Ghi chú"
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={saving}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/persons')}
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
                    isEdit ? 'Cập nhật' : 'Thêm mới'
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

export default PersonForm;