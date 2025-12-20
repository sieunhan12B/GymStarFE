import { useState, useEffect, useContext } from "react";
import { Table, Tag, Button, Space, Modal, Tooltip } from "antd";
import { EditOutlined, SyncOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Header from "@/templates/AdminTemplate/Header";
import { NotificationContext } from "@/App";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";
import { orderService } from "@/services/order.service";

const OrderManager = () => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");





  const { showNotification } = useContext(NotificationContext);


  const handleUpdateStatus = async () => {
    const data = { status: newStatus };

    try {
      const res = await orderService.updateStatus(
        selectedOrder.order_id,
        data
      );

      // axios trả data sẵn
      if (res.status !== 200) {
        showNotification(
          res.data?.message || "Cập nhật thất bại!",
          "error"
        );
        return;
      }

      showNotification("Cập nhật trạng thái thành công!", "success");
      setIsStatusModalOpen(false);
      fetchOrders();

    } catch (error) {
      console.error(error);
      showNotification(
        error.response?.data?.message || "Lỗi kết nối server!",
        "error"
      );
    }
  };

  const handleOpenChangeStatus = (order) => {
    console.log(order);
    setSelectedOrder(order);

    const nextStatuses = allowedTransitions[order.status];

    if (!nextStatuses || nextStatuses.length === 0) {
      showNotification("Đơn hàng này không thể đổi trạng thái!", "error");
      return;
    }

    setNewStatus(nextStatuses[0]); // auto chọn trạng thái tiếp theo đầu tiên
    setIsStatusModalOpen(true);
  };







  const allowedTransitions = {
    "chờ xác nhận": ["đã xác nhận"],
    "đã xác nhận": ["đang xử lý"],
    "đang xử lý": ["đang giao"],
    "đang giao": ["đã giao", "giao thất bại"],
    "giao thất bại": [],
    "đã giao": ["đổi hàng"],
    "đổi hàng": [],
  };


  // ================= CALL API ================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll();
      console.log(res);
      // const data = await res.json();
      setOrders(res.data.data);

      showNotification("Tải danh sách đơn hàng thành công!", "success");
    } catch (error) {
      showNotification("Tải đơn hàng thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= FILTER ==================
  const filteredOrders = orders?.filter((order) => {
    if (!searchText) return true;

    const keyword = removeVietnameseTones(searchText.toLowerCase());
    const name = removeVietnameseTones((order.receiver_name || "").toLowerCase());

    return name.includes(keyword);
  });

  // ================= TABLE COLUMNS ============
  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "order_id",
      key: "order_id",
      render: (id) => <b>#{id}</b>,
    },

    {
      title: "Khách hàng",
      render: (_, rec) => (
        <>
          <div><b>{rec.receiver_name}</b></div>
          <div className="text-gray-500">{rec.phone}</div>
        </>
      ),
    },

    {
      title: "Số SP",
      key: "items",
      sorter: (a, b) => a.items.length - b.items.length,
      render: (_, record) => <span>{record.items.length} sản phẩm</span>,
    },

    {
      title: "Ngày tạo",
      dataIndex: "order_date",
      key: "order_date",
      render: (date) => date,
    },

    {
      title: "Thanh toán",
      key: "payment",
      filters: [
        { text: "Đang chờ", value: "đang chờ" },
        { text: "Thành công", value: "thành công" },
        { text: "Thất bại", value: "thất bại" },
      ],
      onFilter: (value, record) =>
        record.payment?.status?.trim().toLowerCase() === value.toLowerCase(),
      render: (_, rec) => {
        const color = {
          "thành công": "green",
          "đang chờ": "orange",
          "thất bại": "red",
        };

        return (
          <Space direction="vertical">
            <Tag>{rec.payment.method}</Tag>
            <Tag color={color[rec.payment.status] || "default"}>
              {rec.payment.status}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chờ xác nhận", value: "chờ xác nhận" },
        { text: "Đã xác nhận", value: "đã xác nhận" },
        { text: "Đang xử lý", value: "đang xử lý" },
        { text: "Đang giao", value: "đang giao" },
        { text: "Đã giao", value: "đã giao" },
        { text: "Giao thất bại", value: "giao thất bại" },
        { text: "Đổi hàng", value: "đổi hàng" },
      ],
      onFilter: (value, record) =>
        record.status?.trim().toLowerCase() === value.toLowerCase(),
      render: (status) => {
        const colorMap = {
          "chờ xác nhận": "orange",
          "đã xác nhận": "blue",
          "đang xử lý": "cyan",
          "đang giao": "geekblue",
          "giao thất bại": "red",
          "đã giao": "green",
          "đổi hàng": "purple",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },

    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (total) => <b>{total.toLocaleString()}₫</b>,
    },

    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => {
        const canChangeStatus =
          allowedTransitions[record.status]?.length > 0;

        return (
          <Space size="middle">
            {/* XEM CHI TIẾT */}
            <Tooltip title="Xem chi tiết đơn hàng">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setIsDetailModalOpen(true);
                }}
              />
            </Tooltip>

            {/* ĐỔI TRẠNG THÁI */}
            <Tooltip
              title={
                canChangeStatus
                  ? "Cập nhật trạng thái đơn hàng"
                  : "Đơn hàng không thể đổi trạng thái"
              }
            >
              <Button
                type="primary"
                icon={<SyncOutlined />}
                disabled={!canChangeStatus}
                onClick={() => handleOpenChangeStatus(record)}
              >
                Đổi trạng thái
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },


  ];

  // ================= DETAIL MODAL =============
  const detailModal = (
    <Modal
      title={`Chi tiết đơn hàng #${selectedOrder?.order_id}`}
      open={isDetailModalOpen}
      onCancel={() => setIsDetailModalOpen(false)}
      footer={null}
      width={700}
    >
      {selectedOrder && (
        <div className="space-y-4">

          {/* Khách hàng */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Thông tin nhận hàng</h3>
            <p><b>Tên:</b> {selectedOrder.receiver_name}</p>
            <p><b>SĐT:</b> {selectedOrder.phone}</p>
            <p><b>Địa chỉ:</b> {selectedOrder.address_detail}</p>
            {selectedOrder.note && <p><b>Ghi chú:</b> {selectedOrder.note}</p>}
          </div>

          {/* Thông tin đơn */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Thông tin đơn hàng</h3>
            <p><b>Mã đơn:</b> {selectedOrder.order_id}</p>
            <p><b>Ngày tạo:</b> {selectedOrder.order_date}</p>
            <p><b>Trạng thái:</b> {selectedOrder.status}</p>
            <p><b>Tổng tiền:</b> {selectedOrder.total.toLocaleString()}₫</p>
          </div>

          {/* Thanh toán */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Thanh toán</h3>
            <p><b>Phương thức:</b> {selectedOrder.payment.method}</p>
            <p><b>Trạng thái:</b> {selectedOrder.payment.status}</p>
            <p><b>Ngày thanh toán:</b> {selectedOrder.payment.payment_date ?? "—"}</p>
          </div>

          {/* Sản phẩm */}
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Sản phẩm</h3>

            <table className="w-full text-sm border">
              <thead>
                <tr className="border bg-gray-100">
                  <th className="p-2 border">Tên SP</th>
                  <th className="p-2 border">Màu</th>
                  <th className="p-2 border">Size</th>
                  <th className="p-2 border">SL</th>
                  <th className="p-2 border">Giá</th>
                  <th className="p-2 border">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.color}</td>
                    <td className="p-2 border">{item.size}</td>
                    <td className="p-2 border">{item.quantity}</td>
                    <td className="p-2 border">
                      {item.final_price.toLocaleString()}₫
                    </td>
                    <td className="p-2 border">
                      {(item.quantity * item.final_price).toLocaleString()}₫
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

  const nextStatuses = allowedTransitions[selectedOrder?.status] || [];

  const statusModal = (
    <Modal
      title="Cập nhật trạng thái đơn hàng"
      open={isStatusModalOpen}
      onCancel={() => setIsStatusModalOpen(false)}
      onOk={handleUpdateStatus}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      {nextStatuses.length === 0 ? (
        <p className="text-red-500">Đơn hàng không thể đổi trạng thái.</p>
      ) : (
        <select
          value={newStatus}
          className="border px-2 py-1 rounded w-full"
          onChange={(e) => setNewStatus(e.target.value)}
        >
          {nextStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </Modal>
  );


  return (
    <div className="bg-white rounded-lg shadow-sm ">
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

      {detailModal}
      {statusModal}

    </div>
  );
};

export default OrderManager;
