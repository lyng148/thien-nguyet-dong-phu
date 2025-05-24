import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  IconButton,
  Button,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
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
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getAllFees, toggleFeeStatus, deleteFee } from '../../services/feeService';
import { isAdmin } from '../../utils/auth';

const FeeList = () => {
  const navigate = useNavigate();
  const admin = isAdmin();

  // State
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);

  // Load fees function
  const fetchFees = useCallback(async () => {
    try {
      console.log('Fetching fees...');
      setLoading(true);
      const data = await getAllFees(); // We already modified feeService to always include showAll=true
      console.log('Fetched fees data:', JSON.stringify(data));
      
      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        setFees([]);
        return;
      }
      
      // Check if any fees have circular references
      data.forEach(fee => {
        if (fee && fee.payments) {
          console.log(`Fee ${fee.id} - ${fee.name} has ${fee.payments.length} payments`);
        }
      });
      
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load fees on component mount
  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  // Handle refresh
  const handleRefresh = () => {
    fetchFees();
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/fees/edit/${id}`);
  };

  // Handle status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      console.log(`Toggling fee ${id} from ${currentStatus ? 'active' : 'inactive'} to ${!currentStatus ? 'active' : 'inactive'}`);
      
      // Call the API to toggle the fee status
      const newStatus = !currentStatus;
      await toggleFeeStatus(id, newStatus);
      
      console.log(`Successfully toggled fee ${id} to ${newStatus ? 'active' : 'inactive'}`);
      
      // Update the fees state with the new status
      setFees(fees.map(fee => 
        fee.id === id ? { ...fee, active: newStatus } : fee
      ));
    } catch (error) {
      console.error(`Toggle fee status ${id} error:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      // Refresh the list to get the current state from the server
      fetchFees();
    }
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (fee) => {
    setFeeToDelete(fee);
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setFeeToDelete(null);
  };

  // Handle delete fee
  const handleDeleteFee = async () => {
    if (!feeToDelete) return;
    
    try {
      setLoading(true);
      await deleteFee(feeToDelete.id);
      
      // Remove the fee from the state completely
      setFees(fees.filter(fee => fee.id !== feeToDelete.id));
      
      // Close the dialog
      handleDeleteDialogClose();
    } catch (error) {
      console.error(`Delete fee ${feeToDelete.id} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Filter fees
  const filteredFees = fees.filter(fee => {
    // Search term filter
    const matchesSearch = 
      fee.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = 
      filterType === 'ALL' || fee.type === filterType;
    
    // Status filter - leave this as is to respect user's filter choice
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && fee.active) || 
      (filterStatus === 'INACTIVE' && !fee.active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
        title="Quản lý khoản thu" 
        subtitle="Quản lý các khoản thu chung cư và lịch thanh toán"
        actionText="Thêm khoản thu"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/fees/add')}
        breadcrumbs={[
          { label: 'Trang chủ', path: '/dashboard' },
          { label: 'Quản lý khoản thu' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <TextField
              placeholder="Tìm kiếm khoản thu..."
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
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Loại phí</InputLabel>
                <Select
                  value={filterType}
                  label="Loại phí"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả loại</MenuItem>
                  <MenuItem value="MANDATORY">Bắt buộc</MenuItem>
                  <MenuItem value="VOLUNTARY">Tự nguyện</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                  <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
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
              {filteredFees.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không tìm thấy khoản thu nào.
                  </Typography>
                  {admin && (
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/fees/add')}
                      sx={{ mt: 2 }}
                    >
                      Thêm khoản thu
                    </Button>
                  )}
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên khoản thu</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell>Hạn thanh toán</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={fee.type === 'MANDATORY' ? 'Bắt buộc' : 'Tự nguyện'} 
                              color={fee.type === 'MANDATORY' ? 'primary' : 'secondary'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{fee.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                          <TableCell>{formatDate(fee.dueDate)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={fee.active ? 'Đang hoạt động' : 'Ngừng hoạt động'} 
                              color={fee.active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/fees/detail/${fee.id}`)}
                                sx={{ mr: 1 }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(fee.id)}
                                disabled={!admin}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {admin && (
                              <>
                                <Tooltip title={fee.active ? 'Ngừng hoạt động' : 'Kích hoạt'}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleStatus(fee.id, fee.active)}
                                    color={fee.active ? 'default' : 'success'}
                                  >
                                    {fee.active ? 
                                      <InactiveIcon fontSize="small" /> : 
                                      <ActiveIcon fontSize="small" />
                                    }
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Xóa">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteDialogOpen(fee)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
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
        aria-labelledby="delete-fee-dialog-title"
        aria-describedby="delete-fee-dialog-description"
      >
        <DialogTitle id="delete-fee-dialog-title">
          Xóa khoản thu
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-fee-dialog-description">
            Bạn có chắc chắn muốn xóa vĩnh viễn khoản thu "{feeToDelete?.name}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteFee} 
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

export default FeeList;