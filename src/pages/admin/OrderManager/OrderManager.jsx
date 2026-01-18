// React
import { useState, useEffect, useContext, useMemo } from "react";

// UI
import { Table, Tag, Button, Space, Modal, Tooltip, Image, Select } from "antd";
import { EditOutlined, SyncOutlined } from "@ant-design/icons";

// Utils
import dayjs from "dayjs";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";
import { formatPrice } from "@/utils/formatPrice";

// Components
import Header from "@/templates/AdminTemplate/Header";

// Services
import { orderService } from "@/services/order.service";

// Context
import { NotificationContext } from "@/App";

/* ================= CONSTANTS ================= */
const normalizeText = (text = "") =>
  text.toString().trim().toLowerCase();

const ORDER_STATUS_COLORS = {
  "chờ xác nhận": "orange",
  "đã xác nhận": "blue",
  "đang xử lý": "cyan",
  "đang giao": "geekblue",
  "đã giao": "green",
  "giao thất bại": "red",
  "đổi hàng": "purple",
  "đã hủy": "gray",
};

const PAYMENT_STATUS_COLORS = {
  "thành công": "green",
  "đang chờ": "orange",
  "thất bại": "red",
};

const PAYMENT_METHOD_COLORS = {
  cod: "gold",
  momo: "magenta",
};

const ALLOWED_TRANSITIONS = {
  "chờ xác nhận": ["đã xác nhận"],
  "đã xác nhận": ["đang xử lý"],
  "đang xử lý": ["đang giao"],
  "đang giao": ["đã giao", "giao thất bại"],
  "đã giao": ["đổi hàng"],
  "giao thất bại": [],
  "đổi hàng": [],
};

const ORDER_STATUS_FILTERS = Object.keys(ORDER_STATUS_COLORS).map((s) => ({
  text: s,
  value: s,
}));




const PAYMENT_STATUS_FILTERS = Object.keys(PAYMENT_STATUS_COLORS).map((s) => ({
  text: s,
  value: s,
}));

const PAYMENT_METHOD_FILTERS = [
  { text: "COD", value: "cod" },
  { text: "MOMO", value: "momo" },
];

