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
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ElectricBolt as ElectricIcon,
  Water as WaterIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import {
  getAllUtilityBills,
  getUtilityBillsByHousehold,
  SERVICE_TYPES,
  generateRandomUtilityBills
} from '../../services/utilityService';
import { getAllHouseholds } from '../../services/householdService';
import { formatCurrency } from '../../services/feePaymentService';

const UtilityService = () => {
  const navigate = useNavigate();
  const [utilityBills, setUtilityBills] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHousehold, setFilterHousehold] = useState('ALL');
  const [filterService, setFilterService] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBills();
  }, [utilityBills, filterHousehold, filterService, filterMonth, filterYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const householdsData = await getAllHouseholds();
      setHouseholds(householdsData);
      
      // Generate utility bills for all households for current month
      const allBills = [];
      for (const household of householdsData) {
        const bills = generateRandomUtilityBills(household.id, filterMonth, filterYear);
        allBills.push(...bills);
      }
      setUtilityBills(allBills);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filterBills = () => {
    let filtered = utilityBills;

    // Filter by household
    if (filterHousehold !== 'ALL') {
      filtered = filtered.filter(bill => bill.householdId === parseInt(filterHousehold));
    }

    // Filter by service type
    if (filterService !== 'ALL') {
      filtered = filtered.filter(bill => bill.serviceType === filterService);
    }

    // Filter by month and year
    filtered = filtered.filter(bill => 
      bill.month === filterMonth && bill.year === filterYear
    );

    setFilteredBills(filtered);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleMonthYearChange = () => {
    loadData();
  };

  const getHouseholdNumber = (householdId) => {
    const household = households.find(h => h.id === householdId);
    return household ? household.householdNumber : 'N/A';
  };

  const getServiceTypeLabel = (type) => {
    return SERVICE_TYPES[type] || type;
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

  const getServiceColor = (type) => {
    switch (type) {
      case 'DIEN':
        return 'warning';
      case 'NUOC':
        return 'info';
      case 'INTERNET':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatReading = (oldReading, newReading, unit) => {
    if (!oldReading && !newReading) return '-';
    return `${oldReading || 0} → ${newReading || 0} ${unit}`;
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`
  }));

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year, label: year.toString() };
  });

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <Box>
      <PageHeader 
        title="Phí dịch vụ" 
        subtitle="Quản lý các khoản phí điện, nước, internet của các hộ gia đình"
        actionText="Tạo hóa đơn"
        actionIcon={<AddIcon />}
        onActionClick={() => navigate('/utilities/add')}
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Phí dịch vụ' }
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={filterMonth}
                  label="Tháng"
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setTimeout(handleMonthYearChange, 100);
                  }}
                >
                  {months.map(month => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Năm</InputLabel>
                <Select
                  value={filterYear}
                  label="Năm"
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setTimeout(handleMonthYearChange, 100);
                  }}
                >
                  {years.map(year => (
                    <MenuItem key={year.value} value={year.value}>
                      {year.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Loại dịch vụ</InputLabel>
                <Select
                  value={filterService}
                  label="Loại dịch vụ"
                  onChange={(e) => setFilterService(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {Object.entries(SERVICE_TYPES).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
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
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Tổng tiền: {formatCurrency(totalAmount)}
            </Typography>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {filteredBills.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Không có hóa đơn dịch vụ nào cho tháng {filterMonth}/{filterYear}.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/utilities/add')}
                    sx={{ mt: 2 }}
                  >
                    Tạo hóa đơn
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dịch vụ</TableCell>
                        <TableCell>Hộ gia đình</TableCell>
                        <TableCell>Chỉ số</TableCell>
                        <TableCell>Số tiền</TableCell>
                        <TableCell>Ghi chú</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getServiceIcon(bill.serviceType)}
                              <Chip 
                                label={getServiceTypeLabel(bill.serviceType)}
                                color={getServiceColor(bill.serviceType)}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{getHouseholdNumber(bill.householdId)}</TableCell>
                          <TableCell>
                            {formatReading(bill.oldReading, bill.newReading, bill.unit)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatCurrency(bill.amount)}
                            </Box>
                          </TableCell>
                          <TableCell>{bill.notes}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/utilities/detail/${bill.id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => navigate(`/utilities/edit/${bill.id}`)}
                              >
                                <EditIcon fontSize="small" />
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
    </Box>
  );
};

export default UtilityService;
