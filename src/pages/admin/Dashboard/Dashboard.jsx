import React, { useContext, useEffect, useState } from 'react';
import { UserOutlined, ShopOutlined, ShoppingOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Card, Row, Col, Statistic, Table, Tag, Select } from 'antd';
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
  ResponsiveContainer
} from 'recharts';
import { dashboardService } from '../../../services/dashboard.service';
import { NotificationContext } from "@/App";
import dayjs from 'dayjs';
import { formatPrice } from '../../../utils/utils';

const DashboardGym = () => {
  const [period, setPeriod] = React.useState('month');
  const [dashboard, setDasboard] = useState();
  const { showNotification } = useContext(NotificationContext);



  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // setLoading(true);
        const res = await dashboardService.getDashboardDay();
        console.log(res)
        // showNotification(res.data.message,"success");
        setDasboard(res.data);

      } catch (error) {
        console.error(error);

      } finally {
        // setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // colorMap đặt ngoài component
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


  // ===== MOCK API DATA =====
  const apiData = {
    stats: [
      { title: 'Khách hàng', value: 1840, trend: { value: 9.2, isUp: true } },
      { title: 'Đơn hàng', value: 965, trend: { value: 6.4, isUp: true } },
      { title: 'Doanh thu', value: 325000000, trend: { value: 2.1, isUp: false } },
      { title: 'Sản phẩm', value: 320, trend: { value: 4.8, isUp: true } }
    ],
    revenueData: [
      { date: '2025-12-11', revenue: 18000000, orders: 62 },
      { date: '2025-12-12', revenue: 22000000, orders: 75 },
      { date: '2025-12-13', revenue: 26000000, orders: 88 },
      { date: '2025-12-14', revenue: 31000000, orders: 102 },
      { date: '2025-12-15', revenue: 28000000, orders: 94 },
      { date: '2025-12-16', revenue: 35000000, orders: 118 }
    ],
    topProducts: [
      { name: 'Áo Tanktop Gym', category_name: 'Áo tập', sold: 320, revenue: 48000000 },
      { name: 'Quần Legging Nữ', category_name: 'Quần tập', sold: 280, revenue: 56000000 },
      { name: 'Găng tay Gym', category_name: 'Phụ kiện', sold: 410, revenue: 20500000 },
      { name: 'Dây kháng lực', category_name: 'Phụ kiện', sold: 350, revenue: 17500000 },
      { name: 'Áo Hoodie Thể thao', category_name: 'Áo tập', sold: 190, revenue: 66500000 }
    ],
    recentOrders: [
      { order_id: 'DH001', customer: 'Nguyễn Văn A', total: 1250000, status: 'Chờ xác nhận', order_date: '2025-12-20T10:15:00' },
      { order_id: 'DH002', customer: 'Trần Thị B', total: 890000, status: 'Đang giao', order_date: '2025-12-20T09:58:00' },
      { order_id: 'DH003', customer: 'Lê Hoàng C', total: 2150000, status: 'Đã giao', order_date: '2025-12-20T09:30:00' },
      { order_id: 'DH004', customer: 'Phạm Minh D', total: 640000, status: 'Giao thất bại', order_date: '2025-12-20T08:50:00' }
    ],
    orderStatus: [
      { status: 'Chờ xác nhận', value: 50 },
      { status: 'Đã xác nhận', value: 80 },
      { status: 'Đang xử lý', value: 100 },
      { status: 'Đang giao', value: 210 },
      { status: 'Đã giao', value: 400 },
      { status: 'Giao thất bại', value: 30 },
      { status: 'Đổi hàng', value: 15 }
    ]
  };

  // ===== CHỌN DỮ LIỆU DOANH THU THEO PERIOD =====
  const getRevenueByPeriod = () => {
    switch (apiData) {
      case 'week':
        return apiData.revenueData.slice(-4);
      case 'month':
        return apiData.revenueData;
      case 'quarter':
        return [
          {
            date: 'Q1',
            revenue: apiData.revenueData[0].revenue + apiData.revenueData[1].revenue + apiData.revenueData[2].revenue,
            orders: apiData.revenueData[0].orders + apiData.revenueData[1].orders + apiData.revenueData[2].orders
          },
          {
            date: 'Q2',
            revenue: apiData.revenueData[3].revenue + apiData.revenueData[4].revenue + apiData.revenueData[5].revenue,
            orders: apiData.revenueData[3].orders + apiData.revenueData[4].orders + apiData.revenueData[5].orders
          }
        ];
      default:
        return apiData.revenueData;
    }
  };


  const productColumns = [
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Danh mục', dataIndex: 'category_name', key: 'category_name', render: text => <Tag color="purple">{text}</Tag> },
    { title: 'Đã bán', dataIndex: 'sold', key: 'sold' },
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: v => `${formatPrice(v)} ₫` }
  ];

  if (!dashboard) {
    return "";
  }


  return (

    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Dashboard Shop Gym</h1>
      <p className="text-sm text-gray-500 mb-6">
        Dữ liệu cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
      </p>

      <Row gutter={[16, 16]} className="mb-6">
        {dashboard?.stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="shadow-md">
              <Statistic title={stat.title} value={stat.value}
                prefix={index === 0 ? <UserOutlined /> : index === 1 ? <ShopOutlined /> : index === 3 ? <ShoppingOutlined /> : null}
              />

            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card
            title="Doanh thu & đơn hàng"
            extra={
              <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
                <Select.Option value="week">Tuần</Select.Option>
                <Select.Option value="month">Tháng</Select.Option>
                <Select.Option value="quarter">Quý</Select.Option>
              </Select>
            }
            bordered={false} className="shadow-md"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getRevenueByPeriod()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8884d8" yAxisId="left" />
                <Line type="monotone" dataKey="orders" name="Đơn hàng" stroke="#2ca02c" yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Trạng thái đơn hàng hôm nay" bordered={false} className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.orderStatusToday}
                  dataKey="value"
                  nameKey="status"
                  outerRadius={90}
                  label={({ status, value }) => `${status} (${value})`}
                >
                  {dashboard.orderStatusToday.map((e, i) => (
                    <Cell key={i} fill={statusColorMap[e.status.toLowerCase()] || 'gray'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>



      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Top sản phẩm bán chạy trong tháng này" bordered={false} className="shadow-md">
            <Table dataSource={apiData.topProducts} columns={productColumns} rowKey="name" pagination={{ pageSize: 5 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardGym;
