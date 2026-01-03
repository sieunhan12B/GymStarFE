import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { NotificationContext } from "@/App";
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../../../utils/InvoicePDF';
import { orderService } from '../../../services/order.service';
import { reviewService } from '../../../services/review.service';
import dayjs from 'dayjs';
import { cartService } from '../../../services/cart.service';
import { useDispatch } from 'react-redux';
import { setCart } from '@/redux/cartSlice';
import AddedToCartToast from '../../../components/AddedToCartToast/AddedToCartToast';

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
    const allStatus = [
        'chờ xác nhận',
        'đã xác nhận',
        'đang xử lý',
        'đang giao',
        'giao thất bại',
        'đã giao'
    ];

    const cancelReasons = [
        "Đổi ý không muốn mua nữa",
        "Đặt nhầm sản phẩm/màu/size",
        "Tìm được chỗ khác rẻ hơn",
        "Thay đổi địa chỉ giao hàng",
        "Giao hàng quá lâu",
        "Muốn thay đổi phương thức thanh toán",
    ];

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

    const isPaid = orderData.payments[0]?.status === "thành công";
    const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.original_price * item.quantity,
        0
    );

    const productDiscount = orderData.items.reduce(
        (sum, item) =>
            sum + (item.original_price - item.price) * item.quantity,
        0
    );

    const voucherDiscount = orderData.discount_amount || 0;

    const finalTotal = orderData.total;


    /* ================== CANCEL ORDER ================== */
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
    const currentIndex = allStatus.indexOf(orderData.status);

    const handleBuyAgain = async (orderDetailId) => {
        try {
            const res = await orderService.buyAgain(orderDetailId);


            // get lại cart
            const cartRes = await cartService.getCart();
            dispatch(setCart(cartRes.data.data));

            const { product_name, color, size, quantity, thumbnail } = res.data.data;
            console.log(res.data.data)
            const product = {
                thumbnail,
                name: product_name
            }


            showNotification(<AddedToCartToast product={product} color={color} quantity={quantity} size={size} message={"Đã thêm sản phẩm vào giờ hàng"} />, 'success');

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

            // ✅ Update trạng thái item đã review
            setOrderData(prev => ({
                ...prev,
                items: prev.items.map(item =>
                    item.order_detail_id === reviewItem.order_detail_id
                        ? { ...item, is_review: true }
                        : item
                )
            }));


            // Reset modal
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
            width={520}
            destroyOnHidden
        >
            {reviewItem && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-center">
                        Đánh giá sản phẩm
                    </h2>

                    {/* Product info */}
                    <div className="flex gap-3 items-center">
                        <Image
                            src={reviewItem.product.thumbnail}
                            width={64}
                            height={64}
                            className="rounded"
                        />
                        <div>
                            <p className="font-semibold">
                                {reviewItem.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                Size {reviewItem.variant.size} | {reviewItem.variant.color}
                            </p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <p className="font-medium mb-1">
                            Chất lượng sản phẩm
                        </p>
                        <Rate
                            value={rating}
                            onChange={setRating}
                            className="text-amber-500"
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <p className="font-medium mb-1">Nhận xét</p>
                        <Input.TextArea
                            rows={4}
                            placeholder="Chia sẻ cảm nhận của bạn (tối thiểu 10 ký tự)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <p className="font-medium mb-1">
                            Hình ảnh (không bắt buộc)
                        </p>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                                setReviewImages([...e.target.files])
                            }
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        block
                        loading={submittingReview}
                        className="
                            bg-amber-500
                            hover:bg-amber-600
                            disabled:bg-amber-300
                            border-none
                            text-white
                            font-semibold
                            rounded-lg
                        "
                        onClick={handleSubmitReview}
                    >
                        Gửi đánh giá
                    </Button>



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
                    Trạng thái: <b>{orderData.status}</b>
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
                            {orderData.items.map(item => (
                                <div
                                    key={item.order_detail_id}
                                    className="flex gap-4 border-b pb-4 mb-4"
                                >
                                    <Image
                                        src={item.product.thumbnail}
                                        width={112}
                                    />

                                    <div className="flex-1">
                                        <h3 className="font-bold">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Size {item.variant.size} | {item.variant.color} | x{item.quantity}
                                        </p>

                                        <div className="flex max-w-64  gap-2 mt-14">
                                            {/* Nút đánh giá */}
                                            {orderData.status === "đã giao" && (
                                                item.is_review ? (
                                                    <Button disabled className=" bg-gray-300 w-1/2 text-gray-700 rounded-lg">
                                                        ✅ Đã đánh giá
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className=" bg-amber-500 w-1/2 hover:bg-amber-600 text-white rounded-lg font-semibold"
                                                        onClick={() => {
                                                            setReviewItem(item);
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                    >
                                                        ⭐ Đánh giá
                                                    </Button>
                                                )
                                            )}

                                            {/* Nút mua lại */}
                                            {["đã giao", "giao thất bại", "đã hủy", "đổi hàng"].includes(orderData.status) && (
                                                <Button
                                                    className=" bg-green-500 w-1/2 hover:bg-green-600 text-white rounded-lg font-semibold"
                                                    onClick={() => { handleBuyAgain(item.order_detail_id) }}
                                                >
                                                    🔁 Mua lại
                                                </Button>
                                            )}
                                        </div>


                                    </div>

                                    <div className="font-bold">
                                        {item.price.toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            ))}
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
                            <span>Tạm tính</span>
                            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                        </div>

                        {productDiscount > 0 && (
                            <div className="flex justify-between text-orange-400">
                                <span>Giảm giá sản phẩm</span>
                                <span>-{productDiscount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        )}

                        {voucherDiscount > 0 && (
                            <div className="flex justify-between text-orange-400">
                                <span>Voucher</span>
                                <span>-{voucherDiscount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between text-xl font-bold border-t pt-4">
                        <span>Thành tiền</span>
                        <span>{finalTotal.toLocaleString('vi-VN')}đ</span>
                    </div>


                    {isPaid && (
                        <PDFDownloadLink
                            document={<InvoicePDF orderData={orderData} />}
                            fileName={`hoadon_${orderData.order_id}.pdf`}
                        >
                            <button className="w-full bg-white text-black mt-6 py-2 rounded">
                                <DownloadOutlined /> Tải hóa đơn
                            </button>
                        </PDFDownloadLink>
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
