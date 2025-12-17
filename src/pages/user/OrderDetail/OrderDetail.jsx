import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    ArrowLeftOutlined,
    InboxOutlined,
    CarOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    CreditCardOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    DownloadOutlined,
    MessageOutlined,
    InfoCircleOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import { Modal, Tooltip, Image, Spin, Button, Input, Select } from 'antd';
import { orderService } from '@/services/order.service';
import { NotificationContext } from "@/App";
import InvoicePrint from '../../../components/InvoicePrint/InvoicePrint';
import '@/components/InvoicePrint/print.css';


const OrderDetail = () => {
    const { orderId } = useParams();
    const [activeTab, setActiveTab] = useState('products');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const { showNotification } = useContext(NotificationContext);

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

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await orderService.getDetailOrder(orderId);
                setOrderData(res.data.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleCancelOrder = async () => {
        console.log(orderId);
        console.log(cancelReason);
        if (!cancelReason) {
            showNotification("Vui lòng chọn lý do huỷ", "error");
            return;
        }

        try {
            const payload = {
                reason: cancelReason,
            }
            const res = await orderService.deleteOrder(orderId, payload);
            console.log(res)
            showNotification(res.data.message || "Huỷ đơn thành công", "success");

            // Cập nhật trạng thái orderData
            setOrderData(prev => ({ ...prev, status: 'đã hủy' }));

            setIsCancelModalVisible(false);
            setCancelReason('');
        } catch (error) {
            console.log(error);
            showNotification(error?.response?.data?.message || "Huỷ đơn thất bại", "error");
        }
    };

    if (loading || !orderData) return <div className="flex justify-center mt-10"><Spin size="large" /></div>;

    const currentIndex = allStatus.indexOf(orderData.status);

    return (
        <div className="max-w-7xl mx-auto bg-gray-50">
            {/* Header */}
            <div className="bg-black text-white p-6">
                <button className="flex items-center text-gray-300 mb-4">
                    <ArrowLeftOutlined className="mr-2" /> Quay lại
                </button>
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
                <p>Mã đơn: {orderData.order_id}</p>
                <p className="mt-1">Trạng thái: <span className="font-bold">{orderData.status}</span></p>
            </div>

            <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
                {/* Nội dung chính */}
                <div className="lg:col-span-2 bg-white rounded-lg border">
                    {/* Tabs */}
                    <div className="flex border-b">
                        {[
                            { id: 'products', label: 'Sản phẩm', icon: InboxOutlined },
                            { id: 'tracking', label: 'Theo dõi đơn hàng', icon: CarOutlined },
                            { id: 'info', label: 'Thông tin vận chuyển', icon: FileTextOutlined }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 font-semibold flex items-center justify-center gap-2 ${activeTab === tab.id ? 'border-b-2 border-black' : 'text-gray-400'}`}
                            >
                                <tab.icon /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* Tab sản phẩm */}
                        {activeTab === 'products' && orderData.items.map(item => (
                            <div key={item.order_detail_id} className="flex gap-4 border-b pb-4 mb-4">
                                <Image
                                    src={item.product.thumbnail}
                                    alt={item.product.name}
                                    width={112}
                                    height={112}
                                    className="rounded"
                                    preview={{ mask: <div className="text-white">Xem ảnh</div> }}
                                    fallback="https://via.placeholder.com/112"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold">{item.product.name}</h3>
                                    <p className="text-sm text-gray-500">SKU: {item.variant.sku}</p>
                                    <p className="text-sm">Size {item.variant.size} | {item.variant.color} | x{item.quantity}</p>
                                </div>
                                <div className="font-bold">
                                    {item.price.toLocaleString('vi-VN')}đ
                                </div>
                            </div>
                        ))}

                        {/* Tab tracking */}
                        {activeTab === 'tracking' && (
                            <div className="flex flex-col space-y-6">
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
                        {/* Tab thông tin */}
                        {activeTab === 'info' && (
                            <div className="space-y-4">
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
                                    <span className="font-medium">Ngày đặt hàng:</span> {orderData.order_date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClockCircleOutlined />
                                    <span className="font-medium">Ngày nhận hàng:</span> {orderData.received_date || "Đang cập nhật"}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Sidebar */}
                <div className="bg-black text-white rounded-lg p-6 h-fit">
                    <h2 className="font-bold text-lg mb-4">Tổng đơn</h2>
                    {/* Thành tiền */}
                    <p className="flex justify-between text-xl font-bold mt-4">
                        <span>Thành tiền</span>
                        <span>{orderData.payments[0]?.total?.toLocaleString('vi-VN')}đ</span>
                    </p>
                    <p className="mt-2"><CreditCardOutlined /> Phương thức: {orderData.payments[0]?.method}</p>
                    <p className="mt-1"><ClockCircleOutlined /> Trạng thái: {orderData.payments[0]?.status}</p>



                    <button
                        onClick={() => window.print()}
                        className="w-full bg-white text-black mt-6 py-2 rounded flex items-center justify-center gap-2">
                        <DownloadOutlined /> Tải hóa đơn
                    </button>
                    <InvoicePrint orderData={orderData} />

                    <button className="w-full border border-white mt-3 py-2 rounded flex items-center justify-center gap-2">
                        <MessageOutlined /> Hỗ trợ
                    </button>
                    {/* Huỷ đơn */}
                    {["chờ xác nhận", "đã xác nhận", "đang xử lý"].includes(orderData.status) && (
                        <button
                            className="w-full bg-red-400 hover:bg-red-500 text-white mt-3 py-2 rounded flex items-center justify-center gap-2 shadow-sm transition-colors duration-200"
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
                            <Button key="back" onClick={() => setIsCancelModalVisible(false)}>Hủy</Button>,
                            <Button key="submit" type="primary" danger onClick={handleCancelOrder}>
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

                    {/* Đánh giá */}
                    {orderData.status === "đã giao" && (
                        <Tooltip title="Chỉ khả dụng khi đơn đã giao">
                            <button
                                className="w-full bg-green-400 hover:bg-green-500 text-white mt-3 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors duration-200"
                                onClick={() => console.log("Đánh giá")}
                            >
                                Đánh giá
                            </button>
                        </Tooltip>
                    )}

                </div>
            </div>

            <div className="bg-gradient-to-r mt-3 from-blue-50 to-blue-100 border-l-4 border-blue-400 rounded-lg p-4 flex gap-2">
                <InfoCircleOutlined className="text-blue-600" />
                <p className="text-sm">Vui lòng kiểm tra hàng trước khi thanh toán.</p>
            </div>


        </div>
    );
};

export default OrderDetail;
