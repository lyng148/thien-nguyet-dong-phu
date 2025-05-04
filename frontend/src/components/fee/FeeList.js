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
  Refresh as RefreshIcon
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
      await toggleFeeStatus(id, !currentStatus);
      
      // Update the fees state with the new status
      setFees(fees.map(fee => 
        fee.id === id ? { ...fee, active: !currentStatus } : fee
      ));
    } catch (error) {
      console.error(`Toggle fee status ${id} error:`, error);
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
        title="Fees" 
        subtitle="Manage apartment fees and payment schedules"
        actionText="Add Fee"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/fees/add')}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Fees' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search fees..."
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="MANDATORY">Mandatory</MenuItem>
                  <MenuItem value="VOLUNTARY">Voluntary</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="Refresh">
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
                    No fees found.
                  </Typography>
                  {admin && (
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/fees/add')}
                      sx={{ mt: 2 }}
                    >
                      Add Fee
                    </Button>
                  )}
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={fee.type === 'MANDATORY' ? 'Mandatory' : 'Voluntary'} 
                              color={fee.type === 'MANDATORY' ? 'primary' : 'secondary'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">${fee.amount}</TableCell>
                          <TableCell>{formatDate(fee.dueDate)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={fee.active ? 'Active' : 'Inactive'} 
                              color={fee.active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
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
                                <Tooltip title={fee.active ? 'Deactivate' : 'Activate'}>
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
                                
                                <Tooltip title="Delete">
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
          Delete Fee
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-fee-dialog-description">
            Are you sure you want to permanently delete the fee "{feeToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteFee} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeList;