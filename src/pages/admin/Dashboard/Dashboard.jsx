import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Skeleton,
  DatePicker,
  Spin,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";

import Header from "../../../templates/AdminTemplate/Header";
import { dashboardService } from "../../../services/dashboard.service";
import { NotificationContext } from "@/App";
import { formatPrice } from "../../../utils/formatPrice";

const { RangePicker } = DatePicker;

const DashboardGym = () => {
  const { showNotification } = useContext(NotificationContext);

  const [dashboard, setDashboard] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState([]);

  // ================= FETCH =================
  const fetchDashboard = async () => {
    const res = await dashboardService.getDashboardDay();
    setDashboard(res.data);
  };

  const fetchTopProducts = async () => {
    const res = await dashboardService.getTopProductMonth();
    setTopProducts(res.data || []);
  };

  const fetchRevenueByRange = async (from, to) => {
    const res = await dashboardService.getRevenueOrder(from, to);
    setRevenueData(res.data.revenueData || []);
  };

  const reloadAll = useCallback(async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchDashboard(),
        fetchTopProducts(),
        dateRange?.length === 2 &&
        fetchRevenueByRange(
          dateRange[0].format("YYYY-MM-DD"),
          dateRange[1].format("YYYY-MM-DD")
        ),
      ]);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Lỗi tải dashboard",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // ================= INIT =================
  useEffect(() => {
    reloadAll();
  }, []);

  useEffect(() => {
    setDateRange([
      dayjs().subtract(30, "day").startOf("day"),
      dayjs().endOf("day"),
    ]);
  }, []);

  useEffect(() => {
    if (!dateRange || dateRange.length !== 2) return;

    fetchRevenueByRange(
      dateRange[0].format("YYYY-MM-DD"),
      dateRange[1].format("YYYY-MM-DD")
    );
  }, [dateRange]);

  // ================= COLOR MAP =================
  const statusColorMap = {
    "chờ xác nhận": "orange",
    "đã xác nhận": "blue",
    "đang xử lý": "purple",
    "đang giao": "cyan",
    "đã giao": "green",
    "giao thất bại": "red",
    "đổi hàng": "magenta",
    "đã hủy": "gray",
  };

  // ================= TABLE =================
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Đã bán",
      dataIndex: "sold",
      key: "sold",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (v) => `${formatPrice(v)} ₫`,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg h-screen flex justify-center items-center shadow-sm">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Header
        title="Dashboard GymStar"
        itemName="doanh thu"
        showSearch={false}
        showAddButton={false}
        showCategoryFilter={false}
        onReload={reloadAll}
        reloading={loading}
      />

      <div className="p-6">
        {/* ================= KPI ================= */}
        <Row gutter={[16, 16]} className="mb-6">
          {dashboard?.stats?.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="shadow-md">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={
                    index === 0 ? (
                      <UserOutlined />
                    ) : index === 1 ? (
                      <ShopOutlined />
                    ) : index === 3 ? (
                      <ShoppingOutlined />
                    ) : null
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
                  value={dateRange}
                  onChange={setDateRange}
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
              }
              className="shadow-md"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData} barCategoryGap={28} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => dayjs(v).format("DD/MM")}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(v) => `${v / 1_000_000}tr`}
                  />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "Doanh thu"
                        ? [`${formatPrice(value)} `, name]
                        : [value, name]
                    }
                  />
                  <Legend />

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
              className="shadow-md"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboard.orderStatusToday}
                    dataKey="value"
                    nameKey="status"
                    outerRadius={90}
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboard.orderStatusToday.map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          statusColorMap[e.status.toLowerCase()] || "gray"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    formatter={(value) => {
                      const color =
                        statusColorMap[value.toLowerCase()] || "gray";
                      return <span style={{ color }}>{value}</span>;
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
              title={`Top sản phẩm bán chạy tháng ${topProducts?.month}/${topProducts?.year}`}
              className="shadow-md"
            >
              <Table
                dataSource={topProducts.topProducts}
                columns={productColumns}
                rowKey="name"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardGym;
