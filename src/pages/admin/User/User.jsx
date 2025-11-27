import { Form, Radio, DatePicker, Select } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { userService } from '@/services/user.service';
import dayjs from 'dayjs';
import { useState, useEffect, useContext } from "react";
import { NotificationContext } from "@/App";
import { Button, Space, Modal, Input, Tag } from 'antd';
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import Header from "../../../templates/AdminTemplate/Header";




const User = () => {
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
    if (!searchText) return true; // nếu searchText rỗng thì hiển thị tất cả
    const fullName = removeVietnameseTones(item.full_name || '').toLowerCase();
    return fullName.includes(searchText.toLowerCase());
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== HÀM MỞ MODAL EDIT =====
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      full_name: user.full_name,
      gender: user.gender,
      birth_date: user.birth_date ? dayjs(user.birth_date, "DD-MM-YYYY") : null,

    });
    setIsModalOpen(true);
  };



  // ===== HÀM LƯU THAY ĐỔI =====
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        ...values,
        birth_date: values.birth_date ? values.birth_date.format("DD-MM-YYYY") : null
      };
      const res= await userService.updateInfo(editingUser.user_id, updatedData);
      showNotification(res.data.message, 'success');
      setIsModalOpen(false);
      fetchUsers(); // tải lại danh sách
    } catch (error) {
      console.log(error)
      showNotification('Cập nhật người dùng thất bại!', 'error');
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
      showNotification("Cập nhật trạng thái thất bại!", "error");
    }
  };



  // ===== TABLE COLUMNS =====
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.full_name}</span>
          <span className="text-gray-400 text-sm">{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Birthday',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (date) => date ? date : "——",
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'nam' ? 'blue' : gender === 'nữ' ? 'pink' : undefined}>
          {gender === 'nam' ? 'Nam' : gender === 'nữ' ? 'Nữ' : '——'}
        </Tag>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Customer', value: 'customer' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Tag
          color={role === 'admin' ? 'gold' : 'green'}
          className="rounded-full"
        >
          {/* {role.toUpperCase()} */}
          admin
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Disable', value: 'disabled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color = status === 'active' ? 'green' : 'red';
        return (
          <Tag
            color={color}
            className="rounded-full"
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) =>
        dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
          ? dayjs(date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
          : "—",
    },

    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => openDisableModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Header searchText={searchText} setSearchText={setSearchText} itemName="người dùng" categoryFilterOn={false} />
      <DataTable columns={userColumns} dataSource={filteredData} totalText="người dùng" loading={loading} />

      {/* ===== MODAL EDIT ===== */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="nam">Nam</Radio>
              <Radio value="nữ" >Nữ </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="birth_date" label="Ngày sinh">
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>


        </Form>
      </Modal>


      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        onOk={handleDisableUser}
      >
        <p>
          Bạn có chắc muốn {selectedUser?.status === "active" ? "vô hiệu hoá" : "kích hoạt"} người dùng:
          <b> {selectedUser?.full_name}</b> không?
        </p>
      </Modal>

    </div>
  )
}


export default User;