import { Form, Select } from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { userService } from '@/services/user.service';
import dayjs from 'dayjs';
import { useState, useEffect, useContext } from "react";
import { NotificationContext } from "@/App";
import { Button, Space, Modal, Input, Tag } from 'antd';
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import Header from "@/templates/AdminTemplate/Header";




const UserManager = () => {
  // ===== STATE =====
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // user đang sửa
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const { showNotification } = useContext(NotificationContext);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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

  // ===== HÀM MỞ MODAL EDIT ROLE =====
  const handleOpenRoleModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      role_id: user.role_id, // role hiện tại
    });
    setIsRoleModalOpen(true);
  };


  // ===== HÀM THAY ĐỔI ROLE =====
  const handleChangeRole = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      const res = await userService.updateRole(editingUser.user_id, {
        role_id: values.role_id
      });
      showNotification(res.data.message, "success");
      setIsRoleModalOpen(false);
      fetchUsers(); // tải lại danh sách
    } catch (error) {
      console.log(error);
      showNotification(error.response?.data?.message || "Không thể xóa danh mục!", "error");
    }
  };

  // ===== HÀM MỞ MODAL THAY ĐỔI TRẠNG THÁI NGƯỜI DÙNG =====
  const handleOpenChangeStatusModal = (record) => {
    setSelectedUser(record);
    setIsStatusModalOpen(true);
  };


  // ===== HÀM CHUYỂN TRẠNG THÁI NGƯỜI DÙNG =====
  const handleChangeStatusUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await userService.updateStatus(selectedUser.user_id);
      showNotification(res.data.message, "success");
      setIsStatusModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.log(error)
      showNotification(error.response.data.message, "error");
    } finally {
      setIsStatusModalOpen(false);
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
            onClick={() => handleOpenRoleModal(record)}
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
            onClick={() => handleOpenChangeStatusModal(record)}
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
      open={isRoleModalOpen}
      onOk={handleChangeRole}
      onCancel={() => setIsRoleModalOpen(false)}
      okText="Lưu"
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
            {[
              { id: 1, name: "Customer" },
              { id: 2, name: "Admin" },
              { id: 3, name: "Product Manager" },
              { id: 4, name: "Order Manager" },
              { id: 5, name: "Feedback Manager" },
            ].map(role => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );


  // ===== RENDER MODAL CHANGE STATUS =====
  const renderStatusModal = () => (
    <Modal
      title="Xác nhận thay đổi trạng thái"
      open={isStatusModalOpen}
      onCancel={() => setIsStatusModalOpen(false)}

      okText="Xác nhận"
      cancelText="Hủy"

      onOk={handleChangeStatusUser}
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