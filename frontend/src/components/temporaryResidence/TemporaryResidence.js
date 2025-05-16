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
  Refresh as RefreshIcon,
  AssignmentInd as ResidenceIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  getAllTemporaryResidences,
  deleteTemporaryResidence,
  getTemporaryResidenceByPerson
} from '../../services/temporaryResidenceService';
import { getAllPeople } from '../../services/personService';

const TemporaryResidence = () => {
  const navigate = useNavigate();
  
  // State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [searchPersonId, setSearchPersonId] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Load records function
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTemporaryResidences();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching temporary residence records:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load people for dropdown
  const fetchPeople = useCallback(async () => {
    try {
      const data = await getAllPeople();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    Promise.all([fetchRecords(), fetchPeople()]);
  }, [fetchRecords, fetchPeople]);

  // Handle refresh
  const handleRefresh = () => {
    fetchRecords();
  };

  // Handle search by person
  const handleSearchByPerson = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!searchPersonId || searchPersonId === '') {
        await fetchRecords();
      } else {
        const data = await getTemporaryResidenceByPerson(searchPersonId);
        if (Array.isArray(data)) {
          setRecords(data);
        } else {
          console.error('Unexpected response format:', data);
          setRecords([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle create/edit
  const handleOpenForm = (record = null) => {
    if (record) {
      navigate(`/temporary-residence/edit/${record.id}`);
    } else {
      navigate('/temporary-residence/add');
    }
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // Handle delete record
  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    
    try {
      setLoading(true);
      await deleteTemporaryResidence(recordToDelete.id);
      
      // Remove the record from the state
      setRecords(records.filter(r => r.id !== recordToDelete.id));
      
      // Close the dialog
      handleDeleteDialogClose();
    } catch (error) {
      console.error(`Delete record ${recordToDelete.id} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Filter records by document type
  const filteredRecords = records.filter(record => {
    return filterType === 'ALL' || record.trangThai === filterType;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get person name by ID
  const getPersonName = (personId) => {
    const person = people.find(p => p.id === personId);
    return person ? person.fullName : 'Unknown';
  };

  return (
    <Box>
      <PageHeader 
        title="Tạm trú/Tạm vắng" 
        subtitle="Quản lý đăng ký tạm trú, tạm vắng trong khu dân cư"
        actionText="Thêm mới"
        actionIcon={<AddIcon />}
        onActionClick={() => handleOpenForm()}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Tạm trú/Tạm vắng' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <form onSubmit={handleSearchByPerson} style={{ display: 'flex', flexGrow: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Tìm theo nhân khẩu</InputLabel>
                <Select
                  value={searchPersonId}
                  label="Tìm theo nhân khẩu"
                  onChange={(e) => setSearchPersonId(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
                  {people.map(person => (
                    <MenuItem key={person.id} value={person.id}>{person.fullName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" sx={{ ml: 1 }}>Tìm kiếm</Button>
              <Button type="button" variant="outlined" sx={{ ml: 1 }} onClick={() => { setSearchPersonId(''); fetchRecords(); }}>Làm mới</Button>
            </form>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterType}
                  label="Trạng thái"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="TAM_TRU">Tạm trú</MenuItem>
                  <MenuItem value="TAM_VANG">Tạm vắng</MenuItem>
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
              {filteredRecords.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không tìm thấy bản ghi nào.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    sx={{ mt: 2 }}
                  >
                    Thêm mới
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Địa chỉ</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Nội dung đề nghị</TableCell>
                        <TableCell>Nhân khẩu</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.trangThai === 'TAM_TRU' ? 'Tạm trú' : 'Tạm vắng'}</TableCell>
                          <TableCell>{record.diaChiTamTruTamVang}</TableCell>
                          <TableCell>{formatDate(record.thoiGian)}</TableCell>
                          <TableCell>{record.noiDungDeNghi}</TableCell>
                          <TableCell>{record.personName || getPersonName(record.personId)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenForm(record)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDialogOpen(record)}
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
        aria-labelledby="delete-record-dialog-title"
        aria-describedby="delete-record-dialog-description"
      >
        <DialogTitle id="delete-record-dialog-title">
          Xóa bản ghi
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-record-dialog-description">
            Bạn có chắc chắn muốn xóa bản ghi tạm trú/tạm vắng này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteRecord} 
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

export default TemporaryResidence;