/* ================= COMPONENT ================= */
const OrderManager = () => {
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  /* ===== FETCH ===== */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrder();
      setOrders(res?.data?.data || []);
      showNotification("Tải danh sách đơn hàng thành công!", "success");
    } catch {
      showNotification("Tải đơn hàng thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    document.title = "Quản lý đơn hàng - GymStar Admin";
  }, []);

  /* ===== HANDLERS ===== */
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openStatusModal = (order) => {
    const next = ALLOWED_TRANSITIONS[order.status] || [];
    if (!next.length) {
      showNotification("Đơn hàng này không thể đổi trạng thái!", "error");
      return;
    }

    setSelectedOrder(order);
    setNewStatus(next[0]);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await orderService.updateStatusOrder(selectedOrder.order_id, {
        status: newStatus,
      });
      showNotification("Cập nhật trạng thái thành công!", "success");
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Lỗi cập nhật trạng thái!",
        "error"
      );
    }
  };

  /* ===== FILTER ===== */
  const filteredOrders = useMemo(() => {
    if (!searchText) return orders;

    const keyword = removeVietnameseTones(normalizeText(searchText));

    return orders.filter((o) => {
      const orderId = normalizeText(String(o.order_id));
      const name = removeVietnameseTones(normalizeText(o.user?.full_name));
      const email = removeVietnameseTones(normalizeText(o.user?.email));
      const phone = normalizeText(o.phone);

      return (
        orderId.includes(keyword) ||
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [orders, searchText]);


  /* ===== TABLE ===== */
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "order_id",
      render: (id) => <b>#{id}</b>,
    },
    {
      title: "Khách hàng",
      render: (_, r) => (
        <>
          <b>{r.user?.full_name}</b>
          <div className="text-gray-500">{r.user?.email}</div>
        </>
      ),
    },
    {
      title: "Số SP",
      sorter: (a, b) => a.items.length - b.items.length,
      render: (_, r) => `${r.items.length} sản phẩm`,
    },
    {
      title: "Ngày tạo",
      dataIndex: "order_date",
      render: (d) =>
        <p>{d}</p>,

    },
    {
      title: "Phương thức TT",
      filters: PAYMENT_METHOD_FILTERS,
      onFilter: (v, r) =>
        normalizeText(r.payment?.method) === normalizeText(v),
      render: (_, r) => {
        const method = normalizeText(r.payment?.method);
        return (
          <Tag color={PAYMENT_METHOD_COLORS[method]}>
            {r.payment?.method || "—"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái TT",
      filters: PAYMENT_STATUS_FILTERS,
      onFilter: (v, r) =>
        normalizeText(r.payment?.status) === normalizeText(v),
      render: (_, r) => (
        <Tag color={PAYMENT_STATUS_COLORS[r.payment?.status]}>
          {r.payment?.status || "—"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status", // 🔥 QUAN TRỌNG
      filters: ORDER_STATUS_FILTERS,
      onFilter: (v, r) => normalizeText(r.status) === normalizeText(v),
      render: (status) => (
        <Tag color={ORDER_STATUS_COLORS[status]}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      sorter: (a, b) => a.total - b.total,
      render: (t) => <b>{t.toLocaleString()}₫</b>,
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, r) => {
        const canChange =
          ALLOWED_TRANSITIONS[r.status]?.length > 0 &&
          (r.payment?.method !== "MOMO" || r.payment?.status === "thành công");


        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => openDetailModal(r)}
              />
            </Tooltip>

            <Tooltip title={canChange ? "Đổi trạng thái" : "Không thể đổi"}>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                disabled={!canChange}
                onClick={() => openStatusModal(r)}
              >
                Đổi trạng thái
              </Button>
            </Tooltip>

          </Space>
        );
      },
    },
  ];

  /* ===== RENDER ===== */
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Header
        itemName="đơn hàng"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="theo mã đơn, tên, email, SĐT"

        showAddButton={false}
        showCategoryFilter={false}

        onReload={fetchOrders}
        reloading={loading}
      />


      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="order_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* DETAIL MODAL */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.order_id}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-4">

            {/* Thông tin nhận hàng */}
            <div className="border p-3 rounded-md">
              <h3 className="font-semibold text-lg mb-2">
                Thông tin nhận hàng
              </h3>
              <p>
                <b>Tên khách hàng:</b> {selectedOrder.user.full_name}
              </p>
              <p>
                <b>Tên người nhận:</b> {selectedOrder.receiver_name}
              </p>
              <p>
                <b>SĐT:</b> {selectedOrder.phone}
              </p>
              <p>
                <b>Địa chỉ:</b> {selectedOrder.address_detail}
              </p>
              {selectedOrder.note && (
                <p>
                  <b>Ghi chú:</b> {selectedOrder.note}
                </p>
              )}
            </div>

            {/* Thông tin đơn hàng */}
            <div className="border p-3 rounded-md">
              <h3 className="font-semibold text-lg mb-2">
                Thông tin đơn hàng
              </h3>
              <p>
                <b>Mã đơn:</b> {selectedOrder.order_id}
              </p>
              <p>
                <b>Ngày tạo:</b>{" "}
                {selectedOrder.order_date
                  ? dayjs(selectedOrder.order_date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                  : "—"}
              </p>
              <p>
                <b>Trạng thái:</b> {selectedOrder.status}
              </p>
              <p>
                <b>Tổng tiền:</b>{" "}

                {formatPrice(selectedOrder.total)}
              </p>
            </div>

            {/* Thanh toán */}
            <div className="border p-3 rounded-md">
              <h3 className="font-semibold text-lg mb-2">
                Thanh toán
              </h3>
              <p>
                <b>Phương thức:</b>{" "}
                {selectedOrder.payment?.method || "—"}
              </p>
              <p>
                <b>Trạng thái:</b>{" "}
                {selectedOrder.payment?.status || "—"}
              </p>
              <p>
                <b>Ngày thanh toán:</b>{" "}
                {selectedOrder.payment?.payment_date
                  ? dayjs(selectedOrder.payment.payment_date, "HH:mm:ss DD/MM/YYYY").format(
                    "DD/MM/YYYY"
                  )
                  : "—"}
              </p>
            </div>

            {/* Sản phẩm */}
            <div className="border p-3 rounded-md">
              <h3 className="font-semibold text-lg mb-2">
                Sản phẩm
              </h3>

              <table className="w-full text-sm border">
                <thead>
                  <tr className="border bg-gray-100">
                    <th className="p-2 border">Ảnh SP</th>
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
                      <td className="p-2 border">
                        <Image
                          src={item.thumbnail}
                          width={48}
                          height={48}
                          style={{
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                          preview={{ mask: "Xem ảnh" }}
                        />
                      </td>
                      <td className="p-2 border">{item.name}</td>
                      <td className="p-2 border">{item.color}</td>
                      <td className="p-2 border">{item.size}</td>
                      <td className="p-2 border">{item.quantity}</td>
                      <td className="p-2 border">
                        {formatPrice(item.final_price)}
                      </td>
                      <td className="p-2 border">
                        {formatPrice(item.quantity * item.final_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chi tiết giá */}
            <div className="border p-3 rounded-md">
              <h3 className="font-semibold text-lg mb-3">Chi tiết giá</h3>

              {selectedOrder && (
                <div className="space-y-3 text-sm">

                  {/* Số lượng sản phẩm */}
                  <div className="flex justify-between">
                    <span>Tổng số sản phẩm:</span>
                    <span>{selectedOrder.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng số lượng:</span>
                    <span>{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>

                  <hr />

                  {/* Chi tiết giảm giá */}
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng giá gốc:</span>
                    <span className="text-right">{formatPrice(selectedOrder.items.reduce((sum, item) => sum + item.price_original * item.quantity, 0))}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Tổng giảm sản phẩm:</span>
                    <span className="text-right">-{formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.price_original - item.final_price) * item.quantity, 0))}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Giảm voucher:</span>
                    <span className="text-right">-{formatPrice(selectedOrder.discount_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-right">{formatPrice(0)}</span>
                  </div>

                  <hr />

                  {/* Thành tiền */}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Thành tiền:</span>
                    <span className="text-right">{formatPrice(selectedOrder.total)}</span>
                  </div>

                </div>
              )}
            </div>





          </div>
        )}
      </Modal>


      {/* STATUS MODAL */}
      <Modal
        open={isStatusModalOpen}
        title="Cập nhật trạng thái đơn hàng"
        onOk={handleUpdateStatus}
        onCancel={() => setIsStatusModalOpen(false)}
      >
        <Select
          value={newStatus}
          onChange={setNewStatus}
          options={(ALLOWED_TRANSITIONS[selectedOrder?.status] || []).map(
            (s) => ({ label: s, value: s })
          )}
          className="w-full"
        />
      </Modal>
    </div>
  );
};

export default OrderManager;
