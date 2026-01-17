//  React & hooks
import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

//  Ant Design / Icons
import {
    InboxOutlined,
    CarOutlined,
    FileTextOutlined,
    DownloadOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    CheckCircleFilled,
} from '@ant-design/icons';
import {
    Modal,
    Image,
    Spin,
    Button,
    Input,
    Select,
    Rate,
    Tooltip
} from 'antd';

// Redux 
import { useDispatch } from 'react-redux';
import { setCart } from '@/redux/cartSlice';

// Components
import AddedToCartToast from '@/components/AddedToCartToast/AddedToCartToast';
import InvoicePDF from '@/components/InvoicePDF/InvoicePDF';

// Services
import { orderService } from '@/services/order.service';
import { reviewService } from '@/services/review.service';
import { cartService } from '@/services/cart.service';
import { paymentService } from '@/services/payment.service';

// Utils
import { generateSlug } from '@/utils/generateSlug';
import { formatPrice } from '@/utils/formatPrice';
import dayjs from 'dayjs';

// Context
import { NotificationContext } from "@/App";
import { PDFDownloadLink } from '@react-pdf/renderer';

// Constance
const allStatus = [
    'chờ xác nhận',
    'đã xác nhận',
    'đang xử lý',
    'đang giao',
    'giao thất bại',
    'đã giao'
];

const statusColor = {
    "chờ xác nhận": "text-yellow-300",
    "đã xác nhận": "text-blue-300",
    "đang xử lý": "text-indigo-300",
    "đang giao": "text-orange-300",
    "đã giao": "text-green-300",
    "đã hủy": "text-red-300",
};

const cancelReasons = [
    "Đổi ý không muốn mua nữa",
    "Đặt nhầm sản phẩm/màu/size",
    "Tìm được chỗ khác rẻ hơn",
    "Thay đổi địa chỉ giao hàng",
    "Giao hàng quá lâu",
    "Muốn thay đổi phương thức thanh toán",
];

