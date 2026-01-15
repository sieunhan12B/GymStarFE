// ======================= IMPORTS =======================

// ======================= REACT & HOOKS =======================
import React, { useEffect, useState, useContext } from 'react';

// ======================= ROUTER =======================
import { useLocation, useNavigate } from 'react-router-dom';

// ======================= UI LIBRARIES =======================
import { Button, Modal, Radio, Input, Tooltip, Form, Tag } from 'antd';
import {
    InfoCircleOutlined,
    StarOutlined,
    StarFilled,
    EditOutlined,
    LoadingOutlined,
    CarOutlined,
    EnvironmentOutlined,
    PlusOutlined,
    GiftOutlined,
    TagOutlined,
    DeleteOutlined
} from '@ant-design/icons';

// ======================= ASSETS =======================
import momo from '@/assets/images/momo.png';

// ======================= CONTEXT =======================
import { NotificationContext } from "@/App";

// ======================= REDUX =======================
import { useDispatch } from 'react-redux';
import { setCart } from '@/redux/cartSlice';

// ======================= SERVICES =======================
import { addressService } from '@/services/address.service';
import { orderService } from '@/services/order.service';
import { cartService } from '@/services/cart.service';
import { promotionService } from '@/services/promotion.service';

// ======================= UTILS =======================
import { formatPrice } from '@/utils/formatPrice';
import { setLocalStorage } from '@/utils/storage';

// ======================= COMPONENTS =======================
import AddEditAddressModal from '@/components/AddEditAddressModal/AddEditAddressModal';


