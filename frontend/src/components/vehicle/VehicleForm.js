import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  createVehicle,
  updateVehicle,
  getVehicleById,
  checkLicensePlateUnique,
  VEHICLE_TYPES
} from '../../services/vehicleService';
import { getAllHouseholds } from '../../services/householdService';

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    bienSoXe: '',
    licensePlate: '',
    loaiXe: '',
    vehicleType: '',
    hangXe: '',
    brand: '',
    mauXe: '',
    model: '',
    namSanXuat: new Date().getFullYear(),
    year: new Date().getFullYear(),
    mauSac: '',
    color: '',
    hoKhauId: '',
    householdId: '',
    ghiChu: '',
    notes: ''
  });
  
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadHouseholds();
    if (isEdit) {
      loadVehicleData();
    }
  }, [id, isEdit]);

  const loadHouseholds = async () => {
    try {
      const householdsData = await getAllHouseholds();
      setHouseholds(householdsData);
    } catch (error) {
      console.error('Error loading households:', error);
      setError('Không thể tải danh sách hộ gia đình');
    }
  };

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const vehicleData = await getVehicleById(id);
      setFormData(vehicleData);
    } catch (error) {
      console.error('Error loading vehicle data:', error);
      setError('Không thể tải thông tin xe');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Sync Vietnamese and English field names
      ...(name === 'bienSoXe' && { licensePlate: value }),
      ...(name === 'licensePlate' && { bienSoXe: value }),
      ...(name === 'loaiXe' && { vehicleType: value }),
      ...(name === 'vehicleType' && { loaiXe: value }),
      ...(name === 'hangXe' && { brand: value }),
      ...(name === 'brand' && { hangXe: value }),
      ...(name === 'mauXe' && { model: value }),
      ...(name === 'model' && { mauXe: value }),
      ...(name === 'namSanXuat' && { year: value }),
      ...(name === 'year' && { namSanXuat: value }),
      ...(name === 'mauSac' && { color: value }),
      ...(name === 'color' && { mauSac: value }),
      ...(name === 'hoKhauId' && { householdId: value }),
      ...(name === 'householdId' && { hoKhauId: value }),
      ...(name === 'ghiChu' && { notes: value }),
      ...(name === 'notes' && { ghiChu: value })
    }));
  };

  const validateForm = async () => {
    if (!formData.bienSoXe.trim()) {
      setError('Vui lòng nhập biển số xe');
      return false;
    }

    if (!formData.loaiXe) {
      setError('Vui lòng chọn loại xe');
      return false;
    }

    if (!formData.hangXe.trim()) {
      setError('Vui lòng nhập hãng xe');
      return false;
    }

    if (!formData.hoKhauId) {
      setError('Vui lòng chọn hộ gia đình');
      return false;
    }

    // Check license plate uniqueness
    const isUnique = await checkLicensePlateUnique(
      formData.bienSoXe, 
      isEdit ? parseInt(id) : null
    );
    
    if (!isUnique) {
      setError('Biển số xe đã tồn tại trong hệ thống');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!(await validateForm())) {
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateVehicle(id, formData);
        setSuccess('Cập nhật thông tin xe thành công!');
      } else {
        await createVehicle(formData);
        setSuccess('Thêm xe mới thành công!');
      }
      
      setTimeout(() => {
        navigate('/vehicles');
      }, 1500);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Có lỗi xảy ra khi lưu thông tin xe. Vui lòng thử lại.');
    }
    setSaving(false);
  };

  const getHouseholdDisplayName = (household) => {
    console.log('household', household);
    return `${household.ownerName} (${household.address})`;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <Box>
      <PageHeader 
        title={isEdit ? 'Sửa thông tin xe' : 'Thêm xe mới'} 
        subtitle={isEdit ? 'Cập nhật thông tin xe' : 'Đăng ký xe mới cho hộ gia đình'}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Quản lý xe', path: '/vehicles' },
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
                Thông tin xe
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Biển số xe"
                    name="bienSoXe"
                    value={formData.bienSoXe}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    disabled={saving}
                    placeholder="VD: 30A-12345"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Loại xe</InputLabel>
                    <Select
                      name="loaiXe"
                      value={formData.loaiXe}
                      label="Loại xe"
                      onChange={handleChange}
                      disabled={saving}
                    >
                      {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Hãng xe"
                    name="hangXe"
                    value={formData.hangXe}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    disabled={saving}
                    placeholder="VD: Honda, Toyota, Yamaha..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mẫu xe"
                    name="mauXe"
                    value={formData.mauXe}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    disabled={saving}
                    placeholder="VD: Civic, Vios, Exciter..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Năm sản xuất</InputLabel>
                    <Select
                      name="namSanXuat"
                      value={formData.namSanXuat}
                      label="Năm sản xuất"
                      onChange={handleChange}
                      disabled={saving}
                    >
                      {years.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Màu sắc"
                    name="mauSac"
                    value={formData.mauSac}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    disabled={saving}
                    placeholder="VD: Trắng, Đen, Đỏ..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Hộ gia đình</InputLabel>
                    <Select
                      name="hoKhauId"
                      value={formData.hoKhauId}
                      label="Hộ gia đình"
                      onChange={handleChange}
                      disabled={saving}
                    >
                      <MenuItem value="">-- Chọn hộ gia đình --</MenuItem>
                      {households.map(household => (
                        <MenuItem key={household.id} value={household.id}>
                          {getHouseholdDisplayName(household)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Ghi chú"
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    disabled={saving}
                    placeholder="Thông tin bổ sung về xe..."
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/vehicles')}
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

export default VehicleForm;
