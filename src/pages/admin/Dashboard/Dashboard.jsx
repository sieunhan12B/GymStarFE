import React, { useContext, useEffect, useState } from 'react';
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Select,
  Skeleton
} from 'antd';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
} from 'recharts';
import { dashboardService } from '../../../services/dashboard.service';
import { NotificationContext } from '@/App';
import { formatPrice } from '../../../utils/utils';
import dayjs from 'dayjs';

import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

const DashboardGym = () => {
  const [dashboard, setDashboard] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);


  const [dateRange, setDateRange] = useState([]);



  const { showNotification } = useContext(NotificationContext);




  // ================= FETCH DASHBOARD =================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getDashboardDay();
      setDashboard(res.data);
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Lỗi tải dashboard',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };


  const fetchRevenueByRange = async (from, to) => {
    try {
      const res = await dashboardService.getRevenueOrder(from, to);
      setRevenueData(res.data.revenueData || []);
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Lỗi lấy doanh thu',
        'error'
      );
    }
  };


  // ================= FETCH TOP PRODUCTS =================
  const fetchTopProducts = async () => {
    try {
      const res = await dashboardService.getTopProductMonth();
      setTopProducts(res.data.topProducts || []);
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Lỗi tải top sản phẩm',
        'error'
      );
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchTopProducts();
  }, []);
  useEffect(() => {
    setDateRange([
      dayjs().subtract(30, 'day').startOf('day'),
      dayjs().endOf('day')
    ]);
  }, []);

  // Gọi API khi đổi range
  useEffect(() => {
    if (!dateRange || dateRange.length !== 2) return;

    const from = dateRange[0].format("YYYY-MM-DD");
    const to = dateRange[1].format("YYYY-MM-DD");

    fetchRevenueByRange(from, to);
  }, [dateRange]);



  // ================= COLOR MAP =================
  const statusColorMap = {
    'chờ xác nhận': 'orange',
    'đã xác nhận': 'blue',
    'đang xử lý': 'purple',
    'đang giao': 'cyan',
    'đã giao': 'green',
    'giao thất bại': 'red',
    'đổi hàng': 'magenta',
    'đã hủy': 'gray'
  };

  const getRevenueByPeriod = () => {
    return revenueData;
  };







  // ================= TABLE COLUMNS =================
  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      render: text => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: v => `${formatPrice(v)} ₫`
    }
  ];

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Dashboard GymStar</h1>
      <p className="text-sm text-gray-500 mb-6">
        Dữ liệu cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
      </p>

      {/* ================= KPI ================= */}
      <Row gutter={[16, 16]} className="mb-6">
        {dashboard?.stats?.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="shadow-md">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  index === 0 ? <UserOutlined /> :
                    index === 1 ? <ShopOutlined /> :
                      index === 3 ? <ShoppingOutlined /> :
                        null
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* ================= CHARTS ================= */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>

          <Card
            title="Doanh thu & đơn hàng"
            extra={
              <RangePicker
                format="DD/MM/YYYY"
                onChange={(dates) => setDateRange(dates)}
                value={dateRange}
                disabledDate={(current) => {
                  // Không cho chọn ngày sau hôm nay
                  return current && current > dayjs().endOf('day');
                }}
              />

            }
            bordered={false}
            className="shadow-md"
          >



            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getRevenueByPeriod()}
                barCategoryGap={28}
                barGap={6}
              >


                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => dayjs(v).format('DD/MM')}
                />

                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `${v / 1_000_000}tr`}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                />

                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'Doanh thu') return [`${formatPrice(value)} ₫`, name];
                    return [value, name];
                  }}
                />

                <Legend />

                {/* Doanh thu */}
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#2563eb"
                  barSize={14}
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="Đơn hàng"
                  fill="#16a34a"
                  barSize={14}
                  radius={[6, 6, 0, 0]}
                />


              </BarChart>
            </ResponsiveContainer>


          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Trạng thái đơn hàng hôm nay"
            bordered={false}
            className="shadow-md"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.orderStatusToday}
                  dataKey="value"
                  nameKey="status"
                  outerRadius={90}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {dashboard.orderStatusToday.map((e, i) => (
                    <Cell
                      key={i}
                      fill={statusColorMap[e.status.toLowerCase()] || 'gray'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value, entry) => {
                    const color = statusColorMap[value.toLowerCase()] || 'gray';
                    return (
                      <span style={{ color }}>
                        {value}
                      </span>
                    );
                  }}
                />
              </PieChart>

            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ================= TOP PRODUCTS ================= */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Top sản phẩm bán chạy trong tháng"
            bordered={false}
            className="shadow-md"
          >
            <Table
              dataSource={topProducts}
              columns={productColumns}
              rowKey="name"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div >
  );
};

export default DashboardGym;
