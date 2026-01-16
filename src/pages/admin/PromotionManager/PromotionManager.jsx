// React
import { useState, useEffect, useContext, useMemo } from "react";

// UI
import { Tag, Button, Modal, Tooltip, Form, Input, Select, InputNumber, DatePicker, Divider } from "antd";
import { DeleteOutlined, EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";

// Utils
import dayjs from "dayjs";
import { normalizeText } from "@/utils/normalizeText";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";

// Services
import { promotionService } from "@/services/promotion.service";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";

// Context
import { NotificationContext } from "@/App";
import { formatPrice } from "../../../utils/formatPrice";

/* ================= COMPONENT ================= */
const PromotionManager = () => {
    /* ===== STATE ===== */
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [promotions, setPromotions] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form] = Form.useForm();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm] = Form.useForm();
    const discountType = Form.useWatch("discount_type", form);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { showNotification } = useContext(NotificationContext);

    const getTimeStatus = (start, end) => {
        const now = dayjs();

        // Parse đúng định dạng DD/MM/YYYY
        const startDate = dayjs(start, "DD/MM/YYYY");
        const endDate = dayjs(end, "DD/MM/YYYY");

        if (now.isBefore(startDate)) {
            return { text: "Sắp diễn ra", color: "gold" };
        }

        if (now.isAfter(endDate)) {
            return { text: "Hết hạn", color: "red" };
        }

        return { text: "Đang diễn ra", color: "green" };
    };

    const handleCreatePromotion = async (values) => {
        const payload = {
            ...values,
            start_date: values.time[0].format("DD/MM/YYYY"),
            end_date: values.time[1].format("DD/MM/YYYY"),
        };

        delete payload.time;

        try {
            setCreateLoading(true);
            await promotionService.createPromotion(payload);
            showNotification("Tạo khuyến mãi thành công!", "success");
            setIsCreateModalOpen(false);
            form.resetFields();
            fetchPromotions(); // reload table
        } catch (error) {
            showNotification(error.response.data.message || "Tạo khuyến mãi thất bại!", "error");
        } finally {
            setCreateLoading(false);
        }
    };

    /* ===== FETCH PROMOTIONS ===== */
    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionService.getAllPromotionAdmin();
            setPromotions(res.data.data || []);
        } catch {
            showNotification("Tải danh sách khuyến mãi thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (discountType !== "percent") {
            form.setFieldValue("max_discount", undefined);
        }
    }, [discountType]);


    /* ===== FILTER PROMOTIONS ===== */
    const filteredPromotions = useMemo(() => {
        if (!searchText) return promotions;

        const keyword = removeVietnameseTones(normalizeText(searchText));

        return promotions.filter(
            (p) =>
                removeVietnameseTones(p.code || "")
                    .toLowerCase()
                    .includes(keyword) ||
                removeVietnameseTones(p.description || "")
                    .toLowerCase()
                    .includes(keyword)
        );
    }, [promotions, searchText]);


    const handleUpdatePromotion = async (values) => {
        const payload = {
            code: values.code,
            description: values.description,
            usage_per_user: values.usage_per_user,
            start_date: values.time[0].format("DD/MM/YYYY"),
            end_date: values.time[1].format("DD/MM/YYYY"),
        };

        try {
            setEditLoading(true);
            await promotionService.updatePromotion(
                selectedPromotion.promotion_id,
                payload
            );

            showNotification("Cập nhật khuyến mãi thành công", "success");
            setIsEditModalOpen(false);
            fetchPromotions();
        } catch (err) {
            showNotification(
                err?.response?.data?.message || "Cập nhật thất bại",
                "error"
            );
        } finally {
            setEditLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedPromotion) return;

        try {
            await promotionService.changePromotionStatus(
                selectedPromotion.promotion_id
            );
 
            showNotification(
                "Cập nhật trạng thái khuyến mãi thành công",
                "success"
            );

            setIsStatusModalOpen(false);
            fetchPromotions(); // reload table
        } catch (err) {
            showNotification(
                err?.response?.data?.message ||
                "Cập nhật trạng thái thất bại",
                "error"
            );
        }
    };


    const handleDeletePromotion = async () => {
        if (!selectedPromotion) return;

        try {
            setDeleteLoading(true);
            await promotionService.deletePromotion(
                selectedPromotion.promotion_id
            );

            showNotification("Xóa khuyến mãi thành công", "success");
            setIsDeleteModalOpen(false);
            fetchPromotions();
        } catch (err) {
            showNotification(
                err?.response?.data?.message || "Xóa khuyến mãi thất bại",
                "error"
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    /* ===== TABLE COLUMNS ===== */
    const promotionColumns = [
        {
            title: "Mã",
            dataIndex: "code",
            render: (v) => <b>{v}</b>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            render: (v) => v || "—",
        },
        {
            title: "Loại giảm",
            dataIndex: "discount_type",
            filters: [
                { text: "Phần trăm", value: "percent" },
                { text: "Cố định", value: "fixed" },
            ],
            onFilter: (value, record) =>
                normalizeText(record.discount_type) === value,

            render: (type) => (
                <Tag color={type === "percent" ? "blue" : "purple"}>
                    {type === "percent" ? "Phần trăm" : "Cố định"}
                </Tag>
            ),
        },
        {
            title: "Giá trị",
            render: (_, r) =>
                r.discount_type === "percent"
                    ? `${r.value}%`
                    : Number(r.value).toLocaleString() + "đ",
        },
        {
            title: "Đơn tối thiểu",
            dataIndex: "min_order_value",
            render: (v) => Number(v).toLocaleString() + "đ",
        },
        {
            title: "Giảm tối đa",
            dataIndex: "max_discount",
            render: (v) =>
                v ? Number(v).toLocaleString() + "đ" : "—",
        },
        {
            title: "Lượt / user",
            dataIndex: "usage_per_user",
            render: (v) => v ?? "—",
        },
        {
            title: "Thời gian",
            render: (_, r) => {
                const timeStatus = getTimeStatus(r.start_date, r.end_date);
                return (
                    <div className="text-sm">
                        <div>{r.start_date}</div>
                        <div className="text-gray-400">→ {r.end_date}</div>
                        <Tag color={timeStatus.color} className="mt-1">
                            {timeStatus.text}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            filters: [
                { text: "Hoạt động", value: "active" },
                { text: "Ngưng", value: "inactive" },
            ],
            onFilter: (value, record) => record.status === value,

            render: (_, r) => {
                const isActive = r.status === "active";

                return (
                    <div className="flex items-center justify-between gap-2">
                        <Tag color={isActive ? "green" : "red"}>
                            {isActive ? "Hoạt động" : "Ngưng"}
                        </Tag>

                        <Tooltip
                            title={
                                isActive
                                    ? "Ngưng khuyến mãi"
                                    : "Kích hoạt khuyến mãi"
                            }
                        >
                            <Button
                                size="small"
                                type="text"
                                danger={isActive}
                                icon={isActive ? <LockOutlined /> : <UnlockOutlined />}
                                onClick={() => {
                                    setSelectedPromotion(r);
                                    setIsStatusModalOpen(true);
                                }}
                            >
                            </Button>
                        </Tooltip>
                    </div>
                );
            },
        },

        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, r) => {
                const isUsed = r.used_count > 0; // theo BE

                return (
                    <div className="flex gap-2 justify-center">
                        {/* ✏️ SỬA */}
                        <Tooltip title="Chỉnh sửa khuyến mãi">
                            <Button
                                size="small"
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setSelectedPromotion(r);
                                    editForm.setFieldsValue({
                                        code: r.code,
                                        description: r.description,
                                        usage_per_user: r.usage_per_user,
                                        time: [
                                            dayjs(r.start_date, "DD/MM/YYYY"),
                                            dayjs(r.end_date, "DD/MM/YYYY"),
                                        ],
                                    });
                                    setIsEditModalOpen(true);
                                }}
                            />
                        </Tooltip>

                        {/* 🗑️ XÓA */}
                        <Tooltip
                            title={
                                isUsed
                                    ? "Khuyến mãi đã được sử dụng, không thể xóa"
                                    : "Xóa khuyến mãi"
                            }
                        >
                            <Button
                                size="small"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={isUsed}
                                onClick={() => {
                                    setSelectedPromotion(r);
                                    setIsDeleteModalOpen(true);
                                }}
                            />
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    const renderChangeStatusModal = () => {
        return (
            <Modal
                title="Xác nhận thay đổi trạng thái"
                open={isStatusModalOpen}
                onOk={handleToggleStatus}
                onCancel={() => setIsStatusModalOpen(false)}
                okText="Xác nhận"
            >
                Bạn có chắc muốn{" "}
                <b>
                    {selectedPromotion?.status === "active"
                        ? "NGƯNG"
                        : "KÍCH HOẠT"}
                </b>{" "}
                khuyến mãi <b>{selectedPromotion?.code}</b> không?
            </Modal>

        );
    };

    const renderDeleteModalPromotion = () => {
        return (
            <Modal
                title="Xác nhận xóa khuyến mãi"
                open={isDeleteModalOpen}
                onOk={handleDeletePromotion}
                confirmLoading={deleteLoading}
                onCancel={() => setIsDeleteModalOpen(false)}
                okText="Xóa"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Bạn có chắc muốn <b>xóa khuyến mãi</b>{" "}
                    <b>{selectedPromotion?.code}</b> không?
                </p>

                <p className="text-gray-500 mt-2">
                    Chỉ có thể xóa khuyến mãi chưa từng được sử dụng.
                </p>
            </Modal>


        );
    };

    const renderAddModalPromotion = () => {
        return (
            <Modal
                title="Tạo khuyến mãi mới"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createLoading}
                okText="Tạo khuyến mãi"
                width={720}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreatePromotion}
                    initialValues={{ discount_type: "percent" }}
                >
                    {/* ================= THÔNG TIN CƠ BẢN ================= */}
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Form.Item
                        label="Mã khuyến mãi"
                        name="code"
                        extra="Mã duy nhất, thường viết IN HOA – ví dụ: SALE10P"
                        rules={[{ required: true, message: "Nhập mã khuyến mãi" }]}
                    >
                        <Input placeholder="SALE10P" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        extra="Mô tả ngắn giúp admin dễ quản lý (không hiển thị cho user)"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    {/* ================= GIẢM GIÁ ================= */}
                    <Divider orientation="left">Cấu hình giảm giá</Divider>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Loại giảm"
                            name="discount_type"
                            extra="Chọn giảm theo % hoặc số tiền cố định"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Select.Option value="percent">Phần trăm (%)</Select.Option>
                                <Select.Option value="fixed">Cố định (VNĐ)</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Giá trị giảm"
                            name="value"
                            extra="VD: 10 (%) hoặc 50.000 (VNĐ)"
                            rules={[{ required: true }]}
                        >
                            <InputNumber
                                min={1}
                                max={discountType === "percent" ? 99 : undefined} // giới hạn 100% nếu là %
                                style={{ width: "100%" }}
                                formatter={(value) => {
                                    if (!value) return "";
                                    return discountType === "percent"
                                        ? `${value} %`
                                        : formatPrice(value);
                                }}
                                parser={(value) => value.replace(/\D/g, "")} // loại bỏ ký tự không phải số
                            />
                        </Form.Item>


                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Giảm tối đa"
                            name="max_discount"
                            extra={
                                discountType === "percent"
                                    ? "Áp dụng cho giảm theo %"
                                    : "Không áp dụng cho giảm cố định"
                            }
                        >
                            <InputNumber
                                className="w-full"
                                min={0}
                                formatter={value => value ? formatPrice(value) : ""}
                                parser={value => value.replace(/₫|\./g, '')} // convert về số
                                disabled={discountType !== "percent"}
                                placeholder={
                                    discountType !== "percent"
                                        ? "Chỉ dùng cho giảm theo %"
                                        : undefined
                                }
                            />
                        </Form.Item>


                        <Form.Item
                            label="Đơn hàng tối thiểu"
                            name="min_order_value"
                            extra="Đơn hàng phải đạt giá trị này mới áp dụng mã"
                            rules={[{ required: true }]}
                        >
                            <InputNumber
                                min={0}
                                formatter={value => value ? formatPrice(value) : ""}
                                parser={value => value.replace(/₫|\./g, '')} // convert về số
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </div>

                    {/* ================= THỜI GIAN & GIỚI HẠN ================= */}
                    <Divider orientation="left">Thời gian & giới hạn</Divider>

                    <Form.Item
                        label="Thời gian áp dụng"
                        name="time"
                        extra="Mã chỉ có hiệu lực trong khoảng thời gian này"
                        rules={[{ required: true }]}
                    >
                        <DatePicker.RangePicker
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Lượt dùng / user"
                        name="usage_per_user"
                        extra="Giới hạn số lần mỗi user được sử dụng mã"
                    >
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>
                </Form>
            </Modal>


        );
    };

    const renderEditModalPromotion = () => {
        if (!selectedPromotion) return null;

        const isPercent = selectedPromotion.discount_type === "percent";

        return (
            <Modal
                title="Cập nhật khuyến mãi"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => editForm.submit()}
                confirmLoading={editLoading}
                okText="Cập nhật"
                width={720}
                centered
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdatePromotion}
                >
                    {/* ================= THÔNG TIN CƠ BẢN ================= */}
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Form.Item
                        label="Mã khuyến mãi"
                        name="code"
                    >
                        <Input readOnly className="bg-gray-50" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    {/* ================= CẤU HÌNH GIẢM GIÁ (READONLY) ================= */}
                    <Divider orientation="left">Cấu hình giảm giá</Divider>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Loại giảm">
                            <Input
                                readOnly
                                className="bg-gray-50"
                                value={isPercent ? "Phần trăm (%)" : "Cố định (VNĐ)"}
                            />
                        </Form.Item>

                        <Form.Item label="Giá trị giảm">
                            <Input
                                readOnly
                                className="bg-gray-50"
                                value={
                                    isPercent
                                        ? `${selectedPromotion.value}%`
                                        : `${Number(selectedPromotion.value).toLocaleString()}đ`
                                }
                            />
                        </Form.Item>

                        <Form.Item label="Giảm tối đa">
                            <Input
                                readOnly
                                className="bg-gray-50"
                                value={
                                    selectedPromotion.max_discount
                                        ? `${Number(selectedPromotion.max_discount).toLocaleString()}đ`
                                        : "—"
                                }
                            />
                        </Form.Item>

                        <Form.Item label="Đơn hàng tối thiểu">
                            <Input
                                readOnly
                                className="bg-gray-50"
                                value={`${Number(selectedPromotion.min_order_value).toLocaleString()}đ`}
                            />
                        </Form.Item>
                    </div>

                    {/* ================= THỜI GIAN & GIỚI HẠN ================= */}
                    <Divider orientation="left">Thời gian & giới hạn</Divider>

                    <Form.Item
                        label="Thời gian áp dụng"
                        name="time"
                        rules={[{ required: true }]}
                    >
                        <DatePicker.RangePicker
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Lượt dùng / user"
                        name="usage_per_user"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} max={30} className="w-full" />
                    </Form.Item>

                    {/* ================= NOTICE ================= */}
                    <Divider />

                    <Tag color="blue">
                        Các thông tin về loại giảm và giá trị không thể chỉnh sửa sau khi tạo
                    </Tag>
                </Form>
            </Modal>
        );
    };


    /* ===== RENDER ===== */
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <Header
                itemName="khuyến mãi"
                searchText={searchText}
                setSearchText={setSearchText}

                showCategoryFilter={false}
                showAddButton={true}
                showReload={true}

                onAddItem={() => setIsCreateModalOpen(true)}
                onReload={fetchPromotions}
                reloading={loading}
            />
            <DataTable
                columns={promotionColumns}
                dataSource={filteredPromotions}
                loading={loading}
                totalText="khuyến mãi"
            />
            {renderAddModalPromotion()}
            {renderEditModalPromotion()}
            {renderDeleteModalPromotion()}
            {renderChangeStatusModal()}

        </div>
    );
};

export default PromotionManager;
