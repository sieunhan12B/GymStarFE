import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { Checkbox, Button, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { cartService } from '@/services/cart.service';
import { NotificationContext } from "@/App";
import { setCart, updateItemQuantity } from '../../../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import { path } from '../../../common/path';
import { formatPrice } from '../../../utils/utils';
import useDebounce from '../../../hooks/useDebounce';
const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);

    const cartItemsFromRedux = useSelector(state => state.cartSlice.items);
    const [cartItems, setCartItems] = useState([]);
    const [selectedCartItems, setSelectedCartItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debouncedCartItems = useDebounce(cartItems, 500);

    // Load cart từ redux
    useEffect(() => {
        const items = cartItemsFromRedux.map(item => ({ ...item, originalQuantity: item.quantity }));
        setCartItems(items);
    }, [cartItemsFromRedux]);


    // Xóa 1 sản phẩm
    const handleDeleteItem = async (cart_detail_id) => {
        try {
            const res = await cartService.deleteCartItem({ cart_detail_id });
            setCartItems(prev => prev.filter(item => item.cart_detail_id !== cart_detail_id));
            dispatch(setCart(cartItems.filter(item => item.cart_detail_id !== cart_detail_id)));
            showNotification(res.data.message, "success");
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        }
    };


    // ========= Hàm tăng giảm số lượng =========
    // Hàm tăng giảm số lượng - cập nhật UI ngay lập tức
    const handleQuantityChange = (cart_detail_id, newQuantity) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.cart_detail_id === cart_detail_id) {
                    if (newQuantity < 1) {
                        showNotification("Số lượng tối thiểu là 1", "warning");
                        return item;
                    }
                    if (newQuantity > 10) {
                        showNotification("Mỗi sản phẩm chỉ được thêm tối đa 10 cái", "warning");
                        return item;
                    }
                    // Cập nhật UI ngay
                    dispatch(updateItemQuantity({ cart_detail_id, quantity: newQuantity }));
                 
                    return { ...item, quantity: newQuantity };
                }
                
                return item;
            })
        );
    };


    // Xóa các sản phẩm đã chọn
    // Hàm xóa tất cả sản phẩm đã chọn
    const handleDeleteSelectedItems = async () => {
        if (selectedCartItems.length === 0) return;

        try {
            // Gọi API xóa nhiều sản phẩm 1 lần
            await cartService.deleteCartItems({ cart_detail_ids: selectedCartItems });

            // Cập nhật state local
            setCartItems(prev => {
                const newCartItems = prev.filter(item => !selectedCartItems.includes(item.cart_detail_id));

                // Cập nhật Redux ngay trong callback để tránh async issue
                dispatch(setCart(newCartItems));

                return newCartItems;
            });

            // Reset lựa chọn
            setSelectedCartItems([]);

            showNotification("Đã xóa các sản phẩm đã chọn", "success");
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi khi xóa sản phẩm", "error");
        }
    };


    // Chuyển sang CheckoutPage
    const handleCheckout = () => {
        if (selectedCartItems.length === 0) {
            showNotification("Vui lòng chọn sản phẩm để đặt hàng", "error");
            return;
        }
        console.log(cartItems);
        const itemsToCheckout = cartItems.filter(item => selectedCartItems.includes(item.cart_detail_id));
        navigate('/dat-hang', { state: { selectedCartItems: itemsToCheckout } });
    };

    // ========= Update Cart API khi quantity thay đổi =========


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
                // Sau khi update API, cập nhật lại originalQuantity để lần sau so sánh
                setCartItems(prev =>
                    prev.map(item => ({ ...item, originalQuantity: item.quantity }))
                );
            } catch (error) {
                console.log(error);
            }
        };

        if (debouncedCartItems.some(item => item.quantity !== item.originalQuantity)) {
            updateCartApi();
        }
    }, [debouncedCartItems]);



    return (
        <div className="min-h-screen max-w-7xl mx-auto bg-gray-50 p-6">
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng</h2>

            {cartItems.length === 0 ? (
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
            ) : (
                <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
                    {/* Chọn tất cả / Xóa tất cả */}
                    <div className="flex justify-between items-center mb-4">
                        <Checkbox
                            checked={selectedCartItems.length === cartItems.length && cartItems.length > 0}
                            indeterminate={selectedCartItems.length > 0 && selectedCartItems.length < cartItems.length}
                            onChange={e => {
                                if (e.target.checked) {
                                    setSelectedCartItems(cartItems.map(item => item.cart_detail_id));
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

                    {/* ===== Danh sách sản phẩm ===== */}
                    <div className="space-y-6 mb-6">
                        {cartItems.map((item) => (
                            <div
                                key={item.cart_detail_id}
                                className="grid grid-cols-12 gap-4 items-center border-b pb-4"
                            >


                                {/* 1. Thông tin sản phẩm: ảnh + tên */}
                                <div className="col-span-3 flex  items-center gap-4">
                                    <Checkbox
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
                                    <div className="flex flex-col max-w-[120px]">
                                        <Tooltip title={item.product_variant?.product?.name}>
                                            <h3 className="font-semibold truncate">{item.product_variant?.product?.name}</h3>
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
                                        {formatPrice(item.product_variant?.product?.price)}
                                    </span>
                                    {item.product_variant?.product?.discount > 0 && (
                                        <span className="font-bold">{formatPrice(item.product_variant?.product?.final_price)}</span>
                                    )}
                                </div>

                                {/* 3. Nút tăng/giảm (giữ kiểu cũ) */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="flex items-center gap-2 border rounded-lg">
                                        <button
                                            className="px-3 py-1 hover:bg-gray-100"
                                            onClick={() => handleQuantityChange(item.cart_detail_id, item.quantity - 1)}
                                        >-</button>
                                        <span className="px-4">{item.quantity}</span>
                                        <button
                                            className="px-3 py-1 hover:bg-gray-100"
                                            onClick={() => handleQuantityChange(item.cart_detail_id, item.quantity + 1)}
                                        >+</button>
                                    </div>
                                </div>

                                {/* 4. Thành tiền (gốc + sau giảm) */}
                                <div className="col-span-2 flex flex-col items-center">
                                    <span className="line-through text-sm text-gray-400">{formatPrice(item.product_variant?.product?.price * item.quantity)}</span>
                                    <span className="font-bold">{formatPrice((item.product_variant?.product?.final_price || item.product_variant?.product?.price) * item.quantity)}</span>
                                </div>

                                {/* 5. Nút xóa */}
                                <div className="col-span-1 flex justify-center">
                                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteItem(item.cart_detail_id)}>
                                        <DeleteOutlined />  Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>



                    {/* Footer cố định */}
                    <div
                        style={{ boxShadow: "0 -4px 6px -4px rgba(0,0,0,0.1)" }} // chỉ phía trên

                        className="sticky bottom-0  w-full bg-white sha  border-t py-8 flex justify-between items-center  ">
                        {/* Chọn tất cả / Xóa tất cả */}
                        <div className="flex items-center gap-4">
                            <Checkbox
                                checked={selectedCartItems.length === cartItems.length && cartItems.length > 0}
                                indeterminate={selectedCartItems.length > 0 && selectedCartItems.length < cartItems.length}
                                onChange={e => {
                                    if (e.target.checked) {
                                        setSelectedCartItems(cartItems.map(item => item.cart_detail_id));
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

                        {/* Tổng số lượng + thành tiền */}
                        <div className="flex items-center gap-6">
                            <span className="text-gray-500 text-sm">
                                Tổng sản phẩm: {selectedCartItems.length} {/* chỉ đếm số item được tick */}
                            </span>
                            <span className="text-lg font-bold">
                                Thành tiền: {cartItems.filter(item => selectedCartItems.includes(item.cart_detail_id))
                                    .reduce((sum, item) => sum + (item.product_variant?.product?.final_price || 0) * item.quantity, 0)
                                    .toLocaleString()}đ
                            </span>

                            {/* Nút Đặt hàng */}
                            <button
                                className="bg-black text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-800 flex items-center gap-2"
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <LoadingOutlined />}
                                Mua hàng
                            </button>
                        </div>


                    </div>

                </div>
            )}
        </div>
    );
};

export default Cart;
