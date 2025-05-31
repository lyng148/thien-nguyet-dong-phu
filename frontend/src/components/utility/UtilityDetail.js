import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  ElectricBolt as ElectricIcon,
  Water as WaterIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { getUtilityBillById, SERVICE_TYPES } from '../../services/utilityService';
import { getAllHouseholds } from '../../services/householdService';
import { formatCurrency } from '../../services/feePaymentService';

const UtilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [utilityBill, setUtilityBill] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [utilityData, householdsData] = await Promise.all([
          getUtilityBillById(id),
          getAllHouseholds()
        ]);
        
        setUtilityBill(utilityData);
        
        // Find the household
        const householdInfo = householdsData.find(h => h.id === utilityData.householdId);
        setHousehold(householdInfo);
        
      } catch (err) {
        console.error('Error loading utility bill:', err);
        setError('Không thể tải thông tin hóa đơn dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getServiceIcon = (type) => {
    switch (type) {
      case 'DIEN':
        return <ElectricIcon color="warning" />;
      case 'NUOC':
        return <WaterIcon color="info" />;
      case 'INTERNET':
        return <WifiIcon color="success" />;
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

  const isMeteredService = (type) => {
    return type === 'DIEN' || type === 'NUOC';
  };

  const calculateUsage = () => {
    if (!isMeteredService(utilityBill?.serviceType)) return null;
    
    const oldReading = utilityBill?.oldReading || 0;
    const newReading = utilityBill?.newReading || 0;
    return Math.max(0, newReading - oldReading);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !utilityBill) {
    return (
      <Box>
        <PageHeader
          title="Chi tiết hóa đơn dịch vụ"
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/utilities')}
            >
              Quay lại
            </Button>
          }
        />
        
        <Alert severity="error">
          {error || 'Không tìm thấy hóa đơn dịch vụ'}
        </Alert>
      </Box>
    );
  }

  const usage = calculateUsage();

  return (
    <Box>
      <PageHeader
        title="Chi tiết hóa đơn dịch vụ"
        subtitle={`${SERVICE_TYPES[utilityBill.serviceType]} - ${utilityBill.month}/${utilityBill.year}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/utilities/edit/${id}`)}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/utilities')}
            >
              Quay lại
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Service Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                {getServiceIcon(utilityBill.serviceType)}
                <Box>
                  <Typography variant="h5" component="h2">
                    {SERVICE_TYPES[utilityBill.serviceType]}
                  </Typography>
                  <Chip 
                    label={`Tháng ${utilityBill.month}/${utilityBill.year}`}
                    color={getServiceColor(utilityBill.serviceType)}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Hộ gia đình
                      </TableCell>
                      <TableCell>
                        {household ? `${household.householdNumber} - ${household.ownerName}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Địa chỉ
                      </TableCell>
                      <TableCell>
                        {household?.address || 'N/A'}
                      </TableCell>
                    </TableRow>

                    {isMeteredService(utilityBill.serviceType) && (
                      <>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Chỉ số cũ
                          </TableCell>
                          <TableCell>
                            {utilityBill.oldReading} {utilityBill.unit}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Chỉ số mới
                          </TableCell>
                          <TableCell>
                            {utilityBill.newReading} {utilityBill.unit}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Lượng tiêu thụ
                          </TableCell>
                          <TableCell>
                            <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {usage} {utilityBill.unit}
                            </Box>
                          </TableCell>
                        </TableRow>
                      </>
                    )}

                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Đơn vị tính
                      </TableCell>
                      <TableCell>{utilityBill.unit}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Số tiền
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(utilityBill.amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {utilityBill.notes && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Ghi chú
                        </TableCell>
                        <TableCell>{utilityBill.notes}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tóm tắt
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loại dịch vụ:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {SERVICE_TYPES[utilityBill.serviceType]}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kỳ hóa đơn:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {utilityBill.month}/{utilityBill.year}
                  </Typography>
                </Box>

                {isMeteredService(utilityBill.serviceType) && usage !== null && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tiêu thụ:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {usage} {utilityBill.unit}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(utilityBill.amount)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/utilities/edit/${id}`)}
                >
                  Chỉnh sửa hóa đơn
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UtilityDetail;
