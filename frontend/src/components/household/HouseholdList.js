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
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Dialog,
  DialogActions,
  Typography,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getAllHouseholds, deleteHousehold, activateHousehold } from '../../services/householdService';

const HouseholdList = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [householdToDelete, setHouseholdToDelete] = useState(null);

  // Load households
  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHouseholds({ showAll: showInactive });
      console.log('Received household data:', data);
      setHouseholds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching households:', error);
      setError(error?.message || 'Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, [showInactive]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/households/edit/${id}`);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (household) => {
    setHouseholdToDelete(household);
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setHouseholdToDelete(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!householdToDelete) return;

    try {
      setLoading(true);
      await deleteHousehold(householdToDelete.id);

      // Only update the local state if the API call was successful
      setHouseholds(households.filter(household => household.id !== householdToDelete.id));

      // Close the dialog
      handleDeleteDialogClose();
    } catch (error) {
      console.error(`Delete household ${householdToDelete.id} error:`, error);
      setError(`Failed to delete household: ${error.message}`);
      // Refresh data to ensure UI is in sync with backend
      fetchHouseholds();
    } finally {
      setLoading(false);
    }
  };

  // Handle activate
  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        // Deactivate
        await deleteHousehold(id);
      } else {
        // Activate
        await activateHousehold(id);
      }
      // Refresh data after status change
      fetchHouseholds();
    } catch (error) {
      console.error(`Toggle active status for household ${id} error:`, error);
      setError(`Failed to change household status: ${error.message}`);
    }
  };

  // Handle view details
  const handleViewDetails = (id) => {
    navigate(`/households/${id}`);
  };

  // Filter households based on search term
  const filteredHouseholds = households.filter(household =>
    household.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    household.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    household.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate households
  const paginatedHouseholds = filteredHouseholds.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <PageHeader
        title="Hộ khẩu"
        subtitle="Quản lý hộ khẩu"
        actionText="Thêm hộ khẩu"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/households/add')}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Hộ khẩu' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              sx={{ flexGrow: 1, mr: 2 }}
              variant="outlined"
              placeholder="Tìm theo tên, địa chỉ, email..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Hiển thị không hoạt động"
                sx={{ mr: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchHouseholds}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
              <Button
                size="small"
                sx={{ ml: 2 }}
                onClick={fetchHouseholds}
              >
                Try Again
              </Button>
            </Alert>
          )}

          {loading ? (
            <LinearProgress />
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Chủ hộ</TableCell>
                      <TableCell>Địa chỉ</TableCell>
                      <TableCell align="center">Nhân khẩu</TableCell>
                      <TableCell>Liên hệ</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="right">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedHouseholds.length > 0 ? (
                      paginatedHouseholds.map((household) => (
                        <TableRow
                          key={household.id}
                          sx={{
                            opacity: household.active ? 1 : 0.7,
                            bgcolor: household.active ? 'inherit' : 'rgba(0,0,0,0.03)'
                          }}
                        >
                          <TableCell>{household.ownerName}</TableCell>
                          <TableCell>{household.address}</TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<PersonIcon />}
                              label={household.numMembers}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              {household.phoneNumber}
                              <br />
                              <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.85rem' }}>
                                {household.email}
                              </span>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={`Nhấn để ${household.active ? 'Hủy kích hoạt' : 'kích hoạt'}`}>
                              <Chip
                                label={household.active ? "Hoạt động" : "Không hoạt động"}
                                color={household.active ? "success" : "default"}
                                size="small"
                                onClick={() => handleToggleActive(household.id, household.active)}
                                sx={{ cursor: 'pointer' }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(household.id)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(household.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={household.active ? "Hủy kích hoạt" : "Xóa vĩnh viễn"}>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDialogOpen(household)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            Không tìm thấy hộ khẩu.
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/households/add')}
                            sx={{ mt: 2 }}
                          >
                            Thêm hộ khẩu
                          </Button>

                        </TableCell>

                      </TableRow>


                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredHouseholds.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-household-dialog-title"
        aria-describedby="delete-household-dialog-description"
      >
        <DialogTitle id="delete-household-dialog-title">
          {householdToDelete?.active ? "Hủy kích hoạt hộ khẩu" : "Xóa hộ khẩu"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-household-dialog-description">
            {householdToDelete?.active
              ? `Bạn có chắc chắn muốn hủy kích hoạt hộ khẩu \"${householdToDelete?.ownerName}\"? Hộ khẩu sẽ được đánh dấu là không hoạt động.`
              : `Bạn có chắc chắn muốn xóa vĩnh viễn hộ khẩu \"${householdToDelete?.ownerName}\"? Hành động này không thể hoàn tác.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            {householdToDelete?.active ? "Hủy kích hoạt" : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HouseholdList;