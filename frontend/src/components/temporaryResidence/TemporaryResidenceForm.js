import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  getTemporaryResidenceById,
  createTemporaryResidence,
  updateTemporaryResidence
} from '../../services/temporaryResidenceService';
import { getAllPeople } from '../../services/personService';

const TemporaryResidenceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    trangThai: '',
    diaChiTamTruTamVang: '',
    thoiGian: '',
    noiDungDeNghi: '',
    personId: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [people, setPeople] = useState([]);

  // Load people for dropdown
  const fetchPeople = useCallback(async () => {
    try {
      const data = await getAllPeople();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  }, []);

  // Load record data if editing
  useEffect(() => {
    const fetchRecord = async () => {
      if (isEdit) {
        try {
          setLoading(true);
          const data = await getTemporaryResidenceById(id);
          
          setFormData({
            trangThai: data.trangThai || '',
            diaChiTamTruTamVang: data.diaChiTamTruTamVang || '',
            thoiGian: data.thoiGian ? formatDateForInput(data.thoiGian) : '',
            noiDungDeNghi: data.noiDungDeNghi || '',
            personId: data.personId || ''
          });
        } catch (err) {
          console.error('Error fetching temporary residence record:', err);
          setError('Error loading record data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    Promise.all([fetchRecord(), fetchPeople()]);
  }, [isEdit, id, fetchPeople]);

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
      // Validate required fields
      if (!formData.trangThai || !formData.diaChiTamTruTamVang || !formData.thoiGian || !formData.personId) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      // Create temporary residence data object
      const submitData = {
        trangThai: formData.trangThai,
        diaChiTamTruTamVang: formData.diaChiTamTruTamVang,
        thoiGian: formData.thoiGian,
        noiDungDeNghi: formData.noiDungDeNghi || '',
        personId: formData.personId
      };
      
      console.log('Submitting form data:', submitData); // Log data before submission
      
      let result;
      if (isEdit) {
        result = await updateTemporaryResidence(id, submitData);
        console.log('Temporary residence record updated successfully:', result);
        setSuccess('Cập nhật thông tin tạm trú/tạm vắng thành công');
      } else {
        result = await createTemporaryResidence(submitData);
        console.log('Temporary residence record created successfully:', result);
        setSuccess('Thêm mới thông tin tạm trú/tạm vắng thành công');
      }
      
      // Redirect after successful save
      setTimeout(() => {
        navigate('/temporary-residence');
      }, 1500);
      
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Không thể lưu thông tin tạm trú/tạm vắng');
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
        title={isEdit ? 'Sửa thông tin tạm trú/tạm vắng' : 'Thêm thông tin tạm trú/tạm vắng'} 
        subtitle={isEdit ? 'Cập nhật thông tin tạm trú/tạm vắng' : 'Đăng ký mới thông tin tạm trú/tạm vắng'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Tạm trú/Tạm vắng', path: '/temporary-residence' },
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
                Thông tin tạm trú/tạm vắng
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      name="trangThai"
                      value={formData.trangThai}
                      label="Trạng thái"
                      onChange={handleChange}
                      disabled={saving}
                    >
                      <MenuItem value="TAM_TRU">Tạm trú</MenuItem>
                      <MenuItem value="TAM_VANG">Tạm vắng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Nhân khẩu</InputLabel>
                    <Select
                      name="personId"
                      value={formData.personId}
                      label="Nhân khẩu"
                      onChange={handleChange}
                      disabled={saving}
                    >
                      <MenuItem value="">-- Chọn nhân khẩu --</MenuItem>
                      {people.map(person => (
                        <MenuItem key={person.id} value={person.id}>{person.fullName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Địa chỉ tạm trú/tạm vắng"
                    name="diaChiTamTruTamVang"
                    value={formData.diaChiTamTruTamVang}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    disabled={saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Thời gian"
                    name="thoiGian"
                    type="date"
                    value={formData.thoiGian}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Nội dung đề nghị"
                    name="noiDungDeNghi"
                    value={formData.noiDungDeNghi}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    disabled={saving}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/temporary-residence')}
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

export default TemporaryResidenceForm;