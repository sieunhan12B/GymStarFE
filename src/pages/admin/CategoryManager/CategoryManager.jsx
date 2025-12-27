// React
import { useContext, useEffect, useState } from "react";

// UI
import { Button, Space, Modal, Input, Select, Form } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";

// Services
import { danhMucService } from "@/services/category.service";

// Utils
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Context
import { NotificationContext } from "@/App";

dayjs.extend(customParseFormat);

/* ================= UTILS ================= */
const findCategoryPath = (categories, categoryId) => {
    for (const l1 of categories) {
        if (l1.category_id === categoryId) {
            return { level1: l1.category_id, level2: null };
        }

        for (const l2 of l1.children || []) {
            if (l2.category_id === categoryId) {
                return { level1: l1.category_id, level2: l2.category_id };
            }

            for (const l3 of l2.children || []) {
                if (l3.category_id === categoryId) {
                    return {
                        level1: l1.category_id,
                        level2: l2.category_id,
                    };
                }
            }
        }
    }

    return { level1: null, level2: null };
};

const getLevel1Options = (categories) =>
    categories.map((c) => ({
        label: c.name,
        value: c.category_id,
    }));

const getLevel2Options = (categories, level1Id) => {
    if (!level1Id) return [];
    const parent = categories.find((c) => c.category_id === level1Id);
    return (
        parent?.children?.map((c) => ({
            label: c.name,
            value: c.category_id,
        })) || []
    );
};

/* ================= COMPONENT ================= */
const CategoryManager = () => {
    const { showNotification } = useContext(NotificationContext);

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [level1Value, setLevel1Value] = useState(null);



    const [form] = Form.useForm();

    /* ===== FETCH ===== */
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await danhMucService.getAll();
            setCategories(res?.data?.data || []);
            showNotification(res.data.message, "success");
        } catch {
            showNotification("Không thể tải danh mục!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        document.title = "Quản lý danh mục sản phẩm - GymStar Admin";
    }, []);

    /* ===== HANDLERS ===== */
    const openAddModal = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsFormModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);

        const { level1, level2 } = findCategoryPath(
            categories,
            category.category_id
        );

        form.setFieldsValue({
            name: category.name,
            level1,
            level2,
        });

        setIsFormModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setModalLoading(true);

            const parent_id = values.level2 || values.level1 || null;

            if (editingCategory) {
                await danhMucService.update(editingCategory.category_id, {
                    name: values.name,
                    parent_id,
                });
                showNotification("Cập nhật danh mục thành công!", "success");
            } else {
                await danhMucService.add({
                    name: values.name,
                    parent_id,
                });
                showNotification("Thêm danh mục thành công!", "success");
            }

            setIsFormModalOpen(false);
            fetchCategories();
        } catch (err) {
            showNotification(
                err.response?.data?.message || "Lỗi thao tác danh mục!",
                "error"
            );
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        try {
            await danhMucService.delete(selectedCategory.category_id);
            showNotification("Xóa danh mục thành công!", "success");
            fetchCategories();
        } catch (err) {
            showNotification(
                err.response?.data?.message || "Không thể xóa danh mục!",
                "error"
            );
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
        }
    };

    /* ===== TABLE ===== */
    const columns = [
        {
            title: "Tên danh mục",
            dataIndex: "name",
            render: (text) => (
                <span className="font-medium text-gray-900">{text}</span>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            align: "center",
            render: (date) =>
                dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
                    ? dayjs(date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                    : "—",
        },
        {
            title: "Thao tác",
            width: 140,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        className="text-blue-500 border-blue-500"
                        onClick={() => openEditModal(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => {
                            setSelectedCategory(record);
                            setIsDeleteModalOpen(true);
                        }}
                    />
                </Space>
            ),
        },
    ];

    /* ===== RENDER ===== */
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <Header
                itemName="danh mục"
                filterOn={false}
                onAddItem={openAddModal}
            />

            <DataTable
                columns={columns}
                dataSource={categories}
                loading={loading}
                rowKey="category_id"
                totalText="danh mục"
            />

            {/* ADD / EDIT MODAL */}
            <Modal
                title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
                open={isFormModalOpen}
                onCancel={() => setIsFormModalOpen(false)}
                footer={null}          // ❗ bỏ footer mặc định
                centered
            >

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={(changedValues, allValues) => {
                        if (changedValues.level1 !== undefined) {
                            setLevel1Value(changedValues.level1);
                            form.setFieldValue("level2", null); // reset level2 khi level1 thay đổi
                        }
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: "Nhập tên danh mục" }]}
                    >
                        <Input placeholder="Nhập tên danh mục..." />
                    </Form.Item>

                    <Form.Item name="level1" label="Danh mục cấp 1">
                        <Select
                            allowClear
                            options={getLevel1Options(categories)}
                            onChange={() => form.setFieldValue("level2", null)}
                        />
                    </Form.Item>

                    <Form.Item name="level2" label="Danh mục cấp 2">
                        <Select
                            allowClear
                            disabled={!level1Value}
                            options={getLevel2Options(categories, level1Value)}
                        />

                    </Form.Item>
                    <Form.Item>
                        <div className="flex justify-end gap-3">
                            <Button onClick={() => setIsFormModalOpen(false)}>
                                Hủy
                            </Button>

                            <Button
                                type="primary"
                                htmlType="submit"     // 🔥 Enter kích hoạt
                                loading={modalLoading}
                            >
                                {editingCategory ? "Cập nhật" : "Thêm"}
                            </Button>
                        </div>
                    </Form.Item>

                </Form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                title="Xác nhận xoá danh mục"
                open={isDeleteModalOpen}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                centered
            >
                Bạn có chắc muốn xoá danh mục:
                <b> {selectedCategory?.name}</b> không?
            </Modal>
        </div>
    );
};

export default CategoryManager;
