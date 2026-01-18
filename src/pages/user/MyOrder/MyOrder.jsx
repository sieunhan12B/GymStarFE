// ================== IMPORTS ==================
//  React & Router
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//  Ant Design / Icons
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TruckOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    SearchOutlined
} from "@ant-design/icons";
import { Button, Modal, Pagination, Select, Tooltip } from "antd";

// Services
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";

// Utils
import { formatPrice } from "@/utils/formatPrice";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";

// Context
import { NotificationContext } from "@/App";


/* ================== CONSTANCE ================== */
const orderStatuses = [
    { key: "all", label: "Tất cả" },
    { key: "chờ xác nhận", label: "Chờ xác nhận" },
    { key: "đã xác nhận", label: "Đã xác nhận" },
    { key: "đang xử lý", label: "Đang xử lý" },
    { key: "đang giao", label: "Đang giao" },
    { key: "đã giao", label: "Đã giao" },
    { key: "giao thất bại", label: "Giao thất bại" },
    { key: "đã hủy", label: "Đã hủy" },
    { key: "đổi hàng", label: "Đổi hàng" }
];
const cancelReasons = [
    "Đổi ý không muốn mua nữa",
    "Đặt nhầm sản phẩm/màu/size",
    "Tìm được chỗ khác rẻ hơn",
    "Thay đổi địa chỉ giao hàng",
    "Giao hàng quá lâu",
    "Muốn thay đổi phương thức thanh toán",
];

const PAGE_SIZE = 5;