const Checkout = () => {

    // ======================= ROUTER & CONTEXT =======================
    const location = useLocation();
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);

    // ======================= REDUX =======================
    const dispatch = useDispatch();

    // ======================= STATE: ADDRESS =======================
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [openAddressModal, setOpenAddressModal] = useState(false);

    // ======================= STATE: PAYMENT =======================
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [orderNote, setOrderNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ======================= STATE: VOUCHER =======================
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [openVoucherModal, setOpenVoucherModal] = useState(false);
    const [voucherCode, setVoucherCode] = useState("");

    // ======================= STATE: ADDRESS MODAL =======================
    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState("add");
    const [editingAddress, setEditingAddress] = useState(null);


    // ======================= DATA FROM ROUTER =======================
    const selectedCartItems = location.state?.selectedCartItems || [];
    const selectedVoucherFromCart = location.state?.selectedVoucher || null;
    const buyNowItem = location.state?.buyNowItem;

    // ======================= FETCH FUNCTIONS =======================
    // Lấy địa chỉ
    const fetchAddresses = async () => {
        try {
            const res = await addressService.getAddressById();
            const apiAddresses = res.data.data.addresses;
            setAddresses(apiAddresses);
            const defaultAddress = apiAddresses.find(addr => addr.is_default);
            if (defaultAddress) setSelectedAddressId(defaultAddress.address_id);
        } catch (error) {
            console.error("Không thể lấy địa chỉ", error);
        }
    };

    // Lấy danh sách voucher
    const fetchVouchers = async () => {
        try {
            // Thay đổi endpoint này theo API của bạn
            const res = await promotionService.getUserPromotions(); // hoặc service tương ứng
            setVouchers(res.data.data || []);
        } catch (error) {
            console.error("Không thể lấy danh sách voucher", error);
        }
    };

    const fetchCart = async () => {
        try {
            const res = await cartService.getCart();
            dispatch(setCart(res.data.data));
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        }
    };


    // ======================= EFFECTS =======================
    useEffect(() => {
        fetchVouchers();
        fetchAddresses();
    }, []);

    useEffect(() => {
        if (selectedVoucherFromCart) {
            setSelectedVoucher(selectedVoucherFromCart);
            setVoucherCode(selectedVoucherFromCart.code);
        }
    }, [selectedVoucherFromCart]);

    useEffect(() => {
        if (selectedVoucher) {
            const validation = isVoucherValid(selectedVoucher);
            if (!validation.valid) {
                setSelectedVoucher(null);
                setVoucherCode("");
                showNotification(validation.message, "error");
            }
        }
    }, [selectedVoucher]);


    // ======================= HELPERS =======================
    const parseAddressDetail = (address = "") => {
        const parts = address.split(",").map(p => p.trim());
        return {
            houseNumber: parts[0] || "",
            ward: parts[1] || "",
            city: parts[2] || "",
        };
    };

    // Tính tổng sau giảm giá sản phẩm
    const calculateTotalAfterProductDiscount = () => {
        if (selectedCartItems.length !== 0) {
            return selectedCartItems.reduce((sum, item) => sum + item.quantity * item.product_variant.product.final_price, 0);
        }
        if (buyNowItem) {
            return buyNowItem.product_variant.final_price * buyNowItem.quantity;
        }
        return 0;
    };


    // ======================= VOUCHER LOGIC =======================
    // Kiểm tra voucher có hợp lệ không
    const isVoucherValid = (voucher) => {
        const total = calculateTotalAfterProductDiscount();
        const minOrderValue = parseFloat(voucher.min_order_value);

        if (total < minOrderValue) {
            return { valid: false, message: `Đơn hàng tối thiểu ${formatPrice(minOrderValue)}` };
        }

        if (voucher.remaining_usage <= 0) {
            return { valid: false, message: 'Voucher đã hết lượt sử dụng' };
        }

        const now = new Date();
        const endDate = new Date(voucher.end_date.split('/').reverse().join('-'));

        if (now > endDate) {
            return { valid: false, message: 'Voucher đã hết hạn' };
        }

        return { valid: true, message: '' };
    };

    // Áp dụng voucher
    const handleApplyVoucher = (voucher) => {
        const validation = isVoucherValid(voucher);

        if (!validation.valid) {
            showNotification(validation.message, "error");
            return;
        }

        setSelectedVoucher(voucher);
        setVoucherCode(voucher.code);
        setOpenVoucherModal(false);
        showNotification("Áp dụng voucher thành công", "success");
    };

    // Xóa voucher
    const handleRemoveVoucher = () => {
        setSelectedVoucher(null);
        setVoucherCode("");
        showNotification("Đã hủy voucher", "info");
    };


    // ======================= ADDRESS HANDLERS =======================
    const handleSubmitAddress = async (values) => {
        const address_detail = [values.houseNumber, values.ward, values.city]
            .filter(Boolean)
            .join(", ");

        const payload = {
            receiver_name: values.receiver_name,
            phone: values.phone,
            address_detail,
        };

        try {
            if (addressModalMode === "add") {
                await addressService.addAddress(payload);
                showNotification("Thêm địa chỉ thành công", "success");
            } else {
                await addressService.updateAddress(editingAddress.address_id, payload);
                showNotification("Cập nhật địa chỉ thành công", "success");
            }

            // Đóng modal
            setOpenAddEditModal(false);
            setEditingAddress(null);

            // Reload danh sách
            fetchAddresses();
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
            throw error; // để modal không tự reset
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await addressService.deleteAddress(addressId);
            showNotification("Xóa địa chỉ thành công", "success");
            fetchAddresses(); // hoặc reload list địa chỉ
        } catch (error) {
            showNotification(error?.response?.data?.message || "Xóa địa chỉ thất bại", "error");
        }
    };

    // ================= HANDLE DEFAULT =================
    const handleChooseDefaultAddress = async (addressId) => {
        try {
            await addressService.chooseDefaultAddress(addressId);
            showNotification("Đã đặt làm địa chỉ mặc định", "success");
            fetchAddresses();
        } catch {
            showNotification("Không thể đặt địa chỉ mặc định", "error");
        }
    };


    // ======================= CHECKOUT =======================
    const handleCheckout = async () => {
        if (!selectedAddressId) {
            showNotification("Vui lòng chọn địa chỉ", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            let res;
            if (selectedCartItems.length > 0) {
                const payload = {
                    cart_detail_ids: selectedCartItems.map(item => item.cart_detail_id),
                    note: orderNote,
                    address_id: selectedAddressId,
                    method: paymentMethod.toUpperCase(),
                    promotion_code: voucherCode || undefined,
                };
                res = await orderService.createOrder(payload);
                fetchCart();
            } else if (buyNowItem) {
                const payload = {
                    product_variant_id: buyNowItem.product_variant.product_variant_id,
                    quantity: buyNowItem.quantity,
                    note: orderNote,
                    address_id: selectedAddressId,
                    method: paymentMethod.toUpperCase(),
                    promotion_code: voucherCode || undefined,
                };
                res = await orderService.orderNow(payload);
            }

            const orderId = res.data.order_id;
            const payUrl = res.data.payUrl;

            // Trường hợp thanh toán MoMo
            if (paymentMethod === "MOMO") {
                if (payUrl) {
                    // Lưu tạm giỏ hàng nếu cần quay lại
                    if (selectedCartItems.length > 0) {
                        setLocalStorage("tempCart", selectedCartItems);
                    }

                    showNotification("Đặt hàng thành công! Đang chuyển sang MoMo để thanh toán...", "success");

                    // Chuyển hướng sau 3-4 giây để người dùng thấy thông báo
                    setTimeout(() => {
                        window.location.href = payUrl;
                    }, 1500);
                } else {
                    // Backend không trả payUrl → coi như thất bại
                    showNotification("Không thể tạo link thanh toán MoMo. Vui lòng thử lại hoặc chọn COD.", "error");
                    // Có thể navigate về giỏ hàng hoặc để người dùng thử lại
                }
            }
            // Trường hợp COD hoặc các phương thức khác (không cần payUrl)
            else {
                showNotification(res.data.message || "Đặt hàng thành công!", "success");
                navigate(`/ket-qua-thanh-toan/${orderId}`);
            }
        } catch (error) {
            console.error(error);
            const message = error?.response?.data?.message || "Có lỗi xảy ra khi đặt hàng";
            showNotification(message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    // ======================= RENDER SECTIONS =======================
    const renderAddressSection = () => {
        const selectedAddress = addresses.find(
            a => a.address_id === selectedAddressId
        );
        const disableAddAddress = addresses.length >= 3;


        return (
            <>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Địa chỉ nhận hàng</h2>

                    {selectedAddress ? (
                        <div className="border rounded-lg p-4 mb-3">
                            <div className="font-medium text-sm">
                                {selectedAddress.receiver_name} | {selectedAddress.phone}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {selectedAddress.address_detail}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-3">Chưa có địa chỉ</p>
                    )}

                    <Button
                        type="link"
                        className="text-blue-600 text-sm p-0 font-medium block"
                        onClick={() => setOpenAddressModal(true)}
                    >
                        <EnvironmentOutlined /> Thay đổi / Chọn địa chỉ
                    </Button>

                    {/* Modal chọn địa chỉ */}
                    <Modal
                        title="Chọn địa chỉ nhận hàng"
                        open={openAddressModal}
                        onCancel={() => setOpenAddressModal(false)}
                        footer={null}
                    >
                        <div className="space-y-3 max-h-[60vh] overflow-auto">
                            {addresses.map(addr => {
                                const isSelected = selectedAddressId === addr.address_id;

                                return (
                                    <div
                                        key={addr.address_id}
                                        className={`border rounded-lg p-4 cursor-pointer flex justify-between items-start hover:border-blue-500 transition ${isSelected ? "border-blue-500 bg-blue-50" : ""
                                            }`}
                                    >
                                        <div
                                            onClick={() => {
                                                setSelectedAddressId(addr.address_id);
                                                setOpenAddressModal(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {addr.receiver_name} | {addr.phone}
                                                </span>

                                                {!addr.is_default ? (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChooseDefaultAddress(addr.address_id);
                                                        }}
                                                        className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full cursor-pointer hover:bg-gray-300"
                                                    >
                                                        <StarOutlined /> Đặt mặc định
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                                                        <StarFilled /> Mặc định
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 mt-1">
                                                {addr.address_detail}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Tooltip title="Cập nhật">
                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        const parsed = parseAddressDetail(addr.address_detail);

                                                        setAddressModalMode("edit");
                                                        setEditingAddress({
                                                            ...addr,
                                                            city: parsed.city,
                                                            ward: parsed.ward,
                                                            houseNumber: parsed.houseNumber,
                                                        });

                                                        setOpenAddEditModal(true);
                                                    }}
                                                />
                                            </Tooltip>

                                            <Tooltip title="Xóa địa chỉ">
                                                <Button
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAddress(addr.address_id);
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Thêm địa chỉ mới */}
                        <Tooltip title={disableAddAddress ? "Bạn đã có tối đa 3 địa chỉ" : ""}>
                            <Button
                                type="link"
                                className="mt-3"
                                disabled={disableAddAddress}
                                onClick={() => {
                                    setAddressModalMode("add");
                                    setEditingAddress(null);
                                    setOpenAddEditModal(true);
                                }}
                            >
                                <PlusOutlined /> Thêm địa chỉ mới
                            </Button>
                        </Tooltip>
                    </Modal>

                    <AddEditAddressModal
                        open={openAddEditModal}
                        onCancel={() => {
                            setOpenAddEditModal(false);
                            setEditingAddress(null);
                        }}
                        mode={addressModalMode}
                        addressData={editingAddress}
                        onSubmit={handleSubmitAddress}
                    />
                </div>
            </>
        );
    };

    const renderProductSection = () => {
        return (
            <>
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>

                    {/* Header table */}
                    <div className="grid grid-cols-12 gap-4 border-b pb-2 font-medium text-gray-500">
                        <div className="col-span-5">Sản phẩm</div>
                        <div className="col-span-2 text-center">Đơn giá</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-3 text-center">Thành tiền</div>
                    </div>

                    {selectedCartItems && (

                        selectedCartItems.map(item => (
                            <div key={item.cart_detail_id} className="grid grid-cols-12 gap-4 items-center border-b py-2">
                                {/* Sản phẩm */}
                                <div className="col-span-5 flex items-center gap-3">
                                    <img src={item.product_variant?.product?.thumbnail} alt={item.product_variant?.product?.name} className="w-16 h-16 rounded" />
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-medium line-clamp-2">{item.product_variant?.product?.name}</p>
                                        <p className="text-xs text-gray-500">{item.product_variant?.color} / {item.product_variant?.size}</p>
                                    </div>
                                </div>

                                {/* Đơn giá */}
                                <div className="col-span-2 text-center text-sm">
                                    {formatPrice(item.product_variant.product.final_price)}

                                </div>

                                {/* Số lượng */}
                                <div className="col-span-2 text-center text-sm">{item.quantity}</div>

                                {/* Thành tiền */}
                                <div className="col-span-3 text-center font-medium text-red-600">
                                    {formatPrice(item.quantity * item.product_variant.product.final_price)}

                                </div>
                            </div>
                        ))

                    )}

                    {buyNowItem && (
                        <div key={buyNowItem.product_variant.product_variant_id} className="grid grid-cols-12 gap-4 items-center border-b py-2">
                            {/* Sản phẩm */}
                            <div className="col-span-5 flex items-center gap-3">
                                <img src={buyNowItem.product?.thumbnail} alt={buyNowItem.product?.name} className="w-16 h-16 rounded" />
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-medium line-clamp-2">{buyNowItem.product?.name}</p>
                                    <p className="text-xs text-gray-500">{buyNowItem.product_variant?.color} / {buyNowItem.product_variant?.size}</p>
                                </div>
                            </div>

                            {/* Đơn giá */}
                            <div className="col-span-2 text-center text-sm">
                                {formatPrice(buyNowItem?.product_variant.final_price)}

                            </div>

                            {/* Số lượng */}
                            <div className="col-span-2 text-center text-sm">{buyNowItem.quantity}</div>

                            {/* Thành tiền */}
                            <div className="col-span-3 text-center font-medium text-red-600">
                                {formatPrice(buyNowItem?.product_variant.final_price * buyNowItem.quantity)}
                            </div>
                        </div>


                    )}



                    {/* Tổng cộng */}
                    <div className="flex justify-end items-center mt-4 gap-4 pt-2 border-t font-bold text-lg">


                        <span className="text-gray-600 font-normal text-xs">Tổng ({selectedCartItems.length != 0 ? selectedCartItems.length : buyNowItem ? buyNowItem.quantity : 0} sản phẩm):</span>

                        {selectedCartItems.length != 0 && (
                            <span className='text-red-600'>
                                {selectedCartItems
                                    .reduce((sum, item) => sum + item.quantity * item.product_variant.product.final_price, 0)
                                    .toLocaleString()}₫
                            </span>

                        )}
                        {buyNowItem && (
                            <span className='text-red-600'>
                                {formatPrice(buyNowItem?.product_variant.final_price * buyNowItem.quantity)}
                            </span>

                        )}

                    </div>
                </div>
            </>
        )
    }

    const renderVoucherSection = () => {
        return (


            < div className="bg-white rounded-lg p-6 shadow-sm" >
                <h2 className="text-xl flex items-center gap-2 font-bold mb-4">
                    <GiftOutlined className="text-orange-500" /> Mã giảm giá
                </h2>

                {
                    selectedVoucher ? (
                        <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag color="orange" className="text-sm font-bold">{selectedVoucher.code}</Tag>
                                        <span className="text-sm font-medium">{selectedVoucher.description}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Giảm {selectedVoucher.discount_type === 'percent'
                                            ? `${selectedVoucher.value}% (tối đa ${formatPrice(selectedVoucher.max_discount)})`
                                            : formatPrice(selectedVoucher.value)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Đơn tối thiểu: {formatPrice(selectedVoucher.min_order_value)}
                                    </div>
                                </div>
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    onClick={handleRemoveVoucher}
                                >
                                    Bỏ chọn
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="dashed"
                            className="w-full h-12 text-blue-600 border-blue-300 hover:border-blue-500"
                            onClick={() => setOpenVoucherModal(true)}
                        >
                            <TagOutlined /> Chọn mã giảm giá
                        </Button>
                    )
                }

                {/* Modal chọn voucher */}
                <Modal
                    title="Chọn mã giảm giá"
                    open={openVoucherModal}
                    onCancel={() => setOpenVoucherModal(false)}
                    footer={null}
                    width={600}
                >
                    <div className="space-y-3 max-h-[60vh] overflow-auto">
                        {vouchers.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Không có mã giảm giá khả dụng</p>
                        ) : (
                            vouchers.map(voucher => {
                                const validation = isVoucherValid(voucher);
                                const isSelected = selectedVoucher?.promotion_id === voucher.promotion_id;

                                return (
                                    <div
                                        key={voucher.promotion_id}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${!validation.valid
                                            ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-400'
                                            }`}
                                        onClick={() => validation.valid && handleApplyVoucher(voucher)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Tag color="orange" className="text-sm font-bold">{voucher.code}</Tag>
                                                {isSelected && <Tag color="green">Đang chọn</Tag>}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Còn {voucher.remaining_usage} lượt
                                            </div>
                                        </div>

                                        <div className="text-sm font-medium mb-2">{voucher.description}</div>

                                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                            <span>
                                                Giảm: {voucher.discount_type === 'percent'
                                                    ? `${voucher.value}%`
                                                    : formatPrice(voucher.value)}
                                            </span>
                                            {voucher.max_discount && (
                                                <span>Tối đa: {formatPrice(voucher.max_discount)}</span>
                                            )}
                                            <span>Đơn tối thiểu: {formatPrice(voucher.min_order_value)}</span>
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            HSD: {voucher.start_date} - {voucher.end_date}
                                        </div>

                                        {!validation.valid && (
                                            <div className="mt-2 text-xs text-red-500 font-medium">
                                                {validation.message}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Modal>
            </div >
        );
    }

    const renderNoteSection = () => {
        return (
            <>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl flex items-center gap-2 font-bold mb-4">
                        <InfoCircleOutlined className="text-blue-500" /> Ghi chú
                    </h2>
                    <Input.TextArea
                        rows={3}
                        placeholder="Ghi chú cho người bán..."
                        value={orderNote}
                        onChange={e => setOrderNote(e.target.value)}
                    />
                </div>
            </>
        );
    }

    const renderTotalPaymentSection = () => {
        // Tính tổng giá gốc tiền hàng
        const calculateSubtotal = () => {
            if (selectedCartItems.length !== 0) {
                return selectedCartItems.reduce((sum, item) => sum + item.quantity * item.product_variant.price, 0);
            }
            if (buyNowItem) {
                return buyNowItem.product_variant.price * buyNowItem.quantity;
            }
            return 0;
        };

        // Tính giảm giá sản phẩm ( nếu có discount từ sản phẩm thì tính tổng giảm của sản phẩm đó -> tính tất cả sản phẩm được giảm giá)
        const calculateProductDiscount = () => {
            if (selectedCartItems.length !== 0) {
                return selectedCartItems.reduce(
                    (sum, item) => sum + item.quantity * (item.product_variant.price - item.product_variant.product.final_price),
                    0
                );
            }
            if (buyNowItem) {
                return (buyNowItem.product_variant.price * buyNowItem.quantity) - (buyNowItem.product_variant.final_price * buyNowItem.quantity);
            }
            return 0;
        };

        // Tính giảm giá từ voucher (nếu có voucher thì tính tổng giảm từ đơn hàng)
        const calculateVoucherDiscount = () => {
            if (!selectedVoucher) return 0;

            const total = calculateTotalAfterProductDiscount();

            if (selectedVoucher.discount_type === 'percent') {
                const discount = (total * parseFloat(selectedVoucher.value)) / 100;
                return Math.min(discount, parseFloat(selectedVoucher.max_discount || discount));
            } else {
                return parseFloat(selectedVoucher.value);
            }
        };

        return (
            <>
                <div className="bg-white rounded-lg p-6 shadow-sm my-4">

                    <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                        <div className="w-2/3"></div>
                        <div className="w-1/3 flex justify-between items-center">
                            <div className="w-1/2 flex flex-col items-start gap-5">
                                <p>Tổng tiền hàng ({selectedCartItems.length != 0 ? selectedCartItems.reduce((sum, item) => sum + item.quantity, 0) : buyNowItem ? buyNowItem.quantity : 0} sản phẩm):</p>
                                <p>Giảm giá sản phẩm:</p>
                                {selectedVoucher && <p className="text-orange-600 font-medium">Giảm voucher:</p>}
                                <p>Phí vận chuyển:</p>
                                <p className='font-bold text-lg text-red-600 '>Tổng thanh toán:</p>


                            </div>
                            <div className="w-1/2 flex flex-col items-end gap-5">
                                <p>{formatPrice(calculateSubtotal())}</p>
                                <p>-{formatPrice(calculateProductDiscount())}</p>
                                {selectedVoucher && <p className="text-orange-600 font-medium">-{formatPrice(calculateVoucherDiscount())}</p>}
                                <p>0₫</p>
                                <p className='font-bold text-lg text-red-600'>{formatPrice(calculateTotalAfterProductDiscount() - calculateVoucherDiscount())}</p>
                            </div>
                        </div>




                    </div>


                    <div className="flex justify-between items-center mt-6 pt-6 border-t font-bold text-lg text-red-600">
                        <div className="w-2/3"></div>
                        <div className="w-1/3 flex justify-between items-center">
                            <div className="w-1/3 flex flex-col items-start gap-5">
                            </div>
                            <div className="w-2/3 flex flex-col items-end gap-5 ">

                                <Button
                                    type="primary"
                                    className="w-full bg-black text-white py-5 font-semibold text-lg "
                                    onClick={handleCheckout}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <LoadingOutlined />}
                                    Đặt hàng
                                </Button>

                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const renderPaymentMethodSection = () => {
        return (
            <>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Hình thức thanh toán</h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            <Radio checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                            <CarOutlined style={{ fontSize: 24 }} />
                            <span className="font-medium flex-1">Thanh toán khi nhận hàng</span>
                        </label>

                        <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            <Radio checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} />
                            <img src={momo} width={32} height={32} alt="Momo" />
                            <span className="font-medium flex-1">Ví Momo</span>
                        </label>
                    </div>
                </div>
            </>
        );
    }

    // ======================= MAIN RENDER =======================
    return (
        <div className="min-h-screen mb-28 bg-gray-50 p-6 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>

            {/* Địa chỉ */}
            {renderAddressSection()}

            {/* Sản phẩm */}
            {renderProductSection()}

            {/* Địa chỉ */}
            {renderVoucherSection()}

            {/* Ghi chú */}
            {renderNoteSection()}

            {/* Phương thức thanh toán */}
            {renderPaymentMethodSection()}

            {/* Tổng thanh toán */}
            {renderTotalPaymentSection()}

        </div >
    );
};

export default Checkout;
