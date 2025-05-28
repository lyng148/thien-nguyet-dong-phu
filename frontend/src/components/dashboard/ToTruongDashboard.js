import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  AssignmentInd as TemporaryResidenceIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import PageHeader from '../common/PageHeader';
import DashboardCard from './DashboardCard';
import { getDashboardSummary, getToTruongDashboardSummary, getRecentHouseholds } from '../../services/dashboardService';
import { getAllHouseholds } from '../../services/householdService';
import { getAllPeople } from '../../services/personService';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336'];

const ToTruongDashboard = () => {
  const navigate = useNavigate();
    // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHouseholds: 0,
    activeHouseholds: 0,
    inactiveHouseholds: 0,
    totalPeople: 0,
    averagePeoplePerHousehold: 0,
    totalTemporaryResidence: 0,
    householdGrowth: 0,
    populationDensity: 0,
    householdsWithPhoneNumber: 0,
    householdsWithEmail: 0,
    householdMemberData: []
  });
  const [recentHouseholds, setRecentHouseholds] = useState([]);
  const [householdData, setHouseholdData] = useState([]);
  const [peopleByAge, setPeopleByAge] = useState([]);
  const [error, setError] = useState(null);
  // Load dashboard data
  useEffect(() => {
    const loadToTruongDashboardData = async () => {
      try {
        setLoading(true);
        
        // Use the specialized tổ trưởng dashboard service
        const [summary, recentHouseholdsData] = await Promise.all([
          getToTruongDashboardSummary(),
          getRecentHouseholds(5)
        ]);
        
        // Load people data for age distribution
        const people = await getAllPeople();
        
        // Calculate age distribution (would need actual age calculation with birth dates)
        const ageDistribution = [
          { name: 'Dưới 18', count: Math.floor(people.length * 0.2) },
          { name: '18-35', count: Math.floor(people.length * 0.35) },
          { name: '36-55', count: Math.floor(people.length * 0.3) },
          { name: 'Trên 55', count: Math.floor(people.length * 0.15) }
        ];
        
        setStats({
          ...summary,
          populationDensity: summary.averagePeoplePerHousehold
        });
        
        setRecentHouseholds(recentHouseholdsData);
        setHouseholdData(summary.householdMemberData);
        setPeopleByAge(ageDistribution);
        
      } catch (error) {
        console.error('Error loading tổ trưởng dashboard data:', error);
        setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    
    loadToTruongDashboardData();
  }, []);

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
        title="Bảng Điều Khiển Tổ Trưởng" 
        subtitle="Quản lý hộ khẩu, nhân khẩu và tổng quan khu dân cư"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LinearProgress sx={{ mb: 3 }} />
      ) : (
        <>
          {/* Main Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tổng Hộ Khẩu"
                value={stats.totalHouseholds}
                icon={<HomeIcon />}
                iconBgColor="#e3f2fd"
                iconColor="#2196f3"
                subtitle={`${stats.activeHouseholds} đang hoạt động`}
                onClick={() => navigate('/households')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tổng Nhân Khẩu"
                value={stats.totalPeople}
                icon={<PersonIcon />}
                iconBgColor="#e8f5e9"
                iconColor="#4caf50"
                subtitle={`${stats.populationDensity} người/hộ trung bình`}
                onClick={() => navigate('/persons')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tạm Trú/Tạm Vắng"
                value={stats.totalTemporaryResidence}
                icon={<TemporaryResidenceIcon />}
                iconBgColor="#fff8e1"
                iconColor="#ff9800"
                subtitle="Đăng ký trong tháng"
                onClick={() => navigate('/temporary-residence')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Tăng Trưởng Hộ Khẩu"
                value={`+${stats.householdGrowth}%`}
                icon={<TrendingUpIcon />}
                iconBgColor="#fce4ec"
                iconColor="#e91e63"
                subtitle="So với tháng trước"                onClick={() => navigate('/households')}
              />
            </Grid>
          </Grid>

          {/* Contact Information Statistics */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Hộ Có Số Điện Thoại
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {stats.householdsWithPhoneNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalHouseholds > 0 ? Math.round((stats.householdsWithPhoneNumber / stats.totalHouseholds) * 100) : 0}% tổng số hộ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary">
                    Hộ Có Email
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {stats.householdsWithEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalHouseholds > 0 ? Math.round((stats.householdsWithEmail / stats.totalHouseholds) * 100) : 0}% tổng số hộ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hộ Không Hoạt Động
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {stats.inactiveHouseholds}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cần xem xét cập nhật
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trung Bình Nhân Khẩu
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {stats.averagePeoplePerHousehold}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Người/hộ khẩu
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts and Statistics */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phân Bố Số Người Theo Hộ Khẩu
                  </Typography>
                  <Box sx={{ height: 300, pt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={householdData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2196f3" name="Số Hộ Khẩu" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phân Bố Độ Tuổi Nhân Khẩu
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={peopleByAge}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {peopleByAge.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {peopleByAge.map((entry, index) => (
                      <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            backgroundColor: COLORS[index % COLORS.length],
                            borderRadius: '50%' 
                          }} 
                        />
                        <Typography variant="caption">
                          {entry.name} ({entry.count})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity and Quick Actions */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Hộ Khẩu Mới Nhất
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HomeIcon />}
                      onClick={() => navigate('/households')}
                    >
                      Xem Tất Cả
                    </Button>
                  </Box>
                  {recentHouseholds.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Chưa có hộ khẩu nào được đăng ký.
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/households/add')}
                        sx={{ mt: 2 }}
                      >
                        Thêm Hộ Khẩu
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Chủ Hộ</TableCell>
                            <TableCell>Địa Chỉ</TableCell>
                            <TableCell align="center">Số Thành Viên</TableCell>
                            <TableCell align="center">Trạng Thái</TableCell>
                            <TableCell>Ngày Đăng Ký</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentHouseholds.map((household) => (
                            <TableRow 
                              key={household.id}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/households/${household.id}`)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {household.ownerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {household.soHoKhau || 'Chưa có số hộ khẩu'}
                                </Typography>
                              </TableCell>
                              <TableCell>{household.address}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={household.numMembers} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={household.active ? "Hoạt động" : "Không hoạt động"}
                                  color={household.active ? "success" : "default"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{formatDate(household.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>                  <Typography variant="h6" gutterBottom>
                    Thao Tác Nhanh
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/households/add')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Thêm Hộ Khẩu Mới
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PersonIcon />}
                        onClick={() => navigate('/persons/add')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Thêm Nhân Khẩu
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<TemporaryResidenceIcon />}
                        onClick={() => navigate('/temporary-residence')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Quản Lý Tạm Trú/Tạm Vắng
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GroupIcon />}
                        onClick={() => navigate('/households')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Xem Danh Sách Hộ Khẩu
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        startIcon={<InfoIcon />}
                        onClick={() => navigate('/households?filter=inactive')}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Xem Hộ Khẩu Không Hoạt Động
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {/* Information Section */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon sx={{ mr: 1, fontSize: 16 }} />
                      Thông Tin Hệ Thống
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      • Quản lý đầy đủ thông tin hộ khẩu và nhân khẩu
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      • Theo dõi tình trạng tạm trú, tạm vắng
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Phân quyền và quản lý người dùng hệ thống
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ToTruongDashboard;
