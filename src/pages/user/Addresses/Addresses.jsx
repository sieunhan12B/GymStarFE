import { useEffect, useState, useContext } from "react";
import { PlusOutlined, StarFilled, StarOutlined, EditOutlined, EnvironmentOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Tooltip, Spin } from "antd";
import { addressService } from "@/services/address.service";
import { NotificationContext } from "@/App";
import AddEditAddressModal from "@/components/AddEditAddressModal/AddEditAddressModal";


const Addresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddEditModal, setOpenAddEditModal] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState("add");
    const [editingAddress, setEditingAddress] = useState(null);

    const { showNotification } = useContext(NotificationContext);
    const MAX_ADDRESS = 3;
    const isMaxAddress = addresses.length >= MAX_ADDRESS;
    console.log(editingAddress)

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

    // ================= PARSE ADDRESS =================
    const parseAddressDetail = (address = "") => {
        const parts = address.split(",").map(p => p.trim());
        return {
            houseNumber: parts[0] || "", // Chỉ lấy số nhà / tên đường
            ward: parts[1] || "",
            city: parts[2] || "",
        };
    };


    // ================= ADD / UPDATE =================
    const handleSubmitAddress = async (values) => {
        const address_detail = [values.houseNumber, values.ward, values.city].filter(Boolean).join(", ");
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
            setEditingAddress(null);
            fetchAddresses();
        } catch (error) {
            showNotification(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await addressService.deleteAddress(addressId);
            showNotification("Xóa địa chỉ thành công", "success");
            fetchAddresses();
        } catch (error) {
            showNotification(error?.response?.data?.message || "Xóa địa chỉ thất bại", "error");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* HEADER */}
            <div className="flex justify-between items-center min-h-[128px] border-b p-6">
                <h1 className="text-2xl font-bold">Địa chỉ của tôi</h1>

                <Tooltip
                    title={isMaxAddress ? "Bạn chỉ được tối đa 3 địa chỉ. Vui lòng chỉnh sửa địa chỉ hiện có." : ""}
                >
                    <button
                        disabled={isMaxAddress}
                        onClick={() => {
                            setAddressModalMode("add");
                            setEditingAddress(null);
                            setOpenAddEditModal(true);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full ${isMaxAddress
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-black text-white hover:opacity-90"
                            }`}
                    >
                        <PlusOutlined />
                        THÊM ĐỊA CHỈ MỚI
                    </button>
                </Tooltip>
            </div>

            {/* LIST */}
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spin size="large" />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                        <EnvironmentOutlined className="text-5xl mb-4" />
                        <p className="text-lg font-medium mb-1">Bạn chưa có địa chỉ nào</p>
                        <p className="text-sm mb-6">Thêm địa chỉ để thuận tiện cho việc đặt hàng</p>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setAddressModalMode("add");
                                setEditingAddress(null);
                                setOpenAddEditModal(true);
                            }}
                            className="bg-black hover:bg-black/90 border-none"
                        >
                            Thêm địa chỉ mới
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {addresses.map((addr) => (
                            <div key={addr.address_id} className="border-b pb-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{addr.receiver_name} | {addr.phone}</span>
                                            {!addr.is_default ? (
                                                <span
                                                    onClick={() => handleChooseDefaultAddress(addr.address_id)}
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

                                        <div className="text-gray-700 flex flex-col gap-0.5">
                                            <div>{parseAddressDetail(addr.address_detail).houseNumber}</div>
                                            <div>
                                                {parseAddressDetail(addr.address_detail).ward},{" "}
                                                {parseAddressDetail(addr.address_detail).city}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
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
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            <AddEditAddressModal
                open={openAddEditModal}
                onCancel={() => setOpenAddEditModal(false)}
                addressData={editingAddress}
                mode={addressModalMode}
                onSubmit={handleSubmitAddress}
            />
        </div>
    );
};

export default Addresses;
