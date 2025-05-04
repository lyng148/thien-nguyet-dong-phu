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
    fullName: '',
    nickname: '',
    dateOfBirth: '',
    gender: '',
    placeOfBirth: '',
    placeOfOrigin: '',
    currentAddress: '',
    idCardNumber: '',
    idCardIssueDate: '',
    idCardIssuePlace: '',
    ethnicity: '',
    religion: '',
    nationality: 'Việt Nam',
    occupation: '',
    workPlace: '',
    status: 'Thường trú'
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
          
          setFormData({
            fullName: data.fullName || '',
            nickname: data.nickname || '',
            dateOfBirth: data.dateOfBirth ? formatDateForInput(data.dateOfBirth) : '',
            gender: data.gender || '',
            placeOfBirth: data.placeOfBirth || '',
            placeOfOrigin: data.placeOfOrigin || '',
            currentAddress: data.currentAddress || '',
            idCardNumber: data.idCardNumber || '',
            idCardIssueDate: data.idCardIssueDate ? formatDateForInput(data.idCardIssueDate) : '',
            idCardIssuePlace: data.idCardIssuePlace || '',
            ethnicity: data.ethnicity || '',
            religion: data.religion || '',
            nationality: data.nationality || 'Việt Nam',
            occupation: data.occupation || '',
            workPlace: data.workPlace || '',
            status: data.status || 'Thường trú'
          });
        } catch (err) {
          console.error('Error fetching person:', err);
          setError('Error loading person data. Please try again.');
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
      if (!formData.fullName || !formData.dateOfBirth || !formData.gender || !formData.currentAddress) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      // Create person data object
      const personData = {
        fullName: formData.fullName,
        nickname: formData.nickname,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        placeOfBirth: formData.placeOfBirth,
        placeOfOrigin: formData.placeOfOrigin,
        currentAddress: formData.currentAddress,
        idCardNumber: formData.idCardNumber,
        idCardIssueDate: formData.idCardIssueDate,
        idCardIssuePlace: formData.idCardIssuePlace,
        ethnicity: formData.ethnicity,
        religion: formData.religion,
        nationality: formData.nationality,
        occupation: formData.occupation,
        workPlace: formData.workPlace,
        status: formData.status
      };
      
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
      setError(err.message || err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin nhân khẩu');
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
                Thông tin cá nhân
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bí danh (nếu có)"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
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
                      name="gender"
                      value={formData.gender}
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
                    label="Nơi sinh"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nguyên quán"
                    name="placeOfOrigin"
                    value={formData.placeOfOrigin}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Địa chỉ hiện nay"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Thông tin giấy tờ
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Số CMND/CCCD"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Ngày cấp"
                    name="idCardIssueDate"
                    type="date"
                    value={formData.idCardIssueDate}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Nơi cấp"
                    name="idCardIssuePlace"
                    value={formData.idCardIssuePlace}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Thông tin khác
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dân tộc"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tôn giáo"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quốc tịch"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={saving}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Trạng thái"
                      onChange={handleChange}
                    >
                      <MenuItem value="Thường trú">Thường trú</MenuItem>
                      <MenuItem value="Tạm trú">Tạm trú</MenuItem>
                      <MenuItem value="Tạm vắng">Tạm vắng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nghề nghiệp"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    fullWidth
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nơi làm việc"
                    name="workPlace"
                    value={formData.workPlace}
                    onChange={handleChange}
                    fullWidth
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