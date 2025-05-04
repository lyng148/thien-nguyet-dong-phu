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
  DialogTitle,
  Grid,
  Alert
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
  createTemporaryResidence,
  updateTemporaryResidence,
  deleteTemporaryResidence,
  getTemporaryResidenceByPerson
} from '../../services/temporaryResidenceService';
import { getAllPeople } from '../../services/personService';

const initialForm = {
  trangThai: '',
  diaChiTamTruTamVang: '',
  thoiGian: '',
  noiDungDeNghi: '',
  personId: ''
};

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
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

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
      if (!searchPersonId) {
        fetchRecords();
      } else {
        const data = await getTemporaryResidenceByPerson(searchPersonId);
        setRecords(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create/edit form
  const handleOpenForm = (record = null) => {
    if (record) {
      setForm({
        trangThai: record.trangThai || '',
        diaChiTamTruTamVang: record.diaChiTamTruTamVang || '',
        thoiGian: record.thoiGian || '',
        noiDungDeNghi: record.noiDungDeNghi || '',
        personId: record.personId || ''
      });
      setEditingId(record.id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
    setFormDialogOpen(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setFormDialogOpen(false);
    setFormError('');
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate required fields
    if (!form.trangThai || !form.diaChiTamTruTamVang || !form.thoiGian || !form.personId) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      console.log('Submitting form data:', form); // Log form data before submission
      const submitData = {
        trangThai: form.trangThai,
        diaChiTamTruTamVang: form.diaChiTamTruTamVang,
        thoiGian: form.thoiGian,
        noiDungDeNghi: form.noiDungDeNghi || '',
        personId: form.personId
      };
      console.log('Mapped backend data:', submitData); // Log backend data after mapping
      
      if (editingId) {
        await updateTemporaryResidence(editingId, submitData);
      } else {
        await createTemporaryResidence(submitData);
      }
      handleCloseForm();
      fetchRecords();
    } catch (error) {
      console.error('Submit error:', error);
      setFormError('Không thể lưu thông tin tạm trú/tạm vắng. Chi tiết: ' + (error.message || ''));
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
      
      {/* Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingId ? 'Sửa' : 'Thêm'} thông tin tạm trú/tạm vắng</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {formError && (
              <Box mb={2}>
                <Alert severity="error">{formError}</Alert>
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="trangThai"
                    value={form.trangThai}
                    label="Trạng thái"
                    onChange={handleChange}
                  >
                    <MenuItem value="TAM_TRU">Tạm trú</MenuItem>
                    <MenuItem value="TAM_VANG">Tạm vắng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Địa chỉ tạm trú/tạm vắng"
                  name="diaChiTamTruTamVang"
                  value={form.diaChiTamTruTamVang}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Thời gian"
                  name="thoiGian"
                  type="date"
                  value={form.thoiGian}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Nhân khẩu</InputLabel>
                  <Select
                    name="personId"
                    value={form.personId}
                    label="Nhân khẩu"
                    onChange={handleChange}
                  >
                    <MenuItem value="">-- Chọn nhân khẩu --</MenuItem>
                    {people.map(person => (
                      <MenuItem key={person.id} value={person.id}>{person.fullName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Nội dung đề nghị"
                  name="noiDungDeNghi"
                  value={form.noiDungDeNghi}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Hủy</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
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
