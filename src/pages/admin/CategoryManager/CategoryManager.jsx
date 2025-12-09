import React, { useContext, useEffect, useState } from 'react';
import { Button, Space, Modal, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { danhMucService } from '@/services/category.service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { NotificationContext } from "@/App";
import Header from '@/templates/AdminTemplate/Header';

dayjs.extend(customParseFormat);

const CategoryManager = () => {
    const [loading, setLoading] = useState(true);
    const { showNotification } = useContext(NotificationContext);

    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);


    const [editingCategory, setEditingCategory] = useState(null); // null: thêm mới

    const [formData, setFormData] = useState({
        name: "",
        level1: null,
        level2: null,
    });

 

    const getLevel1 = categories => categories;

    const getLevel2 = (categories, parentId) => {
        if (!parentId) return [];
        const parent = categories.find(c => c.category_id === parentId);
        return parent?.children || [];
    };




    // Lấy danh mục từ API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await danhMucService.getAll();
            const data = res?.data?.data || [];
            console.log(data);

            //  const formatted = normalizeCategories(data);
            // setCategories(formatted);

            setCategories(data);
            showNotification(res.data.message, "success");
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
                        onClick={() => openDeleteModal(record)}
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                    />

                </Space>
            ),
        },
    ];





    // ===== HÀM MỞ MODAL THÊM DANH MỤC =====
    const openAddModal = () => {
        setEditingCategory(null);

        setFormData({
            name: "",
            level1: null,
            level2: null,
        });
        setIsModalOpen(true);
    };

    // ===== HÀM MỞ MODAL SỬA DANH MỤC =====
    const openEditModal = (category) => {
        console.log(category)
        setEditingCategory(category);

        let level1 = null, level2 = null, level3 = null;

        if (!category.parent_id) {
            level1 = category.category_id;
        } else {
            categories.forEach(l1 => {
                l1.children.forEach(l2 => {
                    l2.children.forEach(l3Item => {
                        if (l3Item.category_id === category.category_id) {
                            level1 = l1.category_id;
                            level2 = l2.category_id;
                            level3 = l3Item.category_id;
                        }
                    });

                    if (l2.category_id === category.category_id) {
                        level1 = l1.category_id;
                        level2 = l2.category_id;
                    }
                });

                if (l1.category_id === category.category_id) {
                    level1 = l1.category_id;
                }
            });
        }

        setFormData({
            name: category.name,
            level1,
            level2,
        });

        setIsModalOpen(true);
    };

    // ===== HÀM MỞ MODAL XÁC NHẬN XÓA DANH MỤC =====
    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };




    // ===== XỬ LÝ THÊM/SỬA DANH MỤC =====
    const handleSubmitModal = async () => {
        setModalLoading(true);
        console.log(formData)

        const parent_id = formData.level3 || formData.level2 || formData.level1 || null;

        try {
            if (editingCategory) {
                const res = await danhMucService.update(editingCategory.category_id, {
                    name: formData.name,
                    parent_id
                });


                console.log(res);
                showNotification(res.data.message || "Cập nhật danh mục thành công!", "success");
            } else {
                const res = await danhMucService.add({
                    name: formData.name,
                    parent_id
                });

                showNotification(res.data.message || "Thêm danh mục thành công!", "success");
            }

            fetchCategories();
            setIsModalOpen(false);
        } catch (err) {
            console.log(err);
            showNotification(err.response.data.message || "Lỗi thao tác danh mục!", "error");
        }

        setModalLoading(false);
    };

    // ========== XỬ LÝ XOÁ DANH MỤC ==========
    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            setLoading(true);
            const res = await danhMucService.delete(selectedCategory.category_id);
            showNotification(res.data.message, "success");
            fetchCategories();
        } catch (error) {
            console.log(error)
            showNotification(error.response?.data?.message || "Không thể xóa danh mục!", "error");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };




     // ========== MODAL XOÁ DANH MỤC ==========
    const renderDeleteModal = () => (
        <Modal
            title="Xác nhận xoá danh mục"
            open={isDeleteModalOpen}
            onOk={handleDeleteCategory}
            onCancel={() => setIsDeleteModalOpen(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            centered
            okButtonProps={{
                className:
                    "bg-black text-white hover:!bg-white rounded-lg px-5 py-2 font-medium hover:!text-black border-black border-2"
            }}
            cancelButtonProps={{
                className:
                    "bg-white text-black hover:!bg-black rounded-lg px-5 py-2 font-medium hover:!text-white border-black border-2"
            }}
        >
            <p>
                Bạn có chắc muốn xoá danh mục:
                <b> {selectedCategory?.name}</b> không?
            </p>
        </Modal>
    );

    // ========== MODAL THÊM/SỬA DANH MỤC ==========
    const renderAddEditModal = () => (
        <Modal
            title={<span className="text-gray-900 font-semibold text-lg">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</span>}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={[
                <Button
                    key="cancel"
                    onClick={() => setIsModalOpen(false)}
                    className="font-semibold bg-white border-black border-2 hover:bg-black hover:text-white"
                >
                    Hủy
                </Button>,

                <Button
                    key="submit"
                    onClick={handleSubmitModal}
                    loading={modalLoading}
                    className="font-semibold bg-black text-white border border-black rounded-lg px-5 py-2 
               hover:bg-white hover:text-black hover:border-black"
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
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-md border-2 border-black"
                    />
                </div>

                {/* Select cấp 1 */}
                <div className='space-x-5'>

                    <Select
                        placeholder="Danh mục cấp 1"
                        value={formData.level1}
                        onChange={(val) =>
                            setFormData({ ...formData, level1: val, level2: null, level3: null })
                        }
                        options={getLevel1(categories).map(c => ({ label: c.name, value: c.category_id }))}
                        allowClear
                    />

                    <Select
                        placeholder="Danh mục cấp 2"
                        value={formData.level2}
                        onChange={(val) =>
                            setFormData({ ...formData, level2: val, level3: null })
                        }
                        disabled={!formData.level1}
                        options={getLevel2(categories, formData.level1).map(c => ({ label: c.name, value: c.category_id }))}
                        allowClear
                    />

                  

                </div>


            </div>
        </Modal>
    );

    // ========== RENDER TABLE ==========
    const renderTable = () => (
        <DataTable
            columns={categoryColumns}
            dataSource={categories}
            totalText="danh mục"
            loading={loading}
            rowKey={"category_id"}
        />
    );

    // ========== RENDER HEADER ==========
    const renderHeader = () => (
        <Header
            filterOn={false}
            itemName={"danh mục"}
            // onAdd={openAddModal} //?openAddModal
            onAddItem={openAddModal}
        />
    );




    return (
        <div className="bg-white rounded-lg shadow-sm">
            {renderHeader()}
            {renderTable()}
            {renderAddEditModal()}
            {renderDeleteModal()}
        </div>
    );
};

export default CategoryManager;
