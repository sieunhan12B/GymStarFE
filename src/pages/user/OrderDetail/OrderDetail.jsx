import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    InboxOutlined,
    CarOutlined,
    FileTextOutlined,
    DownloadOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import {
    Modal,
    Image,
    Spin,
    Button,
    Input,
    Select,
    Rate
} from 'antd';
import { NotificationContext } from "@/App";
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../../../utils/InvoicePDF';
import { orderService } from '../../../services/order.service';
import { reviewService } from '../../../services/review.service';

const OrderDetail = () => {
    const { orderId } = useParams();
    const { showNotification } = useContext(NotificationContext);

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

      const res=  await reviewService.createReviewByUser(formData);

        showNotification(res.data.message, "success");

        // ✅ Update trạng thái item đã review
        setOrderData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.order_detail_id === reviewItem.order_detail_id
                    ? { ...item, isReviewed: true }
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
            destroyOnClose
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
        <div className="max-w-7xl min-h-screen mx-auto bg-gray-50">
            {/* Header */}
            <div className="bg-black text-white p-6">
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

                                        {orderData.status === "đã giao" && (
                                            <Button
                                                className="
                                                    mt-2
                                                    bg-amber-500
                                                    hover:bg-amber-600
                                                    border-none
                                                    text-white
                                                    font-semibold
                                                    rounded-lg
                                                "
                                                onClick={() => {
                                                    setReviewItem(item);
                                                    setIsReviewModalOpen(true);
                                                }}
                                            >
                                                ⭐ Đánh giá
                                            </Button>
                                        )}
                                    </div>

                                    <div className="font-bold">
                                        {item.price.toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="bg-black text-white rounded-lg p-6 h-fit">
                    <h2 className="font-bold text-lg mb-4">Tổng đơn</h2>

                    <p className="flex justify-between text-xl font-bold">
                        <span>Thành tiền</span>
                        <span>
                            {orderData.payments[0]?.total?.toLocaleString('vi-VN')}đ
                        </span>
                    </p>

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
