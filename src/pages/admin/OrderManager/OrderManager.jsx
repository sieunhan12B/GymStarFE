import { useState, useEffect, useContext } from "react";
import { Table, Tag, Button, Space, Modal } from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Header from "@/templates/AdminTemplate/Header";
import { NotificationContext } from "@/App";
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';

// ===== MOCK DATA =====
const mockOrders = [
  {
    order_id: 1001,
    customer_name: "Nguyễn Văn A",
    created_at: "2025-12-01T10:20:30Z",
    status: "pending",
    total: 1200000,
    items: [
      { name: "Sản phẩm 1", qty: 2, price: 150000 },
      { name: "Sản phẩm 2", qty: 1, price: 850000 },
    ],
  },
  {
    order_id: 1002,
    customer_name: "Trần Thị B",
    created_at: "2025-12-02T14:10:00Z",
    status: "shipping",
    total: 850000,
    items: [
      { name: "Sản phẩm 3", qty: 1, price: 850000 },
    ],
  },
  {
    order_id: 1003,
    customer_name: "Lê Văn C",
    created_at: "2025-12-03T09:45:12Z",
    status: "completed",
    total: 2500000,
    items: [
      { name: "Sản phẩm 4", qty: 1, price: 1500000 },
      { name: "Sản phẩm 5", qty: 2, price: 500000 },
    ],
  },
  {
    order_id: 1004,
    customer_name: "Phạm Thị D",
    created_at: "2025-12-03T16:30:00Z",
    status: "cancelled",
    total: 1100000,
    items: [
      { name: "Sản phẩm 6", qty: 1, price: 1100000 },
    ],
  },
];

const OrderManager = () => {
  // ===== STATE =====
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { showNotification } = useContext(NotificationContext);

  // ===== LOAD MOCK DATA =====
  const fetchOrders = () => {
    setLoading(true);
    try {
      setOrders(mockOrders);
      showNotification("Tải danh sách đơn hàng thành công!", "success");
    } catch {
      showNotification("Tải danh sách đơn hàng thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ===== FILTER SEARCH =====
  const filteredOrders = orders.filter(order => {
    if (!searchText) return true;
    const text = searchText.toLowerCase();

    return removeVietnameseTones(order.customer_name || "")
      .toLowerCase()
      .includes(text);
  });

  // ===== CHANGE STATUS =====
  const handleOpenChangeStatusModal = (order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleChangeStatusOrder = () => {
    if (!selectedOrder) return;

    const newOrders = orders.map(o =>
      o.order_id === selectedOrder.order_id
        ? {
            ...o,
            status: o.status === "completed" ? "pending" : "completed",
          }
        : o
    );

    setOrders(newOrders);
    showNotification(`Đơn hàng ${selectedOrder.order_id} đã cập nhật trạng thái!`, "success");
    setIsStatusModalOpen(false);
  };

  // ===== TABLE COLUMNS =====
  const orderColumns = [
    { title: "Mã đơn hàng", dataIndex: "order_id", key: "order_id" },
    { title: "Khách hàng", dataIndex: "customer_name", key: "customer_name" },

    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chờ xử lý", value: "pending" },
        { text: "Đang giao", value: "shipping" },
        { text: "Hoàn thành", value: "completed" },
        { text: "Hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const colors = {
          pending: "orange",
          shipping: "blue",
          completed: "green",
          cancelled: "red",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },

    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => `${total.toLocaleString()}₫`,
    },

    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsDetailModalOpen(true);
            }}
          >
            Xem
          </Button>

          <Button
            type={record.status === "completed" ? "default" : "primary"}
            danger={record.status !== "completed"}
            icon={record.status === "completed" ? <UnlockOutlined /> : <LockOutlined />}
            onClick={() => handleOpenChangeStatusModal(record)}
          />
        </Space>
      ),
    },
  ];

  // ===== MODAL: CURRENT STATUS =====
  const statusModal = (
    <Modal
      title="Xác nhận thay đổi trạng thái"
      open={isStatusModalOpen}
      onCancel={() => setIsStatusModalOpen(false)}
      onOk={handleChangeStatusOrder}
      okText="Xác nhận"
      cancelText="Hủy"
      centered
    >
      <p>Bạn có chắc muốn thay đổi trạng thái đơn hàng: <b>{selectedOrder?.order_id}</b>?</p>
    </Modal>
  );

  // ===== MODAL: ORDER DETAIL =====
  const detailModal = (
    <Modal
      title={`Chi tiết đơn hàng #${selectedOrder?.order_id}`}
      open={isDetailModalOpen}
      onCancel={() => setIsDetailModalOpen(false)}
      footer={null}
      centered
      width={700}
    >
      {selectedOrder && (
        <div className="space-y-4">

          {/* THÔNG TIN KHÁCH */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Thông tin khách hàng</h3>
            <p><b>Tên:</b> {selectedOrder.customer_name}</p>
            <p><b>Số điện thoại:</b> 0123456789</p>
            <p><b>Địa chỉ:</b> 123 Đường ABC, TP.HCM</p>
          </div>

          {/* THÔNG TIN ĐƠN */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Thông tin đơn hàng</h3>
            <p><b>Mã đơn:</b> {selectedOrder.order_id}</p>
            <p><b>Ngày tạo:</b> {dayjs(selectedOrder.created_at).format("DD/MM/YYYY HH:mm")}</p>
            <p><b>Trạng thái:</b> {selectedOrder.status}</p>
            <p><b>Tổng tiền:</b> {selectedOrder.total.toLocaleString()}₫</p>
          </div>

          {/* DANH SÁCH SẢN PHẨM */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Sản phẩm</h3>

            <table className="w-full text-sm border">
              <thead>
                <tr className="border bg-gray-100">
                  <th className="p-2 border">Tên SP</th>
                  <th className="p-2 border">SL</th>
                  <th className="p-2 border">Giá</th>
                  <th className="p-2 border">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.qty}</td>
                    <td className="p-2 border">{item.price.toLocaleString()}₫</td>
                    <td className="p-2 border">
                      {(item.qty * item.price).toLocaleString()}₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </Modal>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <Header
        setSearchText={setSearchText}
        itemName="đơn hàng"
        categoryFilterOn={false}
        addItemOn={false}
      />

      <Table
        columns={orderColumns}
        dataSource={filteredOrders}
        rowKey="order_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {statusModal}
      {detailModal}
    </div>
  );
};

export default OrderManager;
