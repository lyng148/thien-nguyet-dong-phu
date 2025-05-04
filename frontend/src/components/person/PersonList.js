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
  Person as PersonIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getAllPeople, deletePerson, searchPeople } from '../../services/personService';
import { isAdmin } from '../../utils/auth';

const initialForm = {
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
};

const PersonList = () => {
  const navigate = useNavigate();
  const admin = isAdmin();
  
  // State
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  // Load people function
  const fetchPeople = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPeople();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load people on component mount
  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Handle refresh
  const handleRefresh = () => {
    fetchPeople();
  };

  // Handle create/edit
  const handleOpenForm = (person = null) => {
    if (person) {
      navigate(`/persons/edit/${person.id}`);
    } else {
      navigate('/persons/add');
    }
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
    try {
      // Note: Form submit logic will be implemented in a separate PersonForm component
      // This is just a placeholder
      handleCloseForm();
      // We'll navigate to a dedicated form page instead
      if (editingId) {
        navigate(`/persons/edit/${editingId}`);
      } else {
        navigate('/persons/add');
      }
    } catch (err) {
      setFormError('Không thể lưu nhân khẩu.');
    }
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (person) => {
    setPersonToDelete(person);
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPersonToDelete(null);
  };

  // Handle delete person
  const handleDeletePerson = async () => {
    if (!personToDelete) return;
    
    try {
      setLoading(true);
      await deletePerson(personToDelete.id);
      
      // Remove the person from the state
      setPeople(people.filter(p => p.id !== personToDelete.id));
      
      // Close the dialog
      handleDeleteDialogClose();
    } catch (error) {
      console.error(`Delete person ${personToDelete.id} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (searchTerm.trim() === '') {
        fetchPeople();
      } else {
        const data = await searchPeople(searchTerm);
        setPeople(data);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  // Filter people
  const filteredPeople = people.filter(person => {
    // Gender filter
    const matchesGender = 
      filterGender === 'ALL' || person.gender === filterGender;
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'ALL' || person.status === filterStatus;
    
    return matchesGender && matchesStatus;
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

  return (
    <Box>
      <PageHeader 
        title="Nhân khẩu" 
        subtitle="Quản lý danh sách nhân khẩu trong khu dân cư"
        actionText="Thêm nhân khẩu"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/persons/add')}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Nhân khẩu' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexGrow: 1 }}>
              <TextField
                placeholder="Tìm kiếm theo tên hoặc số CMT..."
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
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={filterGender}
                  label="Giới tính"
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="Nam">Nam</MenuItem>
                  <MenuItem value="Nữ">Nữ</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  <MenuItem value="Thường trú">Thường trú</MenuItem>
                  <MenuItem value="Tạm trú">Tạm trú</MenuItem>
                  <MenuItem value="Tạm vắng">Tạm vắng</MenuItem>
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
              {filteredPeople.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không tìm thấy nhân khẩu nào.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/persons/add')}
                    sx={{ mt: 2 }}
                  >
                    Thêm nhân khẩu
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Ngày sinh</TableCell>
                        <TableCell>Giới tính</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPeople.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell>{person.fullName}</TableCell>
                          <TableCell>{formatDate(person.dateOfBirth)}</TableCell>
                          <TableCell>{person.gender}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Chi tiết/Sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenForm(person)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDialogOpen(person)}
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
        aria-labelledby="delete-person-dialog-title"
        aria-describedby="delete-person-dialog-description"
      >
        <DialogTitle id="delete-person-dialog-title">
          Xóa nhân khẩu
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-person-dialog-description">
            Bạn có chắc chắn muốn xóa nhân khẩu "{personToDelete?.fullName}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePerson} 
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

export default PersonList;
