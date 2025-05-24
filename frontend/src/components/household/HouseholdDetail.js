import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Alert,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import {
  getHouseholdById,
  getHouseholdMembers,
  addPersonToHousehold,
  removePersonFromHousehold
} from '../../services/householdService';
import { getAllPeople } from '../../services/personService';
import { getHistoryByHousehold } from '../../services/householdHistoryService';
import PageHeader from '../common/PageHeader';

// TabPanel component for displaying tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`household-tabpanel-${index}`}
      aria-labelledby={`household-tab-${index}`}
      {...other }
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HouseholdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [persons, setPersons] = useState([]);
  const [addForm, setAddForm] = useState({ nhanKhauId: '', relationship: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, memberId: null, memberName: '' });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First fetch the household data
        const householdData = await getHouseholdById(id);
        setHousehold(householdData);
        
        // Try to fetch members
        let memberData = [];
        try {
          memberData = await getHouseholdMembers(id);
          setMembers(Array.isArray(memberData) ? memberData : []);
        } catch (memberErr) {
          console.error('Error loading household members:', memberErr);
          // Continue without throwing
        }
        
        // Try to fetch history, but don't block other functionality if it fails
        try {
          const historyData = await getHistoryByHousehold(id);
          setHistory(Array.isArray(historyData) ? historyData : []);
        } catch (historyErr) {
          console.error('Error loading household history:', historyErr);
          // Just set an empty array if history can't be loaded
          setHistory([]);
        }
        
        // Try to fetch persons list
        try {
          const personList = await getAllPeople();
          setPersons(Array.isArray(personList) ? personList : []);
        } catch (personErr) {
          console.error('Error loading persons list:', personErr);
          // Continue without throwing
          setPersons([]);
        }
      } catch (err) {
        console.error('Error loading household data:', err);
        setError('Failed to load household data. ' + (err.message || ''));
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Handle add member dialog
  const handleOpenAddDialog = () => {
    setAddForm({ nhanKhauId: '', relationship: '', note: '' });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Handle add member submission
  const handleAddMember = async () => {
    setError('');
    try {
      await addPersonToHousehold(id, addForm);
      
      // Refresh members list
      try {
        const updatedMembers = await getHouseholdMembers(id);
        setMembers(Array.isArray(updatedMembers) ? updatedMembers : []);
      } catch (err) {
        console.error('Error refreshing members after adding:', err);
      }
      
      // Refresh history - don't break the flow if this fails
      try {
        const updatedHistory = await getHistoryByHousehold(id);
        setHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
      } catch (err) {
        console.error('Error refreshing history after adding member:', err);
      }
      
      // Close dialog
      handleCloseAddDialog();
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add household member. ' + (err.message || ''));
    }
  };

  // Handle open delete dialog
  const handleOpenDeleteDialog = (memberId, memberName) => {
    setDeleteDialog({
      open: true,
      memberId,
      memberName
    });
  };

  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      memberId: null,
      memberName: ''
    });
  };

  // Handle delete member
  const handleRemoveMember = async () => {
    if (!deleteDialog.memberId) return;
    
    try {
      await removePersonFromHousehold(id, deleteDialog.memberId);
      
      // Refresh members list
      try {
        const updatedMembers = await getHouseholdMembers(id);
        setMembers(Array.isArray(updatedMembers) ? updatedMembers : []);
      } catch (err) {
        console.error('Error refreshing members after removal:', err);
      }
      
      // Refresh history - don't break the flow if this fails
      try {
        const updatedHistory = await getHistoryByHousehold(id);
        setHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
      } catch (err) {
        console.error('Error refreshing history after removing member:', err);
      }
      
      // Close dialog
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove household member. ' + (err.message || ''));
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          Loading household details...
        </Typography>
      </Box>
    );
  }

  if (!household && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Household not found or has been deleted.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          variant="contained" 
          onClick={() => navigate('/households')}
          sx={{ mt: 2 }}
        >
          Back to Households
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Chi tiết hộ khẩu"
        subtitle={`Xem thông tin chi tiết cho hộ khẩu ${household?.ownerName || 'household'}`}
        actionText="Trở về trang Hộ khẩu"
        actionIcon={<ArrowBackIcon />}
        onActionClick={() => navigate('/households')}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Hộ khẩu', path: '/households' },
          { label: 'Chi tiết' }
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin hộ khẩu
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Số hộ khẩu
                </Typography>
                <Typography variant="body1">
                  {household?.soHoKhau || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Chủ hộ
                </Typography>
                <Typography variant="body1">
                  {household?.ownerName}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Địa chỉ
                </Typography>
                <Typography variant="body1">
                  {household?.address}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin liên hệ
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">
                  {household?.phoneNumber || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {household?.email || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip 
                  label={household?.active ? "Hoạt động" : "Không hoạt động"} 
                  color={household?.active ? "success" : "default"}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="household detail tabs">
          <Tab label="Nhân khẩu thuộc hộ khẩu" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Lịch sử hộ khẩu" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Members Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Nhân khẩu ({members.length})
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAddDialog}
            disabled={members.length > 0 && persons.length === members.length}
          >
            Thêm nhân khẩu
          </Button>
        </Box>

        {members.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No household members found.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={handleOpenAddDialog}
            >
              Thêm nhân khẩu đầu tiên
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Relationship</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.hoTen}</TableCell>
                    <TableCell>{member.quanHeVoiChuHo}</TableCell>
                    <TableCell>{member.ghiChu || '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove Member">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(member.id, member.hoTen)}
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
      </TabPanel>

      {/* History Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Lịch sử hộ khẩu ({history.length})
        </Typography>

        {history.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Không tìm thấy lịch sử hộ khẩu.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Loại thay đổi</TableCell>
                  <TableCell>Nhân khẩu</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record, index) => (
                  <TableRow key={record.id || index}>
                    <TableCell>{formatDate(record.changeDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.changeType}
                        color={
                          record.changeType === 'ADD' ? 'success' :
                          record.changeType === 'REMOVE' ? 'error' :
                          record.changeType === 'UPDATE' ? 'info' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.personName || '-'}</TableCell>
                    <TableCell>{record.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Add Member Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm nhân khẩu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Chọn nhân khẩu"
              value={addForm.nhanKhauId}
              onChange={(e) => setAddForm({ ...addForm, nhanKhauId: e.target.value })}
              margin="normal"
              variant="outlined"
              required
            >
              <MenuItem value="">Chọn nhân khẩu</MenuItem>
              {persons && persons.length > 0 ? (
                // Get the list of available people (not already in any household)
                (() => {
                  const availablePeople = persons.filter(person => {
                    // First check if they're already in this household
                    const isInCurrentHousehold = members.some(member => 
                      member.id === person.id || 
                      (person.hoTen && member.hoTen === person.hoTen) ||
                      (person.fullName && member.hoTen === person.fullName)
                    );
                    
                    // Then check if they're already in any household
                    const isInAnyHousehold = person.householdId !== undefined && person.householdId !== null;
                    
                    // Only show people who are not in any household
                    return !isInCurrentHousehold && !isInAnyHousehold;
                  });
                  
                  // If no available people left, show a message
                  if (availablePeople.length === 0) {
                    return [
                      <MenuItem key="no-available" disabled>
                        Tất cả mọi người đã có hộ khẩu hoặc đã được thêm vào hộ khẩu này
                      </MenuItem>
                    ];
                  }
                  
                  // Otherwise, show the list of available people
                  return availablePeople.map(person => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.fullName || person.hoTen || 'Unknown Name'}
                    </MenuItem>
                  ));
                })()
              ) : (
                <MenuItem disabled>Không tìm thấy nhân khẩu khả dụng</MenuItem>
              )}
            </TextField>
            
            <TextField
              fullWidth
              label="Quan hệ với chủ hộ"
              value={addForm.relationship}
              onChange={(e) => setAddForm({ ...addForm, relationship: e.target.value })}
              margin="normal"
              variant="outlined"
              required
              placeholder="e.g., Son, Daughter, Spouse"
            />
            
            <TextField
              fullWidth
              label="Ghi chú (tùy chọn)"
              value={addForm.note}
              onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
              margin="normal"
              variant="outlined"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddMember}
            variant="contained"
            disabled={!addForm.nhanKhauId || !addForm.relationship}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Member Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Loại bỏ thành viên hộ khẩu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn loại bỏ <strong>{deleteDialog.memberName}</strong> khỏi hộ khẩu này? 
            Hành động này sẽ được ghi lại trong lịch sử hộ khẩu.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy bỏ</Button>
          <Button onClick={handleRemoveMember} color="error" variant="contained">
            Loại bỏ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HouseholdDetail;
