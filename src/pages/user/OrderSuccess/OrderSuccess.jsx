import React, { useEffect, useState } from 'react'
import {
    CheckCircleFilled,
    CloseCircleFilled,
    ClockCircleFilled,
    MailOutlined,
    PhoneOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { orderService } from '@/services/order.service'
import { useDispatch } from 'react-redux'
import { getLocalStorage } from '../../../utils/utils'
import { setUser } from '../../../redux/userSlice'
import { setCart } from '../../../redux/cartSlice'
import { paymentService } from '../../../services/payment.service'
import dayjs from 'dayjs'

const OrderSuccess = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [retryLoading, setRetryLoading] = useState(false)


    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchOrderDetail = async () => {
        try {
            const res = await orderService.getDetailOrder(orderId)
            setOrder(res.data.data)
        } catch (error) {
            console.error(error)
            navigate('/')
        } finally {
            setLoading(false)
        }

    }

    const handleRetryPayment = async () => {
        try {
            setRetryLoading(true)
            const data = {
                order_id: order.order_id,
            }

            const res = await paymentService.reTryPayment(data);

            const payUrl = res.data.payUrl

            if (payUrl) {
                // Redirect sang MoMo
                window.location.href = payUrl
            }
        } catch (error) {
            console.error(error)
            alert('Không thể tạo lại link thanh toán. Vui lòng thử lại!')
        } finally {
            setRetryLoading(false)
        }
    }


    useEffect(() => {
        const tempUser = getLocalStorage('tempUser')
        const tempCart = getLocalStorage('tempCart')

        if (tempUser) {
            dispatch(setUser(tempUser))
            localStorage.removeItem('tempUser')
        }
        if (tempCart) {
            dispatch(setCart(tempCart))
            localStorage.removeItem('tempCart')
        }

        fetchOrderDetail()
    }, [orderId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Đang tải đơn hàng...
            </div>
        )
    }

    if (!order) return null

    // =====================
    // PAYMENT LOGIC
    // =====================
    const payment = order.payments?.[0]

    const isCOD = payment?.method === 'COD'
    const isSuccess = payment?.status === 'thành công'
    const isFailed = payment?.status === 'thất bại'
    const isPending = payment?.status === 'chờ thanh toán'

    const getPaymentText = () => {
        if (isCOD) return 'Thanh toán khi nhận hàng'
        if (isSuccess) return 'Thanh toán thành công'
        if (isFailed) return 'Thanh toán thất bại'
        if (isPending) return 'Chưa thanh toán'
        return 'Không xác định'
    }

    const getHeaderConfig = () => {
        if (isSuccess) {
            return {
                bg: 'bg-green-600',
                icon: <CheckCircleFilled className="text-black text-5xl" />,
                title: 'Thanh toán thành công',
                desc: 'Cảm ơn bạn đã mua hàng ❤️',
            }
        }

        if (isFailed) {
            return {
                bg: 'bg-red-600',
                icon: <CloseCircleFilled className="text-red-600 text-5xl" />,
                title: 'Thanh toán thất bại',
                desc: 'Giao dịch không thành công, vui lòng thử lại',
            }
        }

        return {
            bg: 'bg-black',
            icon: <CheckCircleFilled className="text-black text-5xl" />,
            title: 'Đặt hàng thành công',
            desc: 'Sự ủng hộ của bạn là động lực lớn nhất để chúng tôi phục vụ tốt hơn mỗi ngày ❤️',
        }
    }

    const header = getHeaderConfig()

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* HEADER */}
            <div className={`${header.bg} text-white py-14 text-center`}>
                <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
                    {header.icon}
                </div>

                <h1 className="text-4xl font-bold mb-3">{header.title}</h1>
                <p className="text-gray-200">{header.desc}</p>

                <div className="inline-block bg-white/10 rounded-lg px-6 py-4 mt-6">
                    <p className="text-sm text-gray-300">Mã đơn hàng</p>
                    <p className="text-2xl font-mono font-bold">
                        #{order.order_id}
                    </p>
                    <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Thời gian đặt hàng:</span>
                        <span className="font-medium">{dayjs(order.order_date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")}</span>
                    </div>
                </div>



            </div>

            {/* CONTENT */}
            <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
                {/* ORDER SUMMARY */}
                <div className="bg-white border rounded-lg p-6 space-y-4">
                    <div className="space-y-2">
                        <p className="text-gray-600">Sản phẩm</p>

                        {order.items.map(item => (
                            <div
                                key={item.order_detail_id}
                                className="flex justify-between text-sm"
                            >
                                <span>
                                    {item.product.name}
                                    {item.variant &&
                                        ` (${item.variant.color} - ${item.variant.size})`}
                                    {' '}× {item.quantity}
                                </span>
                                <span className="font-medium">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        ))}
                    </div>


                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá voucher</span>
                            <span>-{order.discount_amount.toLocaleString('vi-VN')}đ</span>
                        </div>
                    )}

                    <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-800 font-semibold">Tổng thanh toán</span>
                        <span className="font-bold text-lg">
                            {order.total.toLocaleString('vi-VN')}đ
                        </span>
                    </div>


                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            Phương thức thanh toán
                        </span>
                        <span className="font-medium">
                            {payment?.method}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            Trạng thái thanh toán
                        </span>
                        <span
                            className={`font-semibold ${isSuccess
                                ? 'text-green-600'
                                : isFailed
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}
                        >
                            {getPaymentText()}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            Trạng thái đơn hàng
                        </span>
                        <span className="font-medium capitalize">
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* CUSTOMER INFO */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="font-semibold mb-2">
                        Thông tin người nhận
                    </h2>
                    <p className="text-gray-700">
                        {order.receiver_name}
                    </p>
                    <p className="text-gray-600">{order.phone}</p>
                    <p className="text-gray-600">
                        {order.address_detail}
                    </p>
                </div>
                {/* CUSTOMER NOTE */}
                {order.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h2 className="font-semibold mb-2">
                            📝 Ghi chú của bạn
                        </h2>
                        <p className="text-gray-700 italic">
                            “{order.note}”
                        </p>
                    </div>
                )}


                {/* CTA */}
                <div className="space-y-3">
                    {!isSuccess && !isCOD && (
                        <button
                            onClick={handleRetryPayment}
                            disabled={retryLoading}
                            className={`w-full py-3 rounded-lg font-semibold text-white
            ${retryLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
        `}
                        >
                            {retryLoading ? 'Đang chuyển sang MoMo...' : 'Thanh toán lại'}
                        </button>
                    )}


                    <button
                        onClick={() =>
                            navigate(
                                `/chi-tiet-don-hang/${order.order_id}`
                            )
                        }
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold"
                    >
                        Xem chi tiết đơn hàng
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>

                {/* FOOTER */}
                <div className="text-center text-gray-500 text-sm space-y-1">
                    <p className="flex justify-center gap-2">
                        <MailOutlined />
                        Email xác nhận đã được gửi tới{' '}
                        {order.user.email}
                    </p>
                    <p className="flex justify-center gap-2">
                        <PhoneOutlined />
                        Cần hỗ trợ? Liên hệ 1900-xxxx
                    </p>
                    <p>
                        Đặt hàng bởi {order.user.full_name} ({order.user.email})
                    </p>

                </div>
            </div>
        </div>
    )
}

export default OrderSuccess