const OrderDetail = () => {
    const { orderId } = useParams();
    const { showNotification } = useContext(NotificationContext);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('products');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ================== CANCEL ================== */
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    /* ================== REVIEW ================== */
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewImages, setReviewImages] = useState([]);
    const [submittingReview, setSubmittingReview] = useState(false);

    /* ================== FETCH ORDER ================== */
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await orderService.getDetailOrder(orderId);
                setOrderData(res.data.data);
            } catch (error) {
                console.error(error);
                showNotification("Không lấy được chi tiết đơn hàng", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading || !orderData) {
        return (
            <div className="flex justify-center mt-10">
                <Spin size="large" />
            </div>
        );
    }

    /* ================== DERIVED DATA ================== */

    // Giá gốc đơn hàng
    const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.original_price * item.quantity,
        0
    );

    // Giá giảm sp của đơn hàng
    const productDiscount = orderData.items.reduce(
        (sum, item) =>
            sum + (item.original_price - item.price) * item.quantity,
        0
    );

    // Tổng số lượng sản phẩm có  trong đơn
    const totalQuantity = orderData.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    // Đánh dấu tracking của trạng thái đơn hàng 
    const currentIndex = allStatus.indexOf(orderData.status);


    /* ================== HANDLE LOGIC ================== */

    const handlePayment = async () => {
        try {
            const res = await paymentService.reTryPayment({
                order_id: orderData.order_id
            });

            showNotification("Đang chuyển đến cổng thanh toán...", "success");

            // Nếu API trả về link thanh toán
            if (res.data?.payUrl) {
                window.location.href = res.data?.payUrl;
            }

        } catch (error) {
            console.error(error);
            showNotification(
                error?.response?.data?.message || "Thanh toán lại thất bại",
                "error"
            );
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason) {
            showNotification("Vui lòng chọn lý do huỷ", "error");
            return;
        }

        try {
            const payload = { reason: cancelReason };
            const res = await orderService.deleteOrder(orderId, payload);

            showNotification(
                res.data.message || "Huỷ đơn thành công",
                "success"
            );

            setOrderData(prev => ({
                ...prev,
                status: 'đã hủy'
            }));

            setIsCancelModalVisible(false);
            setCancelReason('');
        } catch (error) {
            console.error(error);
            showNotification(
                error?.response?.data?.message || "Huỷ đơn thất bại",
                "error"
            );
        }
    };

    const handleBuyAgain = async (orderDetailId) => {
        try {
            const res = await orderService.buyAgain(orderDetailId);


            // get lại cart
            const cartRes = await cartService.getCart();
            dispatch(setCart(cartRes.data.data));

            const { product_name, color, size, quantity, thumbnail } = res.data.data;
            const product = {
                thumbnail,
                name: product_name
            }
            const produc_variant = {
                color,
                size,
            }


            showNotification(<AddedToCartToast product={product} product_variant={produc_variant} quantity={quantity} message={"Đã thêm sản phẩm vào giờ hàng"} />, 'success');

        } catch (error) {
            console.error(error);
            showNotification(
                error?.response?.data?.message || "Mua lại thất bại",
                "error"
            );
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewItem) return;
        try {
            setSubmittingReview(true);
            const formData = new FormData();
            formData.append("order_detail_id", reviewItem.order_detail_id);
            formData.append("rating", rating);
            formData.append("comment", comment);
            reviewImages.forEach(img =>
                formData.append("images", img)
            );
            const res = await reviewService.createReviewByUser(formData);
            showNotification(res.data.message, "success");
            setOrderData(prev => ({
                ...prev,
                items: prev.items.map(item =>
                    item.order_detail_id === reviewItem.order_detail_id
                        ? { ...item, is_review: true }
                        : item
                )
            }));
            setIsReviewModalOpen(false);
            setReviewItem(null);
            setRating(5);
            setComment('');
            setReviewImages([]);
        } catch (error) {
            console.error(error);
            showNotification(error.response.data.message, "error");
        } finally {
            setSubmittingReview(false);
        }
    };


    /* ================== REVIEW MODAL ================== */
    const renderModalReview = () => (
        <Modal
            open={isReviewModalOpen}
            onCancel={() => setIsReviewModalOpen(false)}
            footer={null}
            width={600}
        >
            {reviewItem && (
                <div className="space-y-5">
                    <h2 className="text-xl font-bold text-center">
                        {reviewItem.review_id ? "Đánh giá của bạn" : "Đánh giá sản phẩm"}
                    </h2>

                    {/* Product info */}
                    {reviewItem.product && (
                        <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                            <Image
                                src={reviewItem.product.thumbnail}
                                width={70}
                                className="rounded"
                            />
                            <div>
                                <p className="font-semibold">{reviewItem.product.name}</p>
                                <p className="text-sm text-gray-500">
                                    Size {reviewItem.variant?.size} | {reviewItem.variant?.color}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Rating */}
                    <div>
                        <p className="font-medium mb-1">Chất lượng sản phẩm</p>
                        <Rate
                            value={reviewItem.review_id ? reviewItem.rating : rating}
                            disabled={!!reviewItem.review_id}
                            onChange={setRating}
                            className="text-amber-500"
                        />
                    </div>

                    {/* Comment */}
                    {(!reviewItem.review_id || reviewItem.comment) && (
                        <div>
                            <p className="font-medium mb-1">Nhận xét</p>
                            <Input.TextArea
                                rows={4}
                                value={reviewItem.review_id ? reviewItem.comment : comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={!!reviewItem.review_id}
                                placeholder="Chia sẻ cảm nhận của bạn..."
                            />
                        </div>
                    )}


                    {/* Review images */}
                    {reviewItem.review_id ? (
                        reviewItem.images?.length > 0 && (
                            <div>
                                <p className="font-medium mb-2">Hình ảnh</p>
                                <div className="flex gap-2 flex-wrap">
                                    {reviewItem.images.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={img}
                                            width={90}
                                            height={90}
                                            className="rounded object-cover"
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <div>
                            <p className="font-medium mb-1">Hình ảnh (không bắt buộc)</p>
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setReviewImages([...e.target.files])}
                            />
                        </div>
                    )}

                    {/* Reply from shop */}
                    {reviewItem.reply && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">

                                <p className="font-semibold text-green-700">
                                    Phản hồi từ shop
                                </p>
                            </div>

                            <p className="text-gray-700 ml-10">
                                {reviewItem.reply.message}
                            </p>

                            <p className="text-xs text-gray-400 ml-10 mt-1">
                                {dayjs(reviewItem.reply.replied_at, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY HH:mm")}
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    {!reviewItem.review_id && (
                        <Button
                            block
                            loading={submittingReview}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg h-11"
                            onClick={handleSubmitReview}
                        >
                            Gửi đánh giá
                        </Button>
                    )}
                </div>
            )}
        </Modal>
    );



    /* ================== RENDER ================== */
    return (
        <div className="max-w-7xl  mx-auto bg-gray-50 mb-12">
            {/* Header */}
            <div className="bg-[#4455D5] text-white p-6">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
                <p>Mã đơn: {orderData.order_id}</p>
                <p className="mt-1">
                    Trạng thái:{" "}
                    <b className={statusColor[orderData.status]}>
                        {orderData.status}
                    </b>
                </p>

            </div>

            <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 bg-white rounded-lg border">
                    {/* Tabs */}
                    <div className="flex border-b">
                        {[
                            { id: 'products', label: 'Sản phẩm', icon: InboxOutlined },
                            { id: 'tracking', label: 'Theo dõi', icon: CarOutlined },
                            { id: 'info', label: 'Thông tin', icon: FileTextOutlined }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 font-semibold flex items-center justify-center gap-2
                                    ${activeTab === tab.id
                                        ? 'border-b-2 border-black'
                                        : 'text-gray-400'
                                    }`}
                            >
                                <tab.icon /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Products */}
                    {activeTab === 'products' && (
                        <div className="p-6">
                            {orderData.items.map(item => {
                               
                                const categorySlug = generateSlug(item.product.name).split("-").slice(0, 2).join("-");
                                const productSlug = generateSlug(item.product.name);

                                const productLink = `/san-pham/${categorySlug}/${productSlug}/${item.product.product_id}`;
                                return (
                                    <div
                                        key={item.order_detail_id}
                                        className="flex gap-4 border-b pb-4 mb-4"
                                    >
                                        <Image
                                            src={item.product.thumbnail}
                                            width={112}
                                        />

                                        <div className="flex-1">
                                            <Link to={productLink}>
                                                <h3 className="font-bold">
                                                    {item.product.name}
                                                </h3>
                                            </Link>

                                            <p className="text-sm text-gray-500">
                                                Size {item.variant.size} | {item.variant.color} | x{item.quantity}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                SKU: {item.variant.sku}
                                            </p>


                                            <div className="flex max-w-64 gap-2 mt-4">
                                                {orderData.status === "đã giao" && (
                                                    <Button
                                                        className={item.is_review
                                                            ? "bg-gray-300 w-1/2 text-gray-700 rounded-lg"
                                                            : "bg-amber-500 w-1/2 hover:bg-amber-600 text-white rounded-lg font-semibold"}
                                                        onClick={async () => {
                                                            if (item.is_review) {
                                                                // Lấy chi tiết review từ API
                                                                try {
                                                                    const res = await reviewService.getReviewOrderDetail(item.order_detail_id);
                                                                    setReviewItem(res.data.data); // dữ liệu review từ API
                                                                    setIsReviewModalOpen(true);
                                                                } catch (error) {
                                                                    showNotification("Không lấy được chi tiết đánh giá", "error");
                                                                }
                                                            } else {
                                                                // Tạo review mới
                                                                setReviewItem(item);
                                                                setRating(5);
                                                                setComment("");
                                                                setReviewImages([]);
                                                                setIsReviewModalOpen(true);
                                                            }
                                                        }}
                                                    >
                                                        {item.is_review ? "✅ Xem đánh giá" : "⭐ Đánh giá"}
                                                    </Button>
                                                )}

                                                {["đã giao", "giao thất bại", "đã hủy", "đổi hàng"].includes(orderData.status) && (
                                                    <Button
                                                        className="bg-green-500 w-1/2 hover:bg-green-600 text-white rounded-lg font-semibold"
                                                        onClick={() => handleBuyAgain(item.order_detail_id)}
                                                    >
                                                        🔁 Mua lại
                                                    </Button>
                                                )}
                                            </div>



                                        </div>

                                        <div className="text-right">
                                            {item.original_price > item.price && (
                                                <p className="text-sm line-through text-gray-400">
                                                    {(item.original_price * item.quantity).toLocaleString('vi-VN')}đ
                                                </p>
                                            )}

                                            <p className="font-bold text-red-500">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                                            </p>
                                        </div>


                                    </div>
                                );

                            })}
                        </div>
                    )}

                    {/* Tab tracking */}
                    {activeTab === 'tracking' && (
                        <div className="flex flex-col space-y-6 p-6">
                            {allStatus.map((status, i) => {
                                const isCompleted = i < currentIndex;
                                const isCurrent = i === currentIndex;

                                return (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            {isCompleted ? (
                                                <CheckCircleFilled style={{ color: 'black', fontSize: 28 }} />
                                            ) : isCurrent ? (
                                                <div className="w-8 h-8 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-md animate-pulse">
                                                    <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                                            )}
                                            {i < allStatus.length - 1 && (
                                                <div className={`w-px h-full ${i < currentIndex ? 'bg-black' : 'bg-gray-300'} mt-1`}></div>
                                            )}
                                        </div>
                                        <Tooltip title={status} placement="topLeft">
                                            <div>
                                                <p className={`font-bold ${isCurrent ? 'text-yellow-600' : isCompleted ? 'text-black' : 'text-gray-500'}`}>{status}</p>
                                            </div>
                                        </Tooltip>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Tab thông tin */}
                    {activeTab === 'info' && (
                        <div className="space-y-4 p-6">
                            <div className="flex items-center gap-2">
                                <EnvironmentOutlined />
                                <span className="font-medium">Người nhận:</span> {orderData.receiver_name}
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneOutlined />
                                <span className="font-medium">Số điện thoại:</span> {orderData.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <EnvironmentOutlined />
                                <span className="font-medium">Địa chỉ:</span> {orderData.address_detail}
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockCircleOutlined />
                                <span className="font-medium">Ngày đặt hàng:</span>
                                {dayjs(orderData.order_date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")}
                            </div>

                            <div className="flex items-center gap-2">
                                <ClockCircleOutlined />
                                <span className="font-medium">Ngày nhận hàng:</span>
                                {orderData.received_date
                                    ? dayjs(orderData.received_date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                                    : "Đang cập nhật"}
                            </div>
                            {orderData.note && (
                                <div className="flex items-start gap-2">
                                    <FileTextOutlined />
                                    <span className="font-medium">Ghi chú:</span>
                                    <span>{orderData.note}</span>
                                </div>
                            )}


                        </div>
                    )}

                </div>

                {/* Sidebar */}
                <div className="bg-black text-white rounded-lg p-6 h-fit space-y-6">
                    <h2 className="font-bold text-lg mb-4">Tổng đơn</h2>

                    <p className="flex justify-between text-xl font-bold">
                        <span>Phương thức thanh toán</span>
                        <span>
                            {orderData.payments[0]?.method}
                        </span>
                    </p>
                    <p className="flex justify-between text-xl font-bold">
                        <span>Trạng thái thanh toán</span>
                        <span>
                            {orderData.payments[0]?.status}
                        </span>
                    </p>

                    {orderData.payments[0]?.payment_date != null && (
                        <p className="flex justify-between text-xl font-bold">
                            <span>Ngày thanh toán</span>
                            <span>
                                {orderData.payments[0]?.payment_date
                                    ? dayjs(orderData.payments[0].payment_date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                                    : "—"
                                }
                            </span>
                        </p>
                    )}
                    <div className="border-t pt-4 space-y-2 text-gray-300 text-sm">
                        <div className="flex justify-between">
                            <span>Tổng số lượng</span>
                            <span>{totalQuantity}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Tạm tính ({orderData.items.length} sản phẩm)</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        {productDiscount > 0 && (
                            <div className="flex justify-between text-orange-400">
                                <span>Giảm giá sản phẩm</span>
                                <span>-{formatPrice(productDiscount)}</span>
                            </div>
                        )}

                        {orderData.discount_amount > 0 && (
                            <div className="flex justify-between text-orange-400">
                                <span>Voucher</span>
                                <span>-{formatPrice(orderData.discount_amount)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-4">
                        <span>Thành tiền</span>
                        <span>{formatPrice(orderData.total)}</span>
                    </div>

                    {orderData.payments[0]?.status === "thành công" && (
                        <PDFDownloadLink
                            document={<InvoicePDF orderData={orderData} />}
                            fileName={`hoadon_${orderData.order_id}.pdf`}
                        >
                            <button className="w-full bg-white text-black mt-6 py-2 rounded">
                                <DownloadOutlined /> Tải hóa đơn
                            </button>
                        </PDFDownloadLink>
                    )}

                    {orderData.status === "đã hủy" && (
                        <button disabled className="w-full bg-red-500 text-white font-bold py-2 rounded mt-3 cursor-not-allowed hover:bg-red-500 whitespace-nowrap text-center">
                            ❌ Đơn hàng đã hủy
                        </button>
                    )}

                    {/* Thanh toán ngay */}
                    {(
                        orderData.payments[0]?.method === "MOMO" &&
                        orderData.payments[0]?.status === "đang chờ" &&
                        orderData.status === "chờ xác nhận"
                    ) &&
                        (
                            <button
                                onClick={handlePayment}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-3 py-2 rounded font-semibold"
                            >
                                💳 Thanh toán ngay
                            </button>
                        )}

                    {/* Thanh toán lại */}
                    {(
                        orderData.payments[0]?.method === "MOMO" &&
                        orderData.payments[0]?.status === "thất bại" &&
                        orderData.status === "chờ xác nhận"
                    ) &&
                        (
                            <button
                                onClick={handlePayment}
                                className="w-full bg-green-500 hover:bg-green-600 text-white mt-3 py-2 rounded font-semibold"
                            >
                                🔁 Thanh toán lại
                            </button>
                        )}

                    {/* Cancel */}
                    {["chờ xác nhận", "đã xác nhận", "đang xử lý"].includes(orderData.status) && (
                        <button
                            className="w-full bg-red-400 hover:bg-red-500 text-white mt-3 py-2 rounded"
                            onClick={() => setIsCancelModalVisible(true)}
                        >
                            Huỷ đơn
                        </button>
                    )}
                    <Modal
                        title="Huỷ đơn hàng"
                        open={isCancelModalVisible}
                        onCancel={() => setIsCancelModalVisible(false)}
                        footer={[
                            <Button key="back" onClick={() => setIsCancelModalVisible(false)}>
                                Hủy
                            </Button>,
                            <Button
                                key="submit"
                                type="primary"
                                danger
                                onClick={handleCancelOrder}
                            >
                                Xác nhận huỷ
                            </Button>
                        ]}
                    >
                        <p className="mb-3">Chọn lý do huỷ đơn:</p>
                        <Select
                            value={cancelReason}
                            onChange={setCancelReason}
                            className="w-full"
                        >
                            {cancelReasons.map((reason, index) => (
                                <Select.Option key={index} value={reason}>
                                    {reason}
                                </Select.Option>
                            ))}
                        </Select>
                    </Modal>
                </div>
            </div>

            {renderModalReview()}

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 flex gap-2">
                <InfoCircleOutlined className="text-blue-600" />
                <p className="text-sm">
                    Vui lòng kiểm tra hàng trước khi thanh toán.
                </p>
            </div>
        </div>
    );
};

export default OrderDetail;
