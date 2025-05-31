import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  LinearProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { 
  getAllVehicles, 
  deleteVehicle, 
  searchVehicles,
  VEHICLE_TYPES,
  MONTHLY_FEES 
} from '../../services/vehicleService';
import { getAllHouseholds } from '../../services/householdService';
import { formatCurrency } from '../../services/feePaymentService';

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterHousehold, setFilterHousehold] = useState('ALL');
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, filterType, filterHousehold]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesData, householdsData] = await Promise.all([
        getAllVehicles(),
        getAllHouseholds()
      ]);
      setVehicles(vehiclesData);
      setHouseholds(householdsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by vehicle type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(vehicle => vehicle.vehicleType === filterType);
    }

    // Filter by household
    if (filterHousehold !== 'ALL') {
      filtered = filtered.filter(vehicle => vehicle.householdId === parseInt(filterHousehold));
    }

    setFilteredVehicles(filtered);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLoading(true);
      try {
        const results = await searchVehicles(searchTerm);
        setFilteredVehicles(results);
      } catch (error) {
        console.error('Error searching vehicles:', error);
      }
      setLoading(false);
    } else {
      setFilteredVehicles(vehicles);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterHousehold('ALL');
    loadData();
  };

  const handleDeleteDialogOpen = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      await deleteVehicle(vehicleToDelete.id);
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleOpenForm = (vehicle = null) => {
    if (vehicle) {
      navigate(`/vehicles/edit/${vehicle.id}`);
    } else {
      navigate('/vehicles/add');
    }
  };

  const getHouseholdNumber = (householdId) => {
    const household = households.find(h => h.id === householdId);
    return household ? household.householdNumber : 'N/A';
  };

  const getVehicleTypeLabel = (type) => {
    return VEHICLE_TYPES[type] || type;
  };

  const getMonthlyFee = (vehicleType) => {
    return MONTHLY_FEES[vehicleType] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box>
      <PageHeader 
        title="Quản lý xe" 
        subtitle="Quản lý thông tin xe của các hộ gia đình"
        actionText="Thêm xe"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/vehicles/add')}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Quản lý xe' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexGrow: 1 }}>
              <TextField
                placeholder="Tìm kiếm theo biển số, hãng xe, mẫu xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" sx={{ ml: 1 }}>Tìm kiếm</Button>
            </form>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Loại xe</InputLabel>
                <Select
                  value={filterType}
                  label="Loại xe"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Hộ gia đình</InputLabel>
                <Select
                  value={filterHousehold}
                  label="Hộ gia đình"
                  onChange={(e) => setFilterHousehold(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {households.map(household => (
                    <MenuItem key={household.id} value={household.id}>
                      {household.householdNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Tooltip title="Làm mới">
                <IconButton 
                  onClick={handleRefresh} 
                  color="primary"
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {filteredVehicles.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không tìm thấy xe nào.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/vehicles/add')}
                    sx={{ mt: 2 }}
                  >
                    Thêm xe
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Biển số xe</TableCell>
                        <TableCell>Loại xe</TableCell>
                        <TableCell>Hãng xe</TableCell>
                        <TableCell>Hộ gia đình</TableCell>
                        <TableCell>Phí hàng tháng</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <Box sx={{ fontWeight: 'bold' }}>
                              {vehicle.licensePlate}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getVehicleTypeLabel(vehicle.vehicleType)}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                          <TableCell>{getHouseholdNumber(vehicle.householdId)}</TableCell>
                          <TableCell>
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatCurrency(getMonthlyFee(vehicle.vehicleType))}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/vehicles/detail/${vehicle.id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenForm(vehicle)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDialogOpen(vehicle)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-vehicle-dialog-title"
        aria-describedby="delete-vehicle-dialog-description"
      >
        <DialogTitle id="delete-vehicle-dialog-title">
          Xóa xe
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-vehicle-dialog-description">
            Bạn có chắc chắn muốn xóa xe "{vehicleToDelete?.licensePlate}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteVehicle} 
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

export default VehicleList;
