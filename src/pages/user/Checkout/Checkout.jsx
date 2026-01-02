import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, Radio, Input, Tooltip, Form } from 'antd';
import { InfoCircleOutlined, StarOutlined, StarFilled, EditOutlined, LoadingOutlined, CarOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { addressService } from '@/services/address.service';
import { orderService } from '@/services/order.service';
import { NotificationContext } from "@/App";
import momo from '@/assets/images/momo.png';
import { formatPrice, setLocalStorage } from '../../../utils/utils';
import { useDispatch } from 'react-redux';
import { setCart } from '../../../redux/cartSlice';
import { cartService } from '../../../services/cart.service';
import AddressSelector from '@/components/AddressSelector/AddressSelector';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);

    const selectedCartItems = location.state?.selectedCartItems || [];
    const buyNowItem = location.state?.buyNowItem;
    console.log(buyNowItem)
    console.log(selectedCartItems)
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [orderNote, setOrderNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);



    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState("add");
    const [editingAddress, setEditingAddress] = useState(null);
    const [form] = Form.useForm();



    const dispatch = useDispatch();

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

    const fetchCart = async () => {
        try {
            const res = await cartService.getCart();
            dispatch(setCart(res.data.data));
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        }
    };
    const finalPrice = buyNowItem
        ? buyNowItem.product.price *
        (1 - (buyNowItem.product.discount || 0) / 100)
        : 0;

    useEffect(() => {
        fetchAddresses();
    }, []);




    const parseAddressDetail = (address = "") => {
        const parts = address.split(",").map(p => p.trim());
        return { houseNumber: parts[0] || "", ward: parts[1] || "", city: parts[2] || "" };
    };

    const handleSubmitAddress = async (values) => {
        const address_detail = [values.houseNumber, values.ward, values.city].filter(Boolean).join(", ");
        const payload = {
            receiver_name: values.receiver_name,
            phone: values.phone,
            address_detail,
        };
        try {
            if (addressModalMode === "add") await addressService.addAddress(payload);
            else await addressService.updateAddress(editingAddress.address_id, payload);
            showNotification(addressModalMode === "add" ? "Thêm địa chỉ thành công" : "Cập nhật địa chỉ thành công", "success");
            setOpenAddEditModal(false);
            form.resetFields();
            fetchAddresses(); // Reload addresses
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        }
    };


    const disableAddAddress = addresses.length >= 3;



    // Thanh toán
    const handleCheckout = async () => {
        if (!selectedAddressId) {
            showNotification("Vui lòng chọn địa chỉ", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            let res;
            if (selectedCartItems.length != 0) {
                const payload = {
                    cart_detail_ids: selectedCartItems.map(item => item.cart_detail_id),
                    note: orderNote,
                    address_id: selectedAddressId,
                    method: paymentMethod.toUpperCase(),
                };
                res = await orderService.createOrder(payload);
                showNotification(res.data.message, "success");
                fetchCart();
            }

            if (buyNowItem) {
                const payload = {
                    product_variant_id: buyNowItem.product_variant.product_variant_id,
                    quantity: buyNowItem.quantity,
                    note: orderNote,
                    address_id: selectedAddressId,
                    method: paymentMethod.toUpperCase(),
                };
                res = await orderService.orderNow(payload);
                showNotification(res.data.message, "success");
            }

            if (paymentMethod === "momo" && res.data.payUrl) {
                setLocalStorage("tempCart", selectedCartItems);
                window.location.href = res.data.payUrl;
            } else {
                navigate(`/ket-qua-thanh-toan/${res.data.order_id}`);
            }
        } catch (error) {
            console.log(error)
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen mb-28 bg-gray-50 p-6 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>
            {/* Địa chỉ */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Địa chỉ nhận hàng</h2>
                {addresses.find(a => a.address_id === selectedAddressId) ? (
                    <div className="border rounded-lg p-4 mb-3">
                        <div className="font-medium text-sm">
                            {addresses.find(a => a.address_id === selectedAddressId).receiver_name} | {addresses.find(a => a.address_id === selectedAddressId).phone}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {addresses.find(a => a.address_id === selectedAddressId).address_detail}
                        </div>
                    </div>
                ) : <p className="text-sm text-gray-500 mb-3">Chưa có địa chỉ</p>}

                <Button type="link" className="text-blue-600 text-sm p-0 font-medium block" onClick={() => setOpenAddressModal(true)}> <EnvironmentOutlined /> Thay đổi / Chọn địa chỉ</Button>


                {/* Modal chọn địa chỉ */}
                <Modal
                    title="Chọn địa chỉ nhận hàng"
                    open={openAddressModal}
                    onCancel={() => setOpenAddressModal(false)}
                    footer={null}
                >
                    <div className="space-y-3 max-h-[60vh] overflow-auto">
                        {addresses.map(addr => (
                            <div
                                key={addr.address_id}
                                className={`border rounded-lg p-4 cursor-pointer flex justify-between items-start hover:border-blue-500 transition ${selectedAddressId === addr.address_id ? "border-blue-500 bg-blue-50" : ""}`}
                            >
                                <div onClick={() => { setSelectedAddressId(addr.address_id); setOpenAddressModal(false); }} className="flex-1">
                                    <div className="font-medium text-sm flex items-center gap-2">
                                        {addr.receiver_name} | {addr.phone}
                                        {addr.is_default && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                                                <StarFilled /> Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{addr.address_detail}</div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* Cập nhật */}
                                    <Tooltip title="Cập nhật">
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAddressModalMode("edit");
                                                setEditingAddress(addr);
                                                const parsed = parseAddressDetail(addr.address_detail);
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

                                    {/* Đặt mặc định */}
                                    {!addr.is_default && (
                                        <Tooltip title="Đặt làm địa chỉ mặc định">
                                            <Button
                                                icon={<StarOutlined />}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await addressService.chooseDefaultAddress(addr.address_id);
                                                        showNotification("Đã đặt làm địa chỉ mặc định", "success");
                                                        fetchAddresses();
                                                    } catch {
                                                        showNotification("Không thể đặt địa chỉ mặc định", "error");
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        ))}
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
                                form.resetFields();
                                setOpenAddEditModal(true);
                            }}
                        >
                            <PlusOutlined /> Thêm địa chỉ mới
                        </Button>
                    </Tooltip>
                </Modal>

                {/* Modal Thêm / Chỉnh sửa địa chỉ */}
                <Modal
                    title={addressModalMode === "add" ? "Thêm địa chỉ mới" : "Cập nhật địa chỉ"}
                    open={openAddEditModal}
                    onCancel={() => { setOpenAddEditModal(false); form.resetFields(); }}
                    onOk={() => form.submit()}
                >
                    <Form layout="vertical" form={form} onFinish={handleSubmitAddress}>
                        <Form.Item
                            label="Tên người nhận"
                            name="receiver_name"
                            rules={[{ required: true, message: "Tên người nhận không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: "Số điện thoại không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>

                        {/* Dùng AddressSelector */}
                        <AddressSelector form={form} />
                    </Form>
                </Modal>

                {/* Modal Thêm / Chỉnh sửa địa chỉ */}
                <Modal
                    title={addressModalMode === "add" ? "Thêm địa chỉ mới" : "Cập nhật địa chỉ"}
                    open={openAddEditModal}
                    onCancel={() => { setOpenAddEditModal(false); form.resetFields(); }}
                    onOk={() => form.submit()}
                >
                    <Form layout="vertical" form={form} onFinish={handleSubmitAddress}>
                        <Form.Item
                            label="Tên người nhận"
                            name="receiver_name"
                            rules={[{ required: true, message: "Tên người nhận không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: "Số điện thoại không được để trống" }]}
                        >
                            <Input />
                        </Form.Item>

                        {/* Dùng luôn AddressSelector */}
                        <AddressSelector form={form} />
                    </Form>
                </Modal>



            </div>


            {/* Sản phẩm */}
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
                                {formatPrice(item.product_variant?.product?.final_price)}
                            </div>

                            {/* Số lượng */}
                            <div className="col-span-2 text-center text-sm">{item.quantity}</div>

                            {/* Thành tiền */}
                            <div className="col-span-3 text-center font-medium text-red-600">
                                {(item.quantity * item.product_variant?.product?.final_price).toLocaleString()}₫
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
                            {formatPrice(finalPrice)}

                        </div>

                        {/* Số lượng */}
                        <div className="col-span-2 text-center text-sm">{buyNowItem.quantity}</div>

                        {/* Thành tiền */}
                        <div className="col-span-3 text-center font-medium text-red-600">
                            {formatPrice(finalPrice * buyNowItem.quantity)}
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
                            {formatPrice(finalPrice * buyNowItem.quantity)}
                        </span>

                    )}

                </div>
            </div>







            {/* Ghi chú */}
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

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Hình thức thanh toán</h2>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <Radio checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                        <CarOutlined style={{ fontSize: 24 }} />
                        <span className="font-medium flex-1">Thanh toán khi nhận hàng</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <Radio checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                        <img src={momo} width={32} height={32} alt="Momo" />
                        <span className="font-medium flex-1">Ví Momo</span>
                    </label>
                </div>
            </div>

            {/* Tổng thanh toán */}
            <div className="bg-white rounded-lg p-6 shadow-sm my-4">

                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                    <div className="w-2/3"></div>
                    <div className="w-1/3 flex justify-between items-center">
                        <div className="w-1/2 flex flex-col items-start gap-5">
                            <p>Tổng tiền hàng ({selectedCartItems.length != 0 ? selectedCartItems.reduce((sum, item) => sum + item.quantity, 0) : buyNowItem ? buyNowItem.quantity : 0} sản phẩm):</p>
                            <p>Giảm giá:</p>
                            <p>Phí vận chuyển:</p>
                            <p className='font-bold text-lg text-red-600 '>Tổng thanh toán:</p>


                        </div>
                        <div className="w-1/2 flex flex-col items-end gap-5 ">

                            {selectedCartItems.length != 0 && (
                                <>
                                    <p>
                                        {
                                            selectedCartItems
                                                .reduce((sum, item) => sum + item.quantity * item.product_variant.price, 0)
                                                .toLocaleString()
                                        }₫
                                    </p>



                                    <p>-
                                        {selectedCartItems
                                            .reduce(
                                                (sum, item) =>
                                                    sum + item.quantity * (item.product_variant.price - item.product_variant.product.final_price),
                                                0
                                            )
                                            .toLocaleString()}₫
                                    </p>


                                    <p>0₫</p>

                                    <p className='font-bold text-lg text-red-600 '>
                                        {selectedCartItems
                                            .reduce((sum, item) => sum + item.quantity * item.product_variant.product.final_price, 0)
                                            .toLocaleString()}₫
                                    </p>
                                </>
                            )}


                            {buyNowItem && (
                                <>
                                    <p>
                                        {formatPrice(buyNowItem.product.price * buyNowItem.quantity)}
                                    </p>



                                    <p>-
                                        {formatPrice((buyNowItem.product.price * buyNowItem.quantity) - finalPrice)}
                                    </p>


                                    <p>0₫</p>

                                    <p className='font-bold text-lg text-red-600 '>
                                        {formatPrice(finalPrice)}
                                    </p>
                                </>
                            )}


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





        </div >
    );
};

export default Checkout;
