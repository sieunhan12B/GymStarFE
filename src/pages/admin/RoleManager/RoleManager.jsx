// React
import { useEffect, useState, useContext, useMemo } from "react";

// UI
import { Button, Modal, Form, Input, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";

// Services
import { roleService } from "@/services/role.service";

// Context
import { NotificationContext } from "@/App";

// Utils
import { normalizeText } from "@/utils/normalizeText";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";

/* ================= COMPONENT ================= */
const RoleManager = () => {
    /* ===== STATE ===== */
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingRole, setEditingRole] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);

    const { showNotification } = useContext(NotificationContext);
    const [form] = Form.useForm();

    /* ===== FETCH ROLES ===== */
    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await roleService.getAll();
            setRoles(res.data.data);
        } catch {
            showNotification("Tải danh sách role thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    /* ===== FILTER ===== */
    const filteredRoles = useMemo(() => {
        if (!searchText) return roles;

        const keyword = removeVietnameseTones(normalizeText(searchText));
        return roles.filter((r) =>
            removeVietnameseTones(normalizeText(r.role_name)).includes(keyword)
        );
    }, [roles, searchText]);

    /* ===== HANDLERS ===== */
    const openCreateModal = () => {
        setEditingRole(null);
        form.resetFields();
        setIsModalOpen(true);
    };


    const openEditModal = (role) => {
        setEditingRole(role);
        form.setFieldsValue({ role_name: role.role_name });
        setIsModalOpen(true);
    };

    const handleSubmitRole = async () => {
        try {
            const values = await form.validateFields();

            let res;
            if (editingRole) {
                res = await roleService.updateRole(editingRole.role_id, values);
            } else {
                res = await roleService.createRole(values);
            }

            showNotification(res.data.message, "success");
            fetchRoles();
            setIsModalOpen(false);
        } catch (err) {
            showNotification(
                err.response?.data?.message || "Thao tác thất bại!",
                "error"
            );
        }
    };

    const handleDeleteRole = async () => {
        try {
            const res = await roleService.deleteRole(selectedRole.role_id);
            showNotification(res.data.message, "success");
            fetchRoles();
        } catch (err) {
            showNotification(
                err.response?.data?.message || "Xoá role thất bại!",
                "error"
            );
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    /* ===== TABLE COLUMNS ===== */
    const roleColumns = [
        {
            title: "ID",
            dataIndex: "role_id",
            width: 80,
        },
        {
            title: "Tên role",
            dataIndex: "role_name",
            render: (name) => (
                <Tag color="blue" className="rounded-full px-3">
                    {name}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_, r) => (
                <div className="flex gap-2">
                    <Button
                        icon={<EditOutlined />}
                        type="text"
                        onClick={() => openEditModal(r)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        type="text"
                        danger
                        onClick={() => {
                            setSelectedRole(r);
                            setIsDeleteModalOpen(true);
                        }}
                    />
                </div>
            ),
        },
    ];

    /* ===== RENDER ===== */
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <Header
                searchText={searchText}
                setSearchText={setSearchText}
                itemName="role"
                addItemOn
                onAddItem={openCreateModal} // ✅ ĐÚNG PROP
                categoryFilterOn={false}
            />


            <DataTable
                columns={roleColumns}
                dataSource={filteredRoles}
                loading={loading}
                totalText="role"
            />

            {/* CREATE / UPDATE MODAL */}
            <Modal
                title={editingRole ? "Cập nhật role" : "Thêm role"}
                open={isModalOpen}
                onOk={handleSubmitRole}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="role_name"
                        label="Tên role"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên role!" },
                        ]}
                    >
                        <Input placeholder="Nhập tên role" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                title="Xác nhận xoá"
                open={isDeleteModalOpen}
                onOk={handleDeleteRole}
                onCancel={() => setIsDeleteModalOpen(false)}
                okButtonProps={{ danger: true }}
            >
                Bạn có chắc muốn xoá role{" "}
                <b>{selectedRole?.role_name}</b> không?
            </Modal>
        </div>
    );
};

export default RoleManager;
