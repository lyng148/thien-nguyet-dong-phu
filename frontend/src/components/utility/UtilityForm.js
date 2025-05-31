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
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ElectricBolt as ElectricIcon,
  Water as WaterIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  createUtilityBill,
  updateUtilityBill,
  getUtilityBillById,
  SERVICE_TYPES
} from '../../services/utilityService';
import { getAllHouseholds } from '../../services/householdService';

const UtilityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    loaiDichVu: '',
    serviceType: '',
    thang: new Date().getMonth() + 1,
    month: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    year: new Date().getFullYear(),
    chiSoCu: 0,
    oldReading: 0,
    chiSoMoi: 0,
    newReading: 0,
    soTien: 0,
    amount: 0,
    donViTinh: '',
    unit: '',
    hoKhauId: '',
    householdId: '',
    ghiChu: '',
    notes: ''
  });

  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const householdsData = await getAllHouseholds();
        setHouseholds(householdsData);
        
        if (isEdit) {
          const utilityData = await getUtilityBillById(id);
          setFormData({
            loaiDichVu: utilityData.loaiDichVu || utilityData.serviceType || '',
            serviceType: utilityData.serviceType || utilityData.loaiDichVu || '',
            thang: utilityData.thang || utilityData.month || new Date().getMonth() + 1,
            month: utilityData.month || utilityData.thang || new Date().getMonth() + 1,
            nam: utilityData.nam || utilityData.year || new Date().getFullYear(),
            year: utilityData.year || utilityData.nam || new Date().getFullYear(),
            chiSoCu: utilityData.chiSoCu || utilityData.oldReading || 0,
            oldReading: utilityData.oldReading || utilityData.chiSoCu || 0,
            chiSoMoi: utilityData.chiSoMoi || utilityData.newReading || 0,
            newReading: utilityData.newReading || utilityData.chiSoMoi || 0,
            soTien: utilityData.soTien || utilityData.amount || 0,
            amount: utilityData.amount || utilityData.soTien || 0,
            donViTinh: utilityData.donViTinh || utilityData.unit || '',
            unit: utilityData.unit || utilityData.donViTinh || '',
            hoKhauId: utilityData.hoKhauId || utilityData.householdId || '',
            householdId: utilityData.householdId || utilityData.hoKhauId || '',
            ghiChu: utilityData.ghiChu || utilityData.notes || '',
            notes: utilityData.notes || utilityData.ghiChu || ''
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.loaiDichVu) {
      setError('Vui lòng chọn loại dịch vụ');
      return;
    }
    
    if (!formData.hoKhauId) {
      setError('Vui lòng chọn hộ khẩu');
      return;
    }
    
    if (formData.soTien <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      if (isEdit) {
        await updateUtilityBill(id, formData);
        setSuccess('Cập nhật hóa đơn dịch vụ thành công!');
      } else {
        await createUtilityBill(formData);
        setSuccess('Tạo hóa đơn dịch vụ thành công!');
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/utilities');
      }, 2000);
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Update both Vietnamese and English field names
    const updates = { [name]: value };
    
    // Map field relationships
    const fieldMappings = {
      loaiDichVu: 'serviceType',
      serviceType: 'loaiDichVu',
      thang: 'month',
      month: 'thang',
      nam: 'year',
      year: 'nam',
      chiSoCu: 'oldReading',
      oldReading: 'chiSoCu',
      chiSoMoi: 'newReading',
      newReading: 'chiSoMoi',
      soTien: 'amount',
      amount: 'soTien',
      donViTinh: 'unit',
      unit: 'donViTinh',
      hoKhauId: 'householdId',
      householdId: 'hoKhauId',
      ghiChu: 'notes',
      notes: 'ghiChu'
    };
    
    if (fieldMappings[name]) {
      updates[fieldMappings[name]] = value;
    }
    
    // Auto-calculate usage and amount for metered services
    if (name === 'chiSoMoi' || name === 'newReading') {
      const newReading = parseInt(value) || 0;
      const oldReading = parseInt(formData.chiSoCu || formData.oldReading) || 0;
      const usage = Math.max(0, newReading - oldReading);
      
      // Auto-calculate amount based on service type and usage
      let unitPrice = 0;
      if (formData.loaiDichVu === 'DIEN' || formData.serviceType === 'DIEN') {
        unitPrice = Math.floor(Math.random() * 1000) + 2500; // 2500-3500 per kWh
      } else if (formData.loaiDichVu === 'NUOC' || formData.serviceType === 'NUOC') {
        unitPrice = Math.floor(Math.random() * 5000) + 15000; // 15000-20000 per m3
      }
      
      if (unitPrice > 0) {
        const calculatedAmount = usage * unitPrice;
        updates.soTien = calculatedAmount;
        updates.amount = calculatedAmount;
      }
    }
    
    // Set default unit based on service type
    if (name === 'loaiDichVu' || name === 'serviceType') {
      if (value === 'DIEN') {
        updates.donViTinh = 'kWh';
        updates.unit = 'kWh';
      } else if (value === 'NUOC') {
        updates.donViTinh = 'm3';
        updates.unit = 'm3';
      } else if (value === 'INTERNET') {
        updates.donViTinh = 'Gói';
        updates.unit = 'Gói';
        // Fixed price for internet
        updates.soTien = Math.floor(Math.random() * 200000) + 300000; // 300k-500k
        updates.amount = updates.soTien;
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
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

  const isMeteredService = (type) => {
    return type === 'DIEN' || type === 'NUOC';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Chỉnh sửa hóa đơn dịch vụ' : 'Thêm hóa đơn dịch vụ'}
        subtitle={isEdit ? 'Cập nhật thông tin hóa đơn dịch vụ' : 'Tạo hóa đơn dịch vụ mới'}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/utilities')}
          >
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Service Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Loại dịch vụ</InputLabel>
                  <Select
                    name="loaiDichVu"
                    value={formData.loaiDichVu}
                    onChange={handleChange}
                    label="Loại dịch vụ"
                  >
                    {Object.entries(SERVICE_TYPES).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(key)}
                          {label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Household */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Hộ khẩu</InputLabel>
                  <Select
                    name="hoKhauId"
                    value={formData.hoKhauId}
                    onChange={handleChange}
                    label="Hộ khẩu"
                  >
                    {households.map((household) => (
                      <MenuItem key={household.id} value={household.id}>
                        {household.householdNumber} - {household.ownerName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Month and Year */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Tháng"
                  name="thang"
                  value={formData.thang}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 12 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Năm"
                  name="nam"
                  value={formData.nam}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 2020, max: 2030 }}
                />
              </Grid>

              {/* Metered Service Fields */}
              {isMeteredService(formData.loaiDichVu) && (
                <>
                  <Grid item xs={12}>
                    <Divider>
                      <Typography variant="body2" color="text.secondary">
                        Thông tin chỉ số
                      </Typography>
                    </Divider>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Chỉ số cũ"
                      name="chiSoCu"
                      value={formData.chiSoCu}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{formData.donViTinh}</InputAdornment>
                      }}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Chỉ số mới"
                      name="chiSoMoi"
                      value={formData.chiSoMoi}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{formData.donViTinh}</InputAdornment>
                      }}
                      inputProps={{ min: formData.chiSoCu || 0 }}
                    />
                  </Grid>
                </>
              )}

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Số tiền"
                  name="soTien"
                  value={formData.soTien}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Unit */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Đơn vị tính"
                  name="donViTinh"
                  value={formData.donViTinh}
                  onChange={handleChange}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ghi chú"
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleChange}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/utilities')}
                    disabled={saving}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UtilityForm;
