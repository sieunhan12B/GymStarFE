// ======================= IMPORTS =======================
// 1. React & hooks
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

// 2. Ant Design / Icons
import { Checkbox, Button, Tooltip, Modal, Tag, Radio, Input } from 'antd';
import { DeleteOutlined, GiftOutlined, TagOutlined } from '@ant-design/icons';

// 3. custom hook
import useDebounce from "@/hooks/useDebounce";

// 4. Services / API
import { cartService } from '@/services/cart.service';
import { promotionService } from '@/services/promotion.service';

// 5. Redux slices
import { setCart } from '@/redux/cartSlice';

// 6. Utils / constants / paths
import { path } from '@/common/path';
import { formatPrice } from '@/utils/formatPrice';

// 7. Context
import { NotificationContext } from "@/App";
import { generateSlug } from '../../../utils/generateSlug';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);

    // ------------------- Cart state -------------------
    const [cartItems, setCartItems] = useState([]);
    const [selectedCartItems, setSelectedCartItems] = useState([]);

    // ------------------- Voucher state -------------------
    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [voucherList, setVoucherList] = useState([]);

    // useDebounce custom hook
    const debouncedCartItems = useDebounce(cartItems, 400);

    // ---------------- Tính voucher trước footer ----------------
    const totalSelectedAmount = cartItems
        .filter(item => selectedCartItems.includes(item.cart_detail_id))
        .reduce((sum, item) => sum + (item.product_variant?.product?.final_price || 0) * item.quantity, 0);

    const now = new Date();
    const availableVoucherCount = voucherList.filter((v) => {
        const startDate = new Date(v.start_date.split('/').reverse().join('-'));
        const endDate = new Date(v.end_date.split('/').reverse().join('-'));
        const isExpired = now < startDate || now > endDate;
        const minOrderValue = parseFloat(v.min_order_value || 0);
        return !isExpired && totalSelectedAmount >= minOrderValue;
    }).length;
    const rawTotal = cartItems
        .filter(item => selectedCartItems.includes(item.cart_detail_id))
        .reduce(
            (sum, item) =>
                sum +
                (item.product_variant?.product?.final_price || 0) * item.quantity,
            0
        );

    const finalTotal = Math.max(rawTotal - discountAmount, 0);

    const activeItems = cartItems.filter(
        item => item.product_variant?.product?.status === "đang bán"
    );




    // ======================= FETCH FUNCTIONS =======================
    const fetchCart = async () => {
        try {
            const res = await cartService.getCart();
            const validItems = res.data.data.filter(
                item => item.product_variant?.product
            );

            dispatch(setCart(validItems));
            setCartItems(
                validItems.map(i => ({
                    ...i,
                    originalQuantity: i.quantity
                }))
            );
        } catch {
            showNotification("Lỗi tải giỏ hàng", "error");
        }
    };

    const fetchVouchers = async () => {
        try {
            const res = await promotionService.getUserPromotions();
            setVoucherList(res.data.data || []);
        } catch (error) {
            console.error(error);
            showNotification("Lỗi lấy danh sách voucher", "error");
        }
    };


    // ======================= EFFECTS =======================
    useEffect(() => {
        fetchCart();
        fetchVouchers();
    }, []);

    useEffect(() => {
        const updateCartApi = async () => {
            for (let item of debouncedCartItems) {
                if (item.quantity !== item.originalQuantity) {
                    try {
                        await cartService.updateCart({
                            product_variant_id: item.product_variant.product_variant_id,
                            quantity: item.quantity,
                        });

                        // Update lại originalQuantity
                        setCartItems(prev => {
                            const newItems = prev.map(i =>
                                i.cart_detail_id === item.cart_detail_id
                                    ? { ...i, originalQuantity: item.quantity }
                                    : i
                            );

                            dispatch(setCart(newItems)); // 👈 thêm dòng này
                            return newItems;
                        });

                    } catch (error) {
                        showNotification("Không thể cập nhật số lượng", "error");
                        fetchCart();
                    }
                }
            }
        };

        if (debouncedCartItems.some(i => i.quantity !== i.originalQuantity)) {
            updateCartApi();
        }
    }, [debouncedCartItems]);



    // ======================= LOGIC HANDLE =======================

    // ========= Hàm tăng giảm số lượng =========
    const handleQuantityChange = (cart_detail_id, newQuantity) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.cart_detail_id !== cart_detail_id) return item;

                const stock = item.product_variant?.stock ?? 0;

                if (stock === 0) {
                    showNotification("Sản phẩm đã hết hàng", "error");
                    return item;
                }

                if (newQuantity < 1) {
                    showNotification("Số lượng tối thiểu là 1", "warning");
                    return item;
                }

                if (newQuantity > stock) {
                    showNotification(`Chỉ còn ${stock} sản phẩm trong kho`, "warning");
                    return item;
                }

                if (newQuantity > 10) {
                    showNotification("Mỗi sản phẩm chỉ được mua tối đa 10 cái", "warning");
                    return item;
                }

                return { ...item, quantity: newQuantity };
            })
        );
    };

    // Xóa 1 sản phẩm
    const handleDeleteItem = async (cart_detail_id) => {
        try {
            const res = await cartService.deleteCartItem({ cart_detail_id });

            const newCart = cartItems.filter(
                item => item.cart_detail_id !== cart_detail_id
            );

            setCartItems(newCart);
            dispatch(setCart(newCart));

            showNotification(res.data.message, "success");
        } catch (error) {
            showNotification(
                error?.response?.data?.message || "Có lỗi xảy ra",
                "error"
            );
        }
    };

    // Hàm xóa tất cả sản phẩm đã chọn
    const handleDeleteSelectedItems = async () => {
        if (selectedCartItems.length === 0) return;

        try {
            await cartService.deleteCartItems({
                cart_detail_ids: selectedCartItems
            });

            const newCart = cartItems.filter(
                item => !selectedCartItems.includes(item.cart_detail_id)
            );

            setCartItems(newCart);

            dispatch(setCart(newCart));

            setSelectedCartItems([]);
            showNotification("Đã xóa các sản phẩm đã chọn", "success");
        } catch (error) {
            showNotification(
                error?.response?.data?.message || "Có lỗi khi xóa sản phẩm",
                "error"
            );
        }
    };

    // Xóa nhữn sản phẩm không còn bán
    const handleDeleteInactiveItems = async () => {
        const inactiveItems = cartItems.filter(
            item => item.product_variant?.product?.status !== "đang bán"
        );

        if (inactiveItems.length === 0) {
            showNotification("Không có sản phẩm ngưng bán để xóa", "info");
            return;
        }

        const idsToDelete = inactiveItems.map(i => i.cart_detail_id);

        try {
            await cartService.deleteCartItems({
                cart_detail_ids: idsToDelete
            });

            const newCart = activeItems; // tận dụng luôn

            setCartItems(newCart);
            dispatch(setCart(newCart));

            setSelectedCartItems(prev =>
                prev.filter(id => !idsToDelete.includes(id))
            );

            showNotification("Đã xóa các sản phẩm ngưng bán", "success");
        } catch (error) {
            showNotification("Không thể xóa sản phẩm ngưng bán", "error");
        }
    };

    // Chuyển sang CheckoutPage
    const handleCheckout = () => {
        if (selectedCartItems.length === 0) {
            showNotification("Vui lòng chọn sản phẩm để đặt hàng", "error");
            return;
        }

        if (cartItems.length === 0) {
            showNotification(
                "Giỏ hàng đã thay đổi, vui lòng kiểm tra lại",
                "warning"
            );
            return;
        }

        const itemsToCheckout = cartItems.filter(item =>
            selectedCartItems.includes(item.cart_detail_id)
        );
        navigate('/dat-hang', {
            state: {
                selectedCartItems: itemsToCheckout,
                selectedVoucher,
            }
        });
    };


    // ======================= RENDER SECTIONS =======================
    const renderEmptyCart = () => {
        return (
            <>
                <div className="bg-white rounded-lg p-10 shadow-sm flex flex-col items-center justify-center text-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty cart" className="w-40 mb-6 opacity-80" />
                    <h2 className="text-xl font-bold mb-2">Giỏ hàng của bạn trống</h2>
                    <p className="text-gray-500 mb-6">Hãy mua thêm sản phẩm để tiếp tục nhé</p>
                    <button
                        onClick={() => navigate(path.home)}
                        className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                        Mua sắm ngay
                    </button>
                </div>
            </>
        )
    }

    const renderProductSection = () => {


        return (
            <>
                {/* Chọn tất cả / Xóa tất cả */}
                <div className="flex justify-between items-center mb-4">
                    <Checkbox
                        checked={
                            activeItems.length > 0 &&
                            selectedCartItems.length === activeItems.length
                        }
                        indeterminate={
                            selectedCartItems.length > 0 &&
                            selectedCartItems.length < activeItems.length
                        }
                        onChange={e => {
                            if (e.target.checked) {
                                setSelectedCartItems(activeItems.map(item => item.cart_detail_id));
                            } else {
                                setSelectedCartItems([]);
                            }
                        }}
                    >
                        Chọn tất cả
                    </Checkbox>

                    <button
                        className="text-red-600 text-sm font-medium hover:underline"
                        onClick={handleDeleteSelectedItems}
                        disabled={selectedCartItems.length === 0}
                    >
                        Xóa tất cả
                    </button>
                </div>
                <div className="space-y-6 mb-6">
                    {cartItems.map((item) => {
                        const isInactive = item.product_variant?.product?.status !== "đang bán";

                        const productNameSlug = generateSlug(item.product_variant.product.name).split("-").slice(0, 2).join("-");
                        const productLink = `/san-pham/${productNameSlug}/${item.product_variant.product.product_id}`;

                        return (
                            <div
                                key={item.cart_detail_id}
                                className="grid grid-cols-12 gap-4 items-center border-b pb-4"
                            >


                                {/* 1. Thông tin sản phẩm: ảnh + tên */}
                                <div className="col-span-3 flex  items-center gap-4">
                                    <Checkbox
                                        disabled={isInactive}
                                        checked={selectedCartItems.includes(item.cart_detail_id)}
                                        onChange={(e) => {

                                            if (e.target.checked) {
                                                setSelectedCartItems(prev => [...prev, item.cart_detail_id]);
                                            } else {
                                                setSelectedCartItems(prev => prev.filter(id => id !== item.cart_detail_id));
                                            }
                                        }}
                                    />
                                    <img
                                        src={item.product_variant?.product?.thumbnail || "https://via.placeholder.com/100"}
                                        alt={item.product_variant?.product?.name || "Sản phẩm"}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex flex-col max-w-[130px]">
                                        <Tooltip title={item.product_variant?.product?.name}>
                                            <Link to={productLink}>
                                                <h3 className="font-semibold truncate">
                                                    {item.product_variant?.product?.name}
                                                </h3>
                                            </Link>


                                            {isInactive && (
                                                <span className="mt-1 inline-block text-[11px] font-semibold text-red-600 border border-red-300 bg-white px-2 py-[2px] rounded">
                                                    Sản phẩm ngưng bán
                                                </span>
                                            )}

                                        </Tooltip>
                                    </div>

                                </div>

                                <div className="col-span-2 flex flex-col text-sm text-gray-500">
                                    <span>Phân loại hàng: </span>
                                    {item.product_variant?.color || "-"} / {item.product_variant?.size || "-"}
                                </div>



                                {/* 2. Giá 1 sản phẩm (gốc + sau giảm) */}
                                <div className="col-span-2 flex flex-col items-center">
                                    <span className={item.product_variant?.product?.discount > 0 ? "line-through text-sm text-gray-400" : "text-sm"}>
                                        {formatPrice(item.product_variant?.price)}
                                    </span>
                                    {item.product_variant?.product?.discount > 0 && (
                                        <span className="font-bold">{formatPrice(item.product_variant?.product?.final_price)}</span>
                                    )}
                                </div>

                                {/* 3. Nút tăng/giảm (giữ kiểu cũ) */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="flex items-center gap-2 border rounded-lg">
                                        <button
                                            disabled={isInactive}
                                            className={`px-3 py-1 ${isInactive ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                                            onClick={() => handleQuantityChange(item.cart_detail_id, item.quantity - 1)}
                                        >
                                            -
                                        </button>

                                        <span className="px-4">{item.quantity}</span>
                                        <button
                                            disabled={isInactive}
                                            className={`px-3 py-1 ${isInactive ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                                            onClick={() => handleQuantityChange(item.cart_detail_id, item.quantity + 1)}
                                        >
                                            +
                                        </button>

                                    </div>
                                </div>

                                {/* 4. Thành tiền (gốc + sau giảm) */}
                                <div className="col-span-2 flex flex-col items-center">
                                    <span className="line-through text-sm text-gray-400">{formatPrice(item.product_variant?.price * item.quantity)}</span>
                                    <span className="font-bold">
                                        {formatPrice((item.product_variant?.product?.final_price || item.product_variant?.product?.price) * item.quantity)}

                                    </span>
                                </div>

                                {/* 5. Nút xóa */}
                                <div className="col-span-1 flex justify-center">
                                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteItem(item.cart_detail_id)}>
                                        <DeleteOutlined />  Xóa
                                    </button>
                                </div>
                            </div>
                        );

                    })}
                </div>
            </>
        )
    }

    const renderVoucherSection = () => {
        return (
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <GiftOutlined className="text-orange-500 text-xl" />
                        <span className="text-lg font-bold">Chọn mã giảm giá</span>
                    </div>
                }
                open={isVoucherModalOpen}
                onCancel={() => setIsVoucherModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                {voucherList.length === 0 ? (
                    <div className="text-center py-16">
                        <GiftOutlined className="text-gray-300 text-6xl mb-4" />
                        <p className="text-gray-500 text-lg">Bạn hiện không có voucher nào</p>
                        <p className="text-gray-400 text-sm mt-2">Các voucher sẽ xuất hiện tại đây khi có sẵn</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Input nhập mã voucher */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={voucherCodeInput}
                                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                                    placeholder="Nhập mã voucher"
                                    className="flex-1 h-11"
                                    prefix={<TagOutlined className="text-gray-400" />}
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    className="bg-orange-500 hover:bg-orange-600 border-none px-8"
                                    onClick={() => {
                                        const foundVoucher = voucherList.find(
                                            v => v.code.toLowerCase() === voucherCodeInput.trim().toLowerCase()
                                        );

                                        if (!foundVoucher) {
                                            showNotification("Mã voucher không hợp lệ", "error");
                                            return;
                                        }

                                        const minOrderValue = parseFloat(foundVoucher.min_order_value || 0);
                                        if (totalSelectedAmount < minOrderValue) {
                                            showNotification("Đơn hàng chưa đủ điều kiện áp dụng voucher", "warning");
                                            return;
                                        }
                                        if (foundVoucher.remaining_usage !== null && foundVoucher.remaining_usage <= 0) {
                                            showNotification("Voucher đã hết lượt sử dụng", "error");
                                            return;
                                        }


                                        setSelectedVoucher(foundVoucher);

                                        let discount = 0;
                                        if (foundVoucher.discount_type === 'fixed') {
                                            discount = parseFloat(foundVoucher.value);
                                        } else {
                                            discount = Math.min(
                                                totalSelectedAmount * parseFloat(foundVoucher.value) / 100,
                                                foundVoucher.max_discount
                                                    ? parseFloat(foundVoucher.max_discount)
                                                    : Infinity
                                            );
                                        }

                                        setDiscountAmount(discount);
                                        setIsVoucherModalOpen(false);
                                        showNotification("Áp dụng voucher thành công", "success");
                                    }}
                                >
                                    Áp dụng
                                </Button>
                            </div>
                        </div>

                        {/* Danh sách voucher */}
                        <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3">
                            {voucherList.map((voucher) => {
                                const minOrderValue = parseFloat(voucher.min_order_value || 0);
                                const startDate = new Date(voucher.start_date.split('/').reverse().join('-'));
                                const endDate = new Date(voucher.end_date.split('/').reverse().join('-'));
                                const now = new Date();

                                const isExpired = now < startDate || now > endDate;
                                const isNotEnoughOrder = totalSelectedAmount < minOrderValue;
                                const isOutOfUsage = voucher.remaining_usage !== null && voucher.remaining_usage <= 0;
                                const isDisabled = isNotEnoughOrder || isExpired || isOutOfUsage;

                                const isChecked = selectedVoucher?.promotion_id === voucher.promotion_id;

                                return (
                                    <div
                                        key={voucher.promotion_id}
                                        className={`
                                        relative border-2 rounded-xl overflow-hidden transition-all
                                        ${isDisabled
                                                ? 'opacity-50 bg-gray-50 border-gray-200'
                                                : isChecked
                                                    ? 'border-orange-500 bg-orange-50 shadow-md'
                                                    : 'border-gray-200 hover:border-orange-300 hover:shadow-sm cursor-pointer bg-white'
                                            }
                                    `}
                                        onClick={() => {
                                            if (isDisabled) return;

                                            if (isChecked) {
                                                setSelectedVoucher(null);
                                                setDiscountAmount(0);
                                                return;
                                            }

                                            setSelectedVoucher(voucher);

                                            let discount = 0;
                                            if (voucher.discount_type === 'fixed') {
                                                discount = parseFloat(voucher.value);
                                            } else {
                                                discount = Math.min(
                                                    totalSelectedAmount * parseFloat(voucher.value) / 100,
                                                    voucher.max_discount
                                                        ? parseFloat(voucher.max_discount)
                                                        : Infinity
                                                );
                                            }
                                            setDiscountAmount(discount);
                                        }}
                                    >
                                        {/* Badge góc trên phải */}
                                        {isChecked && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                                    ✓ Đang chọn
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center p-4">
                                            {/* Icon bên trái */}
                                            <div className={`
                                            flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center mr-4
                                            ${isDisabled ? 'bg-gray-200' : 'bg-gradient-to-br from-orange-400 to-red-500'}
                                        `}>
                                                <GiftOutlined className="text-white text-2xl" />
                                            </div>

                                            {/* Nội dung chính */}
                                            <div className="flex-1 min-w-0">
                                                {/* Mã code */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1 rounded-md text-sm">
                                                        {voucher.code}
                                                    </span>
                                                    {voucher.remaining_usage && (
                                                        <span className="text-xs text-gray-500">
                                                            Còn {voucher.remaining_usage} lượt
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Mô tả */}
                                                <div className="font-semibold text-gray-800 mb-2">
                                                    {voucher.description}
                                                </div>

                                                {/* Chi tiết giảm giá */}
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">Giảm:</span>
                                                        <span className="text-orange-600 font-bold">
                                                            {voucher.discount_type === 'percent'
                                                                ? `${voucher.value}%`
                                                                : `${parseFloat(voucher.value).toLocaleString()}đ`}
                                                        </span>
                                                    </span>

                                                    {voucher.max_discount && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium">Tối đa:</span>
                                                            <span className="text-orange-600 font-bold">
                                                                {parseFloat(voucher.max_discount).toLocaleString()}đ
                                                            </span>
                                                        </span>
                                                    )}

                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">Đơn tối thiểu:</span>
                                                        <span className="text-blue-600 font-bold">
                                                            {parseFloat(voucher.min_order_value).toLocaleString()}đ
                                                        </span>
                                                    </span>
                                                </div>

                                                {/* Thời gian áp dụng */}
                                                <div className="text-xs text-gray-500">
                                                    📅 HSD: {voucher.start_date} - {voucher.end_date}
                                                </div>

                                                {/* Tags trạng thái */}
                                                {isDisabled && (
                                                    <div className="mt-2">
                                                        {isExpired ? (
                                                            <Tag color="red">⏰ Đã hết hạn</Tag>
                                                        ) : isOutOfUsage ? (
                                                            <Tag color="volcano">🚫 Đã hết lượt sử dụng</Tag>
                                                        ) : isNotEnoughOrder ? (
                                                            <Tag color="orange">
                                                                ⚠️ Đơn hàng chưa đủ {parseFloat(voucher.min_order_value).toLocaleString()}đ
                                                            </Tag>
                                                        ) : null}
                                                    </div>
                                                )}

                                            </div>

                                            {/* Radio button bên phải */}
                                            <div className="flex-shrink-0 ml-4">
                                                <Radio
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                danger
                                size="large"
                                disabled={!selectedVoucher}
                                onClick={() => {
                                    setSelectedVoucher(null);
                                    setDiscountAmount(0);
                                    showNotification("Đã hủy chọn voucher", "info");
                                }}
                                className="flex-1"
                            >
                                Bỏ chọn
                            </Button>

                            <Button
                                type="primary"
                                size="large"
                                onClick={() => setIsVoucherModalOpen(false)}
                                className="flex-1 bg-black hover:bg-gray-800"
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        );
    };

    const renderPaymentFooterSection = () => {
        return (
            <>
                <div
                    style={{ boxShadow: "0 -4px 6px -4px rgba(0,0,0,0.1)" }}
                    className="sticky bottom-0 w-full bg-white border-t"
                >
                    <div className="max-w-7xl mx-auto py-3">

                        {/* ===== Voucher block (compact) ===== */}
                        <div
                            onClick={() =>
                                selectedCartItems.length > 0 && setIsVoucherModalOpen(true)
                            }
                            className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all mb-3
                ${selectedCartItems.length === 0
                                    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                                    : selectedVoucher
                                        ? "border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 hover:shadow-sm cursor-pointer"
                                        : "border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                }
            `}
                        >
                            {/* Icon */}
                            <div
                                className={`
                    flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                    ${selectedVoucher
                                        ? "bg-gradient-to-br from-orange-400 to-red-500"
                                        : "bg-gradient-to-br from-blue-400 to-indigo-500"
                                    }
                `}
                            >
                                <GiftOutlined className="text-white text-lg" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {selectedVoucher ? (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-gray-800 truncate">
                                            {selectedVoucher.code}
                                        </span>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="font-bold text-orange-600 text-sm">
                                            -{discountAmount.toLocaleString()}đ
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-700">
                                            Chọn mã giảm giá
                                        </span>
                                        {availableVoucherCount > 0 && (
                                            <span className="text-xs text-blue-600 font-medium">
                                                ({availableVoucherCount} khả dụng)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Close / Arrow */}
                            {selectedVoucher ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVoucher(null);
                                        setDiscountAmount(0);
                                        showNotification("Đã hủy voucher", "info");
                                    }}
                                    className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                selectedCartItems.length > 0 && (
                                    <svg
                                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                )
                            )}
                        </div>
                        {/* ===== Tổng tiền + thao tác ===== */}
                        <div className="flex items-center justify-between py-4 gap-4">

                            {/* Bên trái: chọn tất cả + bỏ chọn */}
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    checked={
                                        activeItems.length > 0 &&
                                        selectedCartItems.length === activeItems.length
                                    }
                                    indeterminate={
                                        selectedCartItems.length > 0 &&
                                        selectedCartItems.length < activeItems.length
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCartItems(
                                                activeItems.map(item => item.cart_detail_id)
                                            );
                                        } else {
                                            setSelectedCartItems([]);
                                        }
                                    }}
                                >
                                    Chọn tất cả
                                </Checkbox>

                                <button
                                    className={`
            text-sm font-medium transition
            ${selectedCartItems.length === 0
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-red-600 hover:underline"
                                        }
        `}
                                    disabled={selectedCartItems.length === 0}
                                    onClick={handleDeleteSelectedItems}
                                >
                                    Xóa
                                </button>

                                {/* ✅ NÚT XÓA SẢN PHẨM NGƯNG BÁN (không cần inactiveItems) */}
                                {cartItems.length !== activeItems.length && (
                                    <button
                                        className="text-sm font-medium text-orange-600 hover:underline"
                                        onClick={handleDeleteInactiveItems}
                                    >
                                        Xóa SP ngưng bán ({cartItems.length - activeItems.length})
                                    </button>
                                )}
                            </div>



                            {/* Bên phải: số SP + thành tiền + mua hàng */}
                            <div className="flex items-center gap-6">

                                {/* Số sản phẩm */}
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    Tổng cộng:  ({selectedCartItems.length} sản phẩm)
                                </span>

                                {/* Thành tiền */}
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="text-sm text-gray-500">Thành tiền:</span>
                                    <span className="text-xl font-bold text-red-600">
                                        {finalTotal.toLocaleString()}đ
                                    </span>
                                </div>

                                {/* Nút mua hàng */}
                                <button
                                    className="
                bg-black text-white py-3 px-6 rounded-lg font-bold text-lg
                hover:bg-gray-800 flex items-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed
            "
                                    onClick={handleCheckout}
                                >
                                    Mua hàng
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        )

    }


    // ======================= MAIN RENDER =======================
    return (
        <div className="min-h-screen max-w-7xl mx-auto bg-gray-50 p-6">
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng</h2>
            {cartItems.length === 0 ? (
                // Cart không có sản phẩm 
                renderEmptyCart()
            ) : (
                <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm">

                    {/* ===== Danh sách sản phẩm ===== */}
                    {renderProductSection()}

                    {/* ===== Footer tổng tiền + voucher ===== */}
                    {renderVoucherSection()}
                    {renderPaymentFooterSection()}
                </div>
            )}
        </div>
    );
};

export default Cart;
