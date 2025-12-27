import { useEffect, useState, useContext } from 'react';
import { PlusOutlined, StarFilled, EditOutlined, StarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Button, Tooltip, Spin } from 'antd';
import { addressService } from '@/services/address.service';
import { NotificationContext } from '@/App';
import AddressSelector from '../../../components/AddressSelector/AddressSelector';

const AddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState("add");
    const [editingAddress, setEditingAddress] = useState(null);
    const [form] = Form.useForm();
    const { showNotification } = useContext(NotificationContext);
    const MAX_ADDRESS = 3;
    const isMaxAddress = addresses.length >= MAX_ADDRESS;
    const [loading, setLoading] = useState(true);



    // ================= GET ADDRESSES =================
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await addressService.getAddressById();
            setAddresses(res.data.data.addresses || []);
        } catch (error) {
            showNotification(error.response?.data?.message, "error");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAddresses();
    }, []);

    // ================= HANDLE SET DEFAULT =================

    const handleChooseDefaultAddress = async (addressId) => {
        try {
            await addressService.chooseDefaultAddress(addressId);
            showNotification("Đã đặt làm địa chỉ mặc định", "success");
            fetchAddresses();
        } catch (error) {
            showNotification("Không thể đặt địa chỉ mặc định", "error");
        }
    };


    // ================= PARSE ADDRESS =================
    const parseAddressDetail = (address = "") => {
        const parts = address.split(",").map(p => p.trim());
        return {
            houseNumber: parts[0] || "",
            ward: parts[1] || "",
            city: parts[2] || "",
        };
    };

    // ================= ADD / UPDATE =================
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

            setOpenAddEditModal(false);
            form.resetFields();
            fetchAddresses();
        } catch (error) {
            showNotification(
                error?.response?.data?.message || "Có lỗi xảy ra",
                "error"
            );
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm ">
            <div className="flex justify-between items-center min-h-[128px]   border-b p-6">
                <h1 className="text-2xl font-bold">Địa chỉ của tôi</h1>

                <Tooltip
                    title={
                        isMaxAddress
                            ? "Bạn chỉ được tối đa 3 địa chỉ. Vui lòng chỉnh sửa địa chỉ hiện có."
                            : ""
                    }
                >
                    <button
                        disabled={isMaxAddress}
                        onClick={() => {
                            if (isMaxAddress) return;

                            setAddressModalMode("add");
                            setEditingAddress(null);
                            form.resetFields();
                            setOpenAddEditModal(true);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full 
            ${isMaxAddress
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-black text-white hover:opacity-90"
                            }`}
                    >
                        <PlusOutlined />
                        THÊM ĐỊA CHỈ MỚI
                    </button>
                </Tooltip>

            </div>

            {/* ================= LIST ================= */}
            <div className="p-6">
                {loading ? (
                    /* 🔄 Loading state */
                    <div className="flex justify-center py-16">
                        <Spin size="large" />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                        <EnvironmentOutlined className="text-5xl mb-4" />
                        <p className="text-lg font-medium mb-1">
                            Bạn chưa có địa chỉ nào
                        </p>
                        <p className="text-sm mb-6">
                            Thêm địa chỉ để thuận tiện cho việc đặt hàng
                        </p>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setAddressModalMode("add");
                                setEditingAddress(null);
                                form.resetFields();
                                setOpenAddEditModal(true);
                            }}
                            className="bg-black hover:bg-black/90 border-none"
                        >
                            Thêm địa chỉ mới
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {addresses.map(addr => (
                            <div key={addr.address_id} className="border-b pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {addr.receiver_name}
                                            {addr.is_default && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                                                    <StarFilled /> Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-gray-600">{addr.phone}</div>
                                        <div className="text-gray-700">{addr.address_detail}</div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <Tooltip title="Cập nhật">
                                            <Button
                                                icon={<EditOutlined />}
                                                onClick={() => {
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

                                        {!addr.is_default && (
                                            <Tooltip title="Đặt làm địa chỉ mặc định">
                                                <Button
                                                    icon={<StarOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleChooseDefaultAddress(addr.address_id);
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>



            {/* ================= MODAL ================= */}
            <Modal
                title={addressModalMode === "add" ? "Thêm địa chỉ mới" : "Cập nhật địa chỉ"}
                open={openAddEditModal}
                onCancel={() => {
                    setOpenAddEditModal(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
            >
                <Form layout="vertical" form={form} onFinish={handleSubmitAddress}>
                    <Form.Item label="Tên người nhận" name="receiver_name" rules={[{ required: true, message: "Tên người nhận không được để trống" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Số điện thoại không được để trống" }]}>
                        <Input />
                    </Form.Item>

                    {/* 🔥 DÙNG CHUNG */}
                    <AddressSelector />
                </Form>
            </Modal>
        </div>
    );
};

export default AddressBook;
