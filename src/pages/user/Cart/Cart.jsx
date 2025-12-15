import React, { useContext, useEffect, useState } from 'react';
import {
    CarOutlined,
    InfoCircleOutlined,
    EditOutlined,
    StarOutlined,
    StarFilled,
    DeleteOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { Input, Checkbox, Radio, Modal, Button, Form, Tooltip } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { cartService } from '@/services/cart.service';
import { NotificationContext } from "@/App";
import { formatPrice } from '../../../utils/utils';
import AddressSelector from './AddressSelector';
import { addressService } from '@/services/address.service';
import useDebounce from '../../../hooks/useDebounce';
import { setCart } from '../../../redux/cartSlice';
import { orderService } from '../../../services/order.service';
import { useNavigate } from 'react-router-dom';
import { path } from '../../../common/path';


const Cart = () => {
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [orderNote, setOrderNote] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState("add");
    const [editingAddress, setEditingAddress] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCartItems, setSelectedCartItems] = useState([]);


    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);
    const cartItemsFromRedux = useSelector((state) => state.cartSlice.items);
    const dispatch = useDispatch();

    const [cartItems, setCartItems] = useState([]);
    const [form] = Form.useForm();

    const debouncedCartItems = useDebounce(cartItems, 500); // 500ms delay

    // map cartItems và thêm originalQuantity
    useEffect(() => {
        const items = cartItemsFromRedux.map((item) => ({
            ...item,
            originalQuantity: item.quantity
        }));
        setCartItems(items);
    }, [cartItemsFromRedux]);

    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum + (Number(item.product_variant?.product?.final_price) || 0) * (item.quantity || 0),
        0
    );
    const discount = cartItems.reduce(
        (sum, item) =>
            sum +
            ((item.product_variant?.product?.price || 0) -
                (Number(item.product_variant?.product?.final_price) || 0)) *
            (item.quantity || 0),
        0
    );
    const shipping = 0;
    const total = subtotal + shipping;

    const parseAddressDetail = (address = "") => {
        const parts = address.split(",").map(p => p.trim());
        return {
            houseNumber: parts[0] || "",
            ward: parts[1] || "",
            city: parts[2] || "",
        };
    };
    
    //==============API GET CART===================//
    const fetchCart = async () => {
        try {
            const res = await cartService.getCart();
            console.log(res);
            // Giả sử API trả về: res.data.data.cart_items
            const cartData = res.data.data || [];
            // Cập nhật Redux
            dispatch(setCart(cartData));
        } catch (error) {
            console.log("Lỗi fetch cart:", error);
        }
    };


    //==============API ADDRESS===================//
    const fetchAddresses = async () => {
        try {
            const res = await addressService.getAddressById();
            const apiAddresses = res.data.data.addresses;
            setAddresses(apiAddresses);
            const defaultAddress = apiAddresses.find(addr => addr.is_default);
            if (defaultAddress) setSelectedAddressId(defaultAddress.address_id);
        } catch (error) {
            console.error("Không thể lấy danh sách địa chỉ", error);
        }
    };
    useEffect(() => {

        fetchAddresses();
    }, []);


    //==============XỬ LÝ CHỈNH SỬA ADDRESS===================//
    const handleAddUpdateAddress = async (values) => {
        const address_detail = [values.houseNumber, values.ward, values.city].filter(Boolean).join(", ");
        const payload = { receiver_name: values.receiver_name, phone: values.phone, address_detail };
        try {
            let res;
            if (addressModalMode === "add") {
                res = await addressService.addAddress(payload);
            } else {
                res = await addressService.updateAddress(editingAddress.address_id, payload);
            }
            showNotification(res.data.message, "success");
            fetchAddresses();
            setOpenAddEditModal(false);
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        }
    };


    const handleChooseDefaultAddress = async (addressId) => {
        try {
            const res = await addressService.chooseDefaultAddress(addressId);
            showNotification(res.data.message, "success");
            await fetchAddresses();
            setOpenAddressModal(false);
        } catch (error) {
            showNotification(error?.response?.data?.message || "Không thể chọn địa chỉ mặc định", "error");
        }
    };

    useEffect(() => {
        const updateCartApi = async () => {
            try {
                for (let item of debouncedCartItems) {
                    if (item.quantity !== item.originalQuantity) {
                        await cartService.updateCart({
                            product_variant_id: item.product_variant.product_variant_id,
                            quantity: item.quantity,
                        });
                    }
                }
                // Fetch lại cart về Redux

                fetchCart();

                showNotification("Cập nhật giỏ hàng thành công", "success");
            } catch (error) {
                showNotification(error?.response?.data?.message || "Có lỗi khi cập nhật giỏ hàng", "error");
            }
        };

        // Không gọi khi component mới mount
        if (debouncedCartItems.some(item => item.quantity !== item.originalQuantity)) {
            updateCartApi();
        }
    }, [debouncedCartItems]);

    //==============HANDLE + / -==================//
    const handleQuantityChange = (cart_detail_id, newQuantity) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.cart_detail_id === cart_detail_id) {

                    // ⭐ Kiểm tra min / max trước khi cập nhật
                    if (newQuantity < 1) {
                        showNotification("Số lượng tối thiểu là 1", "warning");
                        return item; // giữ nguyên
                    }
                    if (newQuantity > item.product_variant.stock) {
                        showNotification(`Tối đa ${item.product_variant.stock} sản phẩm`, "warning");
                        return item; // giữ nguyên
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };


    //==============DELETE ITEM==================//
    const handleDeleteItem = async (cart_detail_id) => {
        console.log(cart_detail_id);
        try {
            const res = await cartService.deleteCartItem({ cart_detail_id });
            console.log(res);
            setCartItems(prev => prev.filter(item => item.cart_detail_id !== cart_detail_id));
            showNotification("Xóa sản phẩm thành công", "success");
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        }
    };

    //==============XỬ LÝ ĐẶT HÀNG ==================//
    const handleCheckout = async () => {
        if (!selectedAddressId) {
            showNotification("Vui lòng chọn địa chỉ", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            // 1. Cập nhật số lượng nếu thay đổi
            for (let item of cartItems) {
                if (item.quantity !== item.originalQuantity) {
                    await cartService.updateCart({
                        product_variant_id: item.product_variant.product_variant_id,
                        quantity: item.quantity,
                    });
                }
            }

            // 2. Tạo đơn hàng
            const orderPayload = {
                cart_detail_ids: selectedCartItems,
                note: orderNote,
                address_id: selectedAddressId,
                method: paymentMethod.toUpperCase(),
            };
            console.log(orderPayload);

            // TODO: gọi API tạo đơn hàng
            const res = await orderService.createOrder(orderPayload);
            console.log(res);
            showNotification(res.data.message, "success");
            fetchCart();

            // reset originalQuantity
            // setCartItems(prev => prev.map(item => ({ ...item, originalQuantity: item.quantity })));
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        } finally {
            setIsSubmitting(false);
        }
    };







    //==============RENDER CART INFO==================//
    const renderCartInfomation = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Giỏ hàng</h2>
                </div>

                <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                        <div key={item.cart_detail_id} className="flex gap-4">
                            <Checkbox
                                className="mt-2"
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
                                className="w-24 h-24 object-cover rounded-lg"
                            />

                            <div className="flex-1">
                                <h3 className="font-medium text-sm mb-1">{item.product_variant?.product?.name}</h3>
                                <div className="text-xs text-gray-500 mb-2">{item.product_variant?.color || "-"} / {item.product_variant?.size || "-"}</div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 border rounded">
                                        <button className="px-2 py-1 hover:bg-gray-100" onClick={() => handleQuantityChange(item.cart_detail_id, item.quantity - 1)}>-</button>
                                        <span className="px-3">{item.quantity}</span>
                                        <button className="px-2 py-1 hover:bg-gray-100" onClick={() => handleQuantityChange(item.cart_detail_id, item.quantity + 1)}>+</button>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold">{formatPrice(Number(item.product_variant?.product?.final_price) * item.quantity)}</div>
                                        {item.product_variant?.product?.price && item.product_variant?.product?.discount && (
                                            <div className="text-xs text-gray-400 line-through">{formatPrice(item.product_variant.product.price)}</div>
                                        )}
                                    </div>
                                </div>

                                <button className="text-xs text-gray-500 mt-2 flex items-center gap-1" onClick={() => handleDeleteItem(item.cart_detail_id)}>
                                    <DeleteOutlined style={{ fontSize: 12 }} /> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span>Tạm tính</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Phí giao hàng</span>
                        <span>Miễn phí</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t">
                        <span>Thành tiền</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="text-xs text-orange-600">
                        Đã giảm {formatPrice(discount)} tiền giá gốc
                    </div>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                    onClick={handleCheckout} disabled={isSubmitting}>
                    {isSubmitting && <LoadingOutlined />}
                    ĐẶT HÀNG
                </button>
            </div>
        </div>
    );

    //==============RENDER SHIP INFO==================//
    const renderShipInfomation = () => {
        // giữ nguyên renderShipInfomation từ code cũ
        return (
            <div className="space-y-6">

                {/* Shipping Information */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Địa chỉ nhận hàng</h2>

                    {addresses.find(a => a.address_id === selectedAddressId) ? (
                        <div className="border rounded-lg p-4 mb-3">
                            <div className="font-medium text-sm">
                                {
                                    addresses.find(a => a.address_id === selectedAddressId)
                                        .receiver_name
                                }{" "}
                                |{" "}
                                {
                                    addresses.find(a => a.address_id === selectedAddressId)
                                        .phone
                                }
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                                {
                                    addresses.find(a => a.address_id === selectedAddressId)
                                        .address_detail
                                }
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-3">
                            Chưa có địa chỉ
                        </p>
                    )}

                    <button
                        className="text-blue-600 text-sm font-medium"
                        onClick={() => setOpenAddressModal(true)}
                    >
                        Thay đổi / Chọn địa chỉ
                    </button>
                </div>

                {/* NOTE */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl flex item-center gap-2 font-bold mb-6 "> <InfoCircleOutlined className="text-blue-500" />
                        Ghi chú cho người bán</h2>

                    <div className="space-y-3">

                        <Input.TextArea
                            rows={3}
                            placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            className="rounded-lg"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                            (Không bắt buộc)
                        </p>


                    </div>


                </div>

                {/* PAYMENT METHOD */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Hình thức thanh toán</h2>

                    <div className="space-y-3">

                        {/* COD option */}
                        <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">

                            <Radio
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                            />

                            <CarOutlined style={{ fontSize: 24 }} />
                            <span className="font-medium flex-1">Thanh toán khi nhận hàng</span>
                        </label>



                        {/* MOMO */}
                        <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">

                            <Radio
                                checked={paymentMethod === 'momo'}
                                onChange={() => setPaymentMethod('momo')}
                            />

                            <div className="w-10 h-10 bg-pink-600 rounded-lg"></div>
                            <span className="font-medium flex-1">Ví Momo</span>
                        </label>


                    </div>


                </div>
            </div>
        );
    };


    //==============RENDER MODAL ADD EDIT ADDRESS==================//
    const renderModalAddEditAddress = () => {
        return (
            <Modal
                title={addressModalMode === "add" ? "Thêm địa chỉ mới" : "Cập nhật địa chỉ"}
                open={openAddEditModal}
                onCancel={() => { setOpenAddEditModal(false); form.resetFields(); }}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleAddUpdateAddress}>
                    <Form.Item label="Tên người nhận" name="receiver_name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}><Input /></Form.Item>
                    <AddressSelector />
                </Form>
            </Modal>
        );
    };



    //==============RENDER MODAL CHOOSEADDRESS INFO==================//
    const renderModalChooseAddress = () => {
        return (
            <Modal
                title="Chọn địa chỉ nhận hàng"
                open={openAddressModal}
                onCancel={() => setOpenAddressModal(false)}
                footer={null}
                width={600}
            >
                <div className="space-y-3 max-h-[60vh] overflow-auto">
                    {addresses.map((addr) => (
                        <div
                            key={addr.address_id}
                            onClick={() => {
                                console.log(addresses);
                                console.log(addr);
                                setSelectedAddressId(addr.address_id);
                                setOpenAddressModal(false);
                            }}
                            className={`
                                   border rounded-lg p-4 cursor-pointer
                                   flex justify-between items-start
                                   hover:border-blue-500 transition
                                   ${selectedAddressId === addr.address_id
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                                }
                               `}
                        >
                            <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {addr.receiver_name} | {addr.phone}

                                    {addr.is_default ? (
                                        <StarFilled className="text-yellow-400" />
                                    ) : null}
                                </div>

                                <div className="text-xs text-gray-500 mt-1">
                                    {addr.address_detail}
                                </div>

                            </div>


                            <div className="flex gap-2">
                                {!addr.is_default && (
                                    <Tooltip title="Đặt làm địa chỉ mặc định">
                                        <Button
                                            size="small"
                                            type="default"
                                            className="border px-2 py-1 flex items-center gap-1 hover:bg-gray-100"
                                            icon={<StarOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleChooseDefaultAddress(addr.address_id);
                                            }}
                                        />
                                    </Tooltip>
                                )}


                                <Tooltip title="Chỉnh sửa địa chỉ">
                                    <Button
                                        icon={<EditOutlined />}
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            const parsed = parseAddressDetail(addr.address_detail);

                                            setAddressModalMode("edit");
                                            setEditingAddress(addr);

                                            form.setFieldsValue({
                                                receiver_name: addr.receiver_name,
                                                phone: addr.phone,
                                                houseNumber: parsed.houseNumber,
                                                ward: parsed.ward,
                                                city: parsed.city,
                                            });

                                            setOpenAddEditModal(true);
                                        }}
                                    />
                                </Tooltip>

                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            setAddressModalMode("add");
                            setEditingAddress(null);
                            form.resetFields(); // ⭐️ QUAN TRỌNG
                            setOpenAddEditModal(true);
                        }}

                        className="
                               w-full flex items-center justify-center gap-2
                               border border-dashed rounded-lg py-3
                               text-blue-600 hover:bg-blue-50
                           "
                    >
                        + Thêm địa chỉ mới
                    </button>
                </div>
            </Modal>
        );// giữ nguyên modal chọn địa chỉ từ code cũ
    };

    
    
    //==============RENDER EMPTY CART ==================//
    const renderEmptyCart = () => (
    <div className="bg-white rounded-lg p-10 shadow-sm flex flex-col items-center justify-center text-center">
        <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty cart"
            className="w-40 mb-6 opacity-80"
        />

        <h2 className="text-xl font-bold mb-2">
            Giỏ hàng của bạn trống
        </h2>

        <p className="text-gray-500 mb-6">
            Hãy mua thêm sản phẩm để tiếp tục nhé
        </p>

        <button
            onClick={() => navigate(path.home)}
            className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
        >
            Mua sắm ngay
        </button>
    </div>
);


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderShipInfomation()}
                    {renderModalAddEditAddress()}
                    {renderModalChooseAddress()}
                    {cartItems.length === 0 ? renderEmptyCart() : renderCartInfomation()}
                </div>
            </div>
        </div>
    );
};

export default Cart;
