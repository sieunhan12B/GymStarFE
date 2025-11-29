import { Form, Radio, DatePicker, Select } from "antd";
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { userService } from '@/services/user.service';
import dayjs from 'dayjs';
import { useState, useEffect, useContext } from "react";
import { NotificationContext } from "@/App";
import { Button, Space, Modal, Input, Tag } from 'antd';
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import Header from "../../../templates/AdminTemplate/Header";




const UserManager = () => {
  // ===== STATE =====
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // user đang sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showNotification } = useContext(NotificationContext);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const [form] = Form.useForm();

  // ===== LẤY DANH SÁCH NGƯỜI DÙNG =====
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      setData(response.data.data);
      showNotification(response.data.message, "success");
    } catch (error) {
      showNotification('Tải danh sách người dùng thất bại!', "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTERING =====
  const filteredData = data.filter(item => {
    if (!searchText) return true;

    const text = searchText.toLowerCase();

    const fullName = removeVietnameseTones(item.full_name || '').toLowerCase();
    const email = (item.email || '').toLowerCase();

    return (
      fullName.includes(text) ||
      email.includes(text)
    );
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== HÀM MỞ MODAL EDIT =====
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      role_id: user.role_id, // role hiện tại
    });
    setIsModalOpen(true);
  };


  // ===== HÀM LƯU THAY ĐỔI =====
  const handleSaveRole = async () => {
    try {
      const values = await form.validateFields();
      const res = await userService.updateRole(editingUser.user_id, {
        role_id: values.role_id
      });
      showNotification(res.data.message, "success");
      setIsModalOpen(false);
      fetchUsers(); // tải lại danh sách
    } catch (error) {
      console.log(error);
      showNotification('Cập nhật phân quyền thất bại!', 'error');
    }
  };


  const openDisableModal = (record) => {
    setSelectedUser(record);
    setOpenModal(true);
  };


  // ===== HÀM CHUYỂN TRẠNG THÁI NGƯỜI DÙNG =====
  const handleDisableUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await userService.updateStatus(selectedUser.user_id);
      showNotification(res.data.message, "success");
      setOpenModal(false);
      fetchUsers();
    } catch (error) {
      console.log(error)
      showNotification(error.response.data.message, "error");
    } finally {
      setOpenModal(false);
    }
  };



  // ===== TABLE COLUMNS =====
  const userColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold">{record.full_name}</span>
          <span className="text-gray-400 text-sm">{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (date) => date ? date : "——",
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'nam' ? 'blue' : gender === 'nữ' ? 'pink' : undefined}>
          {gender === 'nam' ? 'Nam' : gender === 'nữ' ? 'Nữ' : '——'}
        </Tag>
      ),
    },
    {
      title: 'Phân quyền',
      dataIndex: 'role_name',
      key: 'role_name',
      width: 150,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Order Manager', value: 'order_manager' },
        { text: 'Customer', value: 'customer' },
        { text: 'Product Manager', value: 'product_manager' },
        { text: 'Feedback Manager', value: 'feedback_manager' },
      ],
      onFilter: (value, record) => record.role_name === value,
      render: (role_name) => {
        let color = 'default';

        if (role_name === 'admin') color = 'gold';
        else if (role_name === 'order_manager') color = 'blue';
        else if (role_name === 'customer') color = 'green';
        else if (role_name === 'product_manager') color = 'purple';
        else if (role_name === 'feedback_manager') color = 'cyan';

        return (
          <Tag color={color} className="rounded-full px-3 py-1">
            {role_name.toUpperCase()}
          </Tag>
        );
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Disable', value: 'disabled' },
        { text: 'Unverified', value: 'unverified' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color;
        if (status === 'active') color = 'green';
        else if (status === 'disabled') color = 'red';
        else if (status === 'unverified') color = 'orange';
        else color = 'default';

        return (
          <Tag color={color} className="rounded-full">
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Được tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) =>
        dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
          ? dayjs(date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
          : "—",
    },

    {
      title: 'Hành động',
      key: 'action',

      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="default"
            danger={record.status === 'active'}
            icon={
              record.status === 'active'
                ? <LockOutlined />
                : <UnlockOutlined />
            }
            // size="small"
            onClick={() => openDisableModal(record)}
          />
        </Space>
      ),
    }

  ];

  // ===== RENDER HEADRE =====
  const renderHeader = () => (
    <Header
      searchText={searchText}
      setSearchText={setSearchText}
      itemName="người dùng"
      categoryFilterOn={false}
      addItemOn={false}
    />
  );


  // ===== RENDER TABLE =====
  const renderTable = () => (
    <DataTable
      columns={userColumns}
      dataSource={filteredData}
      totalText="người dùng"
      loading={loading}
    />
  );


  // ===== RENDER MODALS =====
  const renderEditModal = () => (
    <Modal
      title="Thay đổi phân quyền người dùng"
      open={isModalOpen}
      onOk={handleSaveRole}
      onCancel={() => setIsModalOpen(false)}
      okText="Lưu"
      cancelText="Hủy"
      centered
    >
      <Form form={form} layout="vertical">
        <div className="mb-3">
          <span className="font-semibold">{editingUser?.full_name}</span>
          <div className="text-gray-500 text-sm">{editingUser?.email}</div>
        </div>

        <Form.Item
          name="role_id"
          label="Chọn phân quyền"
          rules={[{ required: true, message: 'Vui lòng chọn phân quyền!' }]}
        >
          <Select placeholder="Chọn phân quyền">
            <Select.Option value="2">Admin</Select.Option>
            <Select.Option value="4">Order Manager</Select.Option>
            <Select.Option value="1">Customer</Select.Option>
            <Select.Option value="3">Product Manager</Select.Option>
            <Select.Option value="5">Feedback Manager</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );


  // ===== RENDER MODAL CHANGE STATUS =====
  const renderStatusModal = () => (
    <Modal
      title="Xác nhận thay đổi trạng thái"
      open={openModal}
      onCancel={() => setOpenModal(false)}

      okText="Xác nhận"
      cancelText="Hủy"

      onOk={handleDisableUser}
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
        Bạn có chắc muốn {selectedUser?.status === "active" ? <span className="text-red-800 font-bold"> vô hiệu hoá</span> : <span className="text-red-800 font-bold"> kích hoạt </span>} người dùng:
        <b> {selectedUser?.full_name}</b> không?
      </p>
    </Modal>
  );


  return (
    <div className="bg-white rounded-lg shadow-sm">
      {renderHeader()}
      {renderTable()}
      {renderEditModal()}
      {renderStatusModal()}
    </div>
  );

}


export default UserManager;