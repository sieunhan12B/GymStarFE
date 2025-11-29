import React, { useContext, useEffect, useState } from 'react';
import { Button, Space, Modal, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { danhMucService } from '@/services/category.service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { NotificationContext } from "@/App";
import Header from '../../../templates/AdminTemplate/Header';

dayjs.extend(customParseFormat);

const CategoryManager = () => {
    const [loading, setLoading] = useState(true);
    const { showNotification } = useContext(NotificationContext);

    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null); // null: thêm mới
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        parent_id: null,
        secondary_id: null,
    });

    const [secondaryOptions, setSecondaryOptions] = useState([]);
    const [secondaryDisabled, setSecondaryDisabled] = useState(true);

    // Chuẩn hoá dữ liệu cây cho DataTable
    const normalizeCategories = (nodes) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            return {
                key: node.category_id,
                id: node.category_id,
                name: node.name,
                parent_id: node.parent_id || null,
                secondary_id: node.secondary_id || null,
                createdAt: node.createdAt || null,
                ...(hasChildren && { children: normalizeCategories(node.children) })
            };
        });
    };

    // Lấy danh mục từ API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await danhMucService.getAll();
            const data = res?.data?.data || [];
            const formatted = normalizeCategories(data);
            setCategories(formatted);
        } catch (error) {
            showNotification('Không thể tải danh mục!', "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        document.title = "Quản lý danh mục sản phẩm - GymStar Admin";
    }, []);

    // ========== XỬ LÝ MODAL THÊM/SỬA ==========

    const openAddModal = () => {
        setEditingCategory(null);
        setCategoryForm({ name: "", parent_id: null, secondary_id: null });
        setSecondaryOptions([]);
        setSecondaryDisabled(true);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            parent_id: category.parent_id || null,
            secondary_id: category.secondary_id || null,
        });

        if (category.parent_id === 23 || category.parent_id === 24) {
            const topCategory = categories.find(c => c.id === category.parent_id);
            setSecondaryOptions(topCategory.children?.map(c => ({
                label: c.name,
                value: c.id
            })) || []);
            setSecondaryDisabled(false);
        } else {
            setSecondaryOptions([]);
            setSecondaryDisabled(true);
        }

        setIsModalOpen(true);
    };

    const submitModal = async () => {
        if (!categoryForm.name.trim()) {
            message.error("Tên danh mục không được để trống!");
            showNotification('Tên danh mục không được để trống!', "error");
            return;
        }

        try {
            setModalLoading(true);

            const actualParentId = categoryForm.secondary_id || categoryForm.parent_id || null;
            const payload = {
                name: categoryForm.name,
                parent_id: actualParentId,
            };

            if (editingCategory) {
                // Sửa danh mục
                await danhMucService.update(editingCategory.id, payload);
                showNotification('Cập nhật danh mục thành công!', "success");
            } else {
                // Thêm danh mục mới
                await danhMucService.add(payload);
                showNotification('Thêm danh mục thành công!', "success");
            }

            setIsModalOpen(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            showNotification(error.response?.data?.message || "Có lỗi xảy ra!", "error");
        } finally {
            setModalLoading(false);
        }
    };

    // ========== XỬ LÝ XOÁ DANH MỤC ==========
    const handleDeleteCategory = async (id) => {
        try {
            setLoading(true);
            await danhMucService.delete(id);
            showNotification("Xóa danh mục thành công!", "success");
            fetchCategories();
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || "Không thể xóa danh mục!", "error");
        } finally {
            setLoading(false);
        }
    };

    // ========== DATA TABLE ==========
    const categoryColumns = [
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            render: (text) => <span className="font-medium text-gray-900">{text}</span>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            render: (date) =>
                dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
                    ? dayjs(date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                    : "—",
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        size="small"
                        className="text-blue-500 border-blue-500 hover:bg-blue-50"
                        onClick={() => openEditModal(record)}
                    />
                    <Button
                        onClick={() => handleDeleteCategory(record.id)}
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                    />
                </Space>
            ),
        },
    ];

    // ========== OPTIONS CẤP 1 ==========
    const topLevelOptions = [
        { label: "Không chọn", value: null },
        ...categories.map(cat => ({
            label: cat.name,
            value: cat.id
        }))
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <Header
                filterOn={false}
                onAddItem={openAddModal}
                itemName={"danh mục"}
            />

            {/* MODAL THÊM/SỬA DANH MỤC */}
            <Modal
                title={<span className="text-gray-900 font-semibold text-lg">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setIsModalOpen(false)}
                        className="font-semibold bg-white border-black border-2 hover:!bg-black hover:!text-white hover:!border-transparent"
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={submitModal}
                        loading={modalLoading}
                        className="font-semibold bg-white text-black border-2 border-black hover:!bg-black hover:!text-white hover:!border-transparent"
                    >
                        {editingCategory ? "Cập nhật" : "Thêm"}
                    </Button>,
                ]}
                centered
                className="rounded-xl"
            >
                <div className="flex flex-col gap-6">
                    {/* Tên danh mục */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Tên danh mục</label>
                        <Input
                            placeholder="Nhập tên danh mục..."
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="rounded-md border-2 border-black"
                        />
                    </div>

                    {/* Select cấp 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Chọn danh mục cấp 1</label>
                        <Select
                            placeholder="Chọn danh mục cấp 1"
                            value={categoryForm.parent_id}
                            onChange={(value) => {
                                setCategoryForm({ ...categoryForm, parent_id: value, secondary_id: null });

                                if (value === 23 || value === 24) {
                                    const topCategory = categories.find(c => c.id === value);
                                    setSecondaryOptions(topCategory.children?.map(c => ({
                                        label: c.name,
                                        value: c.id
                                    })) || []);
                                    setSecondaryDisabled(false);
                                } else {
                                    setSecondaryOptions([]);
                                    setSecondaryDisabled(true);
                                }
                            }}
                            allowClear
                            options={topLevelOptions}
                            className="w-full border-2 rounded-md bg-transparent border-black"
                        />
                    </div>

                    {/* Select thứ 2 */}
                    <div>
                        <label className="block text-sm font-medium  text-gray-800 mb-1">Chọn danh mục phụ</label>
                        <Select
                            placeholder="Chọn danh mục phụ"
                            value={categoryForm.secondary_id}
                            onChange={(value) => setCategoryForm({ ...categoryForm, secondary_id: value })}
                            allowClear
                            options={secondaryOptions}
                            disabled={secondaryDisabled}
                            className="w-full border-2 rounded-md"
                        />
                    </div>
                </div>
            </Modal>

            {/* BẢNG DANH MỤC */}
            <DataTable
                columns={categoryColumns}
                dataSource={categories}
                totalText="danh mục"
                loading={loading}
            />
        </div>
    );
};

export default CategoryManager;
