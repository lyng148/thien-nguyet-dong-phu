import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { getPersonById } from '../../services/personService';
import { getHouseholdMembers, getHouseholdById } from '../../services/householdService';
import { getAllTemporaryResidences } from '../../services/temporaryResidenceService';
import PageHeader from '../common/PageHeader';

// TabPanel component for displaying tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`person-tabpanel-${index}`}
      aria-labelledby={`person-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [householdInfo, setHouseholdInfo] = useState(null);
  const [householdData, setHouseholdData] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [temporaryResidences, setTemporaryResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load person data
  useEffect(() => {
    const fetchPersonData = async () => {
      setLoading(true);
      try {
        const personData = await getPersonById(id);
        setPerson(personData);

        // If person belongs to a household, get comprehensive household info
        if (personData.householdId) {
          try {
            // Get household details
            const household = await getHouseholdById(personData.householdId);
            setHouseholdData(household);

            // Get household members
            const members = await getHouseholdMembers(personData.householdId);
            setHouseholdMembers(Array.isArray(members) ? members : []);
            
            setHouseholdInfo({
              id: personData.householdId,
              members: Array.isArray(members) ? members : []
            });
          } catch (householdErr) {
            console.error('Error loading household info:', householdErr);
            // Don't throw, just continue without household info
          }
        }

        // Load temporary residence records for this person
        try {
          const tempResidences = await getAllTemporaryResidences();
          const personTempResidences = tempResidences.filter(tr => tr.nhanKhauId === parseInt(id));
          setTemporaryResidences(personTempResidences);
        } catch (tempErr) {
          console.error('Error loading temporary residences:', tempErr);
          setTemporaryResidences([]);
        }
      } catch (err) {
        console.error('Error loading person data:', err);
        setError('Không thể tải thông tin người dân. ' + (err.message || ''));
      }
      setLoading(false);
    };

    if (id) {
      fetchPersonData();
    }
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/persons');
  };

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/persons/edit/${id}`);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  };

  // Format gender
  const formatGender = (gender) => {
    if (gender === 'Nam') return 'Nam';
    if (gender === 'Nữ') return 'Nữ';
    return gender || 'Chưa xác định';
  };

  // Get gender color
  const getGenderColor = (gender) => {
    if (gender === 'Nam') return 'primary';
    if (gender === 'Nữ') return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Chi tiết người dân" />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!person) {
    return (
      <Box>
        <PageHeader title="Chi tiết người dân" />
        <Alert severity="warning" sx={{ mt: 2 }}>
          Không tìm thấy thông tin người dân
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }
  return (
    <Box>
      <PageHeader 
        title="Thông tin chi tiết nhân khẩu"
        subtitle={person.fullName}
        actions={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          </Stack>
        }
        breadcrumbs={[
          { label: 'Bảng điều khiển', path: '/dashboard' },
          { label: 'Nhân khẩu', path: '/persons' },
          { label: 'Chi tiết' }
        ]}
      />

      {/* Header Card with Basic Info */}
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: person.gender === 'Nam' ? 'primary.main' : 'secondary.main',
                  fontSize: '2rem'
                }}
              >
                {person.fullName ? person.fullName.charAt(0).toUpperCase() : 'N'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {person.fullName || 'Chưa có thông tin'}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <Chip 
                  label={formatGender(person.gender)} 
                  color={getGenderColor(person.gender)}
                  size="small"
                />
                <Chip 
                  label={person.householdId ? "Đã có hộ khẩu" : "Chưa có hộ khẩu"}
                  color={person.householdId ? "success" : "warning"}
                  icon={<HomeIcon />}
                  size="small"
                />
              </Stack>
              <Typography variant="body1" color="text.secondary">
                <EventIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Sinh ngày: {formatDate(person.dateOfBirth)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <BadgeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                CCCD: {person.idCardNumber || 'Chưa có thông tin'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="person detail tabs">
          <Tab label="Thông tin cơ bản" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Thông tin hộ khẩu" icon={<HomeIcon />} iconPosition="start" disabled={!person.householdId} />
          <Tab label="Tạm trú/Tạm vắng" icon={<LocationIcon />} iconPosition="start" />
          <Tab label="Lịch sử" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Thông tin cá nhân</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Họ và tên
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {person.fullName || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ngày sinh
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(person.dateOfBirth)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Giới tính
                    </Typography>
                    <Chip 
                      label={formatGender(person.gender)} 
                      color={getGenderColor(person.gender)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Dân tộc
                    </Typography>
                    <Typography variant="body1">
                      {person.ethnicity || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tôn giáo
                    </Typography>
                    <Typography variant="body1">
                      {person.religion || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nghề nghiệp
                    </Typography>
                    <Typography variant="body1">
                      {person.occupation || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Identity Information */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BadgeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Thông tin căn cước công dân</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Số CCCD
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {person.idCardNumber || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ngày cấp
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(person.idCardIssueDate)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nơi cấp
                    </Typography>
                    <Typography variant="body1">
                      {person.idCardIssuePlace || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Status Information */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trạng thái
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Trạng thái hộ khẩu
                    </Typography>
                    <Chip 
                      label={person.householdId ? "Đã có hộ khẩu" : "Chưa có hộ khẩu"}
                      color={person.householdId ? "success" : "warning"}
                      icon={<HomeIcon />}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  
                  {person.relationshipWithOwner && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Quan hệ với chủ hộ
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {person.relationshipWithOwner}
                      </Typography>
                    </Box>
                  )}

                  {temporaryResidences.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tình trạng tạm trú/tạm vắng
                      </Typography>
                      <Chip 
                        label={`${temporaryResidences.length} bản ghi`}
                        color="info"
                        icon={<LocationIcon />}
                        size="small"
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {person.notes && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Ghi chú</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {person.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Household Information Tab */}
      <TabPanel value={tabValue} index={1}>
        {person.householdId ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <HomeIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Thông tin hộ khẩu</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/households/${person.householdId}`)}
                    >
                      Xem chi tiết hộ khẩu
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {householdData && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Số hộ khẩu
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {householdData.soHoKhau || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Chủ hộ
                        </Typography>
                        <Typography variant="body1">
                          {householdData.ownerName || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1">
                          {householdData.address || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Household Members */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Thành viên hộ khẩu ({householdMembers.length})</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {householdMembers.length === 0 ? (
                    <Typography color="text.secondary">
                      Không có thông tin thành viên hộ khẩu
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Họ tên</TableCell>
                            <TableCell>Quan hệ với chủ hộ</TableCell>
                            <TableCell>Ghi chú</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {householdMembers.map((member, index) => (
                            <TableRow key={index} selected={member.id === parseInt(id)}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  {member.hoTen}
                                  {member.id === parseInt(id) && (
                                    <Chip 
                                      label="Bạn" 
                                      size="small" 
                                      color="primary" 
                                      sx={{ ml: 1 }} 
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>{member.quanHeVoiChuHo || '-'}</TableCell>
                              <TableCell>{member.ghiChu || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            Người này chưa thuộc hộ khẩu nào.
          </Alert>
        )}
      </TabPanel>

      {/* Temporary Residence Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Lịch sử tạm trú/tạm vắng ({temporaryResidences.length})</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {temporaryResidences.length === 0 ? (
              <Typography color="text.secondary">
                Không có bản ghi tạm trú/tạm vắng nào.
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Địa chỉ</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Ghi chú</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {temporaryResidences.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip 
                            label={record.trangThai === 'TAM_TRU' ? 'Tạm trú' : 'Tạm vắng'}
                            color={record.trangThai === 'TAM_TRU' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.diaChiTamTruTamVang || '-'}</TableCell>
                        <TableCell>{formatDate(record.thoiGian)}</TableCell>
                        <TableCell>{record.ghiChu || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* History Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <HistoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Lịch sử thay đổi</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Alert severity="info">
              Tính năng lịch sử thay đổi sẽ được triển khai trong phiên bản tiếp theo.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default PersonDetail;