const MyOrder = () => {
    // ================== CONTEXT / ROUTER ==================
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    // ================== STATES ==================
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("all");

    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [isExchangeModalVisible, setIsExchangeModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");



    // ================== FETCH ==================
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderService.getOrderByUser();
            setOrders(res.data.data || []);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            showNotification(error.response.data.message, "error")
        } finally {
            setLoading(false);
        }
    };


    // ================== EFFECTS ==================
    useEffect(() => {
        fetchOrders();
    }, []);


    // ================== HANDLERS ==================
    const handleCancelOrder = async (orderId) => {

        if (!cancelReason) {
            showNotification("Vui lòng chọn lý do huỷ", "error");
            return;
        }

        try {
            setCancelLoading(true);
            const payload = {
                reason: cancelReason,
            }
            const res = await orderService.deleteOrder(orderId, payload);

            showNotification(res.data.message || "Huỷ đơn thành công", "success");

            // Cập nhật trạng thái orderData
            fetchOrders();

            setIsCancelModalVisible(false);
            setCancelReason("");
            setSelectedOrderId(null);

        } catch (error) {
            console.log(error);
            showNotification(error?.response?.data?.message || "Huỷ đơn thất bại", "error");
        } finally {
            setCancelLoading(false); // 🔥 KẾT THÚC LOADING
        }
    };

    const handleRepay = async (order) => {
        try {
            // Ví dụ: gọi API tạo lại link thanh toán
            const data = {
                order_id: order.order_id,
            }
            const res = await paymentService.reTryPayment(data);

            // Nếu backend trả về link thanh toán
            if (res.data?.payUrl) {
                window.location.href = res.data.payUrl;
            } else {
                showNotification("Không thể tạo lại thanh toán", "error");
            }
        } catch (error) {
            console.error(error);
            showNotification(
                error?.response?.data?.message || "Thanh toán lại thất bại",
                "error"
            );
        }
    };


    /* ================== HELPERS ================== */
    const getStatusIcon = (status) => {
        switch (status) {
            case "chờ xác nhận":
                return <ClockCircleOutlined />;
            case "đã xác nhận":
                return <CheckCircleOutlined />;
            case "đang xử lý":
                return <SyncOutlined />;
            case "đang giao":
                return <TruckOutlined />;
            case "đã giao":
                return <CheckCircleOutlined />;
            case "giao thất bại":
            case "đã hủy":
                return <CloseCircleOutlined />;
            default:
                return <ShoppingCartOutlined />;
        }
    };

    const getBadgeColor = (status) => {
        switch (status) {
            case "chờ xác nhận":
                return "bg-yellow-100 text-yellow-700";
            case "đã xác nhận":
                return "bg-blue-100 text-blue-700";
            case "đang xử lý":
                return "bg-purple-100 text-purple-700";
            case "đang giao":
                return "bg-orange-100 text-orange-700";
            case "đã giao":
                return "bg-green-100 text-green-700";
            case "đã hủy":
            case "giao thất bại":
                return "bg-gray-200 text-gray-600";
            default:
                return "bg-gray-200 text-gray-600";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "chờ xác nhận":
                return "bg-yellow-100 text-yellow-700";
            case "đã xác nhận":
                return "bg-blue-100 text-blue-700";
            case "đang xử lý":
                return "bg-purple-100 text-purple-700";
            case "đang giao":
                return "bg-orange-100 text-orange-700";
            case "đã giao":
                return "bg-green-100 text-green-700";
            case "giao thất bại":
                return "bg-red-100 text-red-700";
            case "đã hủy":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };


    /* ================== FILTER ================== */
    const filteredOrders = orders.filter((order) => {
        // ===== Filter theo tab status =====
        if (activeTab !== "all" && order.status !== activeTab) return false;

        // ===== Filter theo trạng thái thanh toán =====
        if (paymentStatusFilter !== "all") {
            if (!order.payment) return false;

            if (paymentStatusFilter === "paid" && order.payment.status !== "thành công")
                return false;

            if (paymentStatusFilter === "pending" && order.payment.status !== "đang chờ")
                return false;

            if (paymentStatusFilter === "failed" && order.payment.status !== "thất bại")
                return false;
        }

        // ===== Filter theo phương thức =====
        if (paymentMethodFilter !== "all") {
            if (!order.payment) return false;
            if (order.payment.method !== paymentMethodFilter) return false;
        }

        // ===== SEARCH: Mã đơn + Tên sản phẩm =====
        if (searchText) {
            const keyword = removeVietnameseTones(searchText.toLowerCase());

            const orderId = order.order_id?.toString() || "";

            const productNames = order.items
                .map(item =>
                    removeVietnameseTones(item.name || "").toLowerCase()
                )
                .join(" ");

            if (
                !orderId.includes(keyword) &&
                !productNames.includes(keyword)
            ) {
                return false;
            }
        }

        return true;
    });



    /* ================== PAGINATION ================== */
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    /* ================== LẤY SỐ LƯỢNG CỦA TỪNG TRẠNG THÁI ================== */
    const getOrderCountByStatus = (statusKey) => {
        if (statusKey === "all") return orders.length;
        return orders.filter(order => order.status === statusKey).length;
    };


    /* ================== RENDER FUNCTION ================== */
    const renderExchangeOrder = () => {
        return (
            <Modal
                title="Hướng dẫn đổi hàng"
                open={isExchangeModalVisible}
                onCancel={() => setIsExchangeModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsExchangeModalVisible(false)}>
                        Đã hiểu
                    </Button>
                ]}
            >
                <div className="space-y-3 text-gray-700">
                    <p>📝 <strong>Điều kiện đổi hàng:</strong></p>
                    <ul className="list-disc pl-5 text-sm">
                        <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng</li>
                        <li>Yêu cầu đổi hàng trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng</li>
                        <li>Chỉ hỗ trợ đổi size hoặc màu (không hoàn tiền)</li>
                    </ul>

                    <p>📦 <strong>Cách thức đổi hàng:</strong></p>
                    <ul className="list-disc pl-5 text-sm">
                        <li>Liên hệ CSKH qua hotline hoặc fanpage</li>
                        <li>Cung cấp mã đơn hàng và sản phẩm cần đổi</li>
                        <li>Nhân viên sẽ hướng dẫn gửi hàng đổi</li>
                    </ul>

                    <p className="text-sm text-red-500">
                        ⚠️ Phí vận chuyển đổi hàng (nếu có) khách hàng tự chi trả
                    </p>
                </div>
            </Modal>
        )
    };


    /* ================== RENDER ================== */
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b min-h-[128px] ">
                <div className="">
                    <h2 className="text-2xl font-bold">Đơn hàng của tôi</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Theo dõi và quản lý các đơn hàng của bạn
                    </p>
                </div>

            </div>

            {/* Tabs */}
            <div className="border-b overflow-x-auto">
                <div className="flex gap-2 p-4 min-w-max">
                    {orderStatuses.map((status) => {
                        const count = getOrderCountByStatus(status.key);

                        return (
                            <button
                                key={status.key}
                                onClick={() => {
                                    setActiveTab(status.key);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2
                ${activeTab === status.key
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <span>{status.label}</span>

                                {count > 0 && status.key !== "all" && (
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(status.key)}`}
                                    >
                                        {count}
                                    </span>
                                )}

                            </button>
                        );
                    })}

                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b">
                {/* Bên trái: Filter */}
                <div className="flex flex-wrap gap-4">
                    <Select
                        value={paymentStatusFilter}
                        onChange={(value) => {
                            setPaymentStatusFilter(value);
                            setCurrentPage(1);
                        }}
                        className="w-48"
                    >
                        <Select.Option value="all">Tất cả thanh toán</Select.Option>
                        <Select.Option value="paid">Đã thanh toán</Select.Option>
                        <Select.Option value="pending">Chưa thanh toán</Select.Option>
                        <Select.Option value="failed">Thất bại</Select.Option>
                    </Select>

                    <Select
                        value={paymentMethodFilter}
                        onChange={(value) => {
                            setPaymentMethodFilter(value);
                            setCurrentPage(1);
                        }}
                        className="w-48"
                    >
                        <Select.Option value="all">Tất cả phương thức</Select.Option>
                        <Select.Option value="MOMO">MOMO</Select.Option>
                        <Select.Option value="COD">COD</Select.Option>
                    </Select>

                    {(paymentStatusFilter !== "all" || paymentMethodFilter !== "all") && (
                        <Button
                            onClick={() => {
                                setPaymentStatusFilter("all");
                                setPaymentMethodFilter("all");
                            }}
                        >
                            Xóa filter
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-7 pr-4 py-2 border rounded-lg text-sm w-72 
                   focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>


                    <div className="text-sm text-gray-500">
                        Tìm thấy <strong>{filteredOrders.length}</strong> đơn
                    </div>
                </div>
            </div>



            {/* Orders */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">
                        Đang tải đơn hàng...
                    </div>
                ) : paginatedOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingCartOutlined className="text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-4">
                            Bạn chưa có đơn hàng nào
                        </p>
                    </div>
                ) : (
                    paginatedOrders.map((order) => {
                        const firstItem = order.items[0];
                        const extraCount = order.items.length - 1;

                        return (
                            <div
                                key={order.order_id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition"
                            >
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">
                                            Mã đơn: {order.order_id}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Ngày đặt: {order.order_date}
                                        </p>

                                        {/* Badge thanh toán */}
                                        <div className="mt-1">
                                            {!order.payment ? (
                                                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                    Chưa thanh toán
                                                </span>
                                            ) : order.payment.status === "thành công" ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                    ✅ {order.payment.method} • {order.payment.status}
                                                </span>
                                            ) : order.payment.status === "thất bại" ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                    ❌ {order.payment.method} • {order.payment.status}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                                    ⏳ {order.payment.method} • {order.payment.status}
                                                </span>
                                            )}

                                        </div>
                                    </div>

                                    <div
                                        className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </div>
                                </div>


                                {/* Item */}
                                <div className="p-6 flex gap-4">
                                    <img
                                        src={firstItem.thumbnail}
                                        alt={firstItem.name}
                                        className="w-20 h-20 object-cover rounded-lg border"
                                    />

                                    <div className="flex-1">
                                        <h4 className="font-medium">
                                            {firstItem.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            SL: {firstItem.quantity} | Size:{" "}
                                            {firstItem.size} | Màu:{" "}
                                            {firstItem.color}
                                        </p>

                                        {extraCount > 0 && (
                                            <p className="text-sm text-gray-500">
                                                + {extraCount} sản phẩm khác
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatPrice(
                                                firstItem.final_price
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Tooltip
                                            title={order.status === "đã giao" ? "⭐ Bạn có thể đánh giá sản phẩm" : ""}
                                        >
                                            <button
                                                onClick={() => navigate(`/chi-tiet-don-hang/${order.order_id}`)}
                                                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                                            >
                                                Chi tiết
                                            </button>
                                        </Tooltip>


                                        {order.status === "đã giao" && (
                                            <Tooltip title="Hướng dẫn đổi hàng">
                                                <button
                                                    onClick={() => setIsExchangeModalVisible(true)}
                                                    className="px-4 py-2 border border-blue-400 text-blue-600 rounded-lg text-sm hover:bg-blue-50"
                                                >
                                                    Đổi hàng
                                                </button>
                                            </Tooltip>
                                        )}
                                        {renderExchangeOrder()}

                                        {/* Thanh toán ngay */}
                                        {(!order.payment || order.payment.status === "đang chờ") &&
                                            order.status === "chờ xác nhận" &&
                                            order.payment?.method !== "COD" && (

                                                <Tooltip title="Thanh toán ngay">
                                                    <button
                                                        onClick={() => handleRepay(order)}
                                                        className="px-4 py-2 border border-blue-400 text-blue-600 rounded-lg text-sm hover:bg-blue-50"
                                                    >
                                                        Thanh toán ngay
                                                    </button>
                                                </Tooltip>
                                            )}

                                        {order.payment?.status === "thất bại" &&
                                            order.status === "chờ xác nhận" &&
                                            order.payment?.method !== "COD" && (

                                                <Tooltip title="Thanh toán lại đơn hàng">
                                                    <button
                                                        onClick={() => handleRepay(order)}
                                                        className="px-4 py-2 border border-green-400 text-green-600 rounded-lg text-sm hover:bg-green-50"
                                                    >
                                                        Thanh toán lại
                                                    </button>
                                                </Tooltip>
                                            )}




                                        {["chờ xác nhận", "đã xác nhận", "đang xử lý", "đang giao"].includes(order.status) && (
                                            <Tooltip title="Huỷ đơn có thể ảnh hưởng đến ưu đãi của bạn">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrderId(order.order_id);
                                                        setIsCancelModalVisible(true);
                                                    }}
                                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                                                >
                                                    Hủy đơn
                                                </button>
                                            </Tooltip>





                                        )}
                                        <Modal
                                            title="Huỷ đơn hàng"
                                            open={isCancelModalVisible}
                                            onCancel={() => setIsCancelModalVisible(false)}
                                            footer={[
                                                <Button key="back" onClick={() => setIsCancelModalVisible(false)}>Hủy</Button>,
                                                <Button
                                                    key="submit"
                                                    type="primary"
                                                    danger
                                                    loading={cancelLoading}
                                                    onClick={() => handleCancelOrder(selectedOrderId)}
                                                >
                                                    Xác nhận huỷ
                                                </Button>

                                            ]}
                                        >
                                            <p className='mb-3'>Chọn lý do huỷ đơn:</p>
                                            <Select
                                                placeholder="Chọn lý do huỷ"
                                                value={cancelReason}
                                                onChange={(value) => setCancelReason(value)}
                                                className="w-full"
                                            >
                                                {cancelReasons.map((reason, index) => (
                                                    <Select.Option key={index} value={reason}>{reason}</Select.Option>
                                                ))}
                                            </Select>
                                        </Modal>

                                    </div>



                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                        <p className="text-xl font-bold">
                                            {formatPrice(order.total)}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {
                filteredOrders.length > PAGE_SIZE && (
                    <div className="flex justify-center pb-6">
                        <Pagination
                            current={currentPage}
                            pageSize={PAGE_SIZE}
                            total={filteredOrders.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )
            }
        </div >
    );
};

export default MyOrder;
