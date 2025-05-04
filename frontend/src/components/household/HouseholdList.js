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
        title="Households"
        subtitle="Manage apartment households"
        actionText="Add Household"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/households/add')}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Households' }
        ]}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              sx={{ flexGrow: 1, mr: 2 }}
              variant="outlined"
              placeholder="Search households by name, address or email..."
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
                label="Show Inactive"
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
                      <TableCell>Owner Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell align="center">Members</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
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
                            <Tooltip title={`Click to ${household.active ? 'deactivate' : 'activate'}`}>
                              <Chip
                                label={household.active ? "Active" : "Inactive"}
                                color={household.active ? "success" : "default"}
                                size="small"
                                onClick={() => handleToggleActive(household.id, household.active)}
                                sx={{ cursor: 'pointer' }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(household.id)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(household.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={household.active ? "Deactivate" : "Permanently Delete"}>
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
                            No households found.
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/households/add')}
                            sx={{ mt: 2 }}
                          >
                            Add Household
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
          {householdToDelete?.active ? "Deactivate Household" : "Delete Household"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-household-dialog-description">
            {householdToDelete?.active
              ? `Are you sure you want to deactivate household "${householdToDelete?.ownerName}"? The household will be marked as inactive.`
              : `Are you sure you want to permanently delete household "${householdToDelete?.ownerName}"? This action cannot be undone.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            {householdToDelete?.active ? "Deactivate" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HouseholdList;