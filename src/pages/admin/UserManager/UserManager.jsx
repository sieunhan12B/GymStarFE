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

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== FILTERING =====
  const filteredData = data.filter(item => {
    if (!searchText) return true;

    return (
      removeVietnameseTones(item.full_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchText.toLowerCase())
    );
  });



  // ===== HÀM MỞ MODAL EDIT ROLE =====
  const openRoleModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      role_id: user.role_id, // role hiện tại
    });
    setIsRoleModalOpen(true);
  };

  // ===== HÀM MỞ MODAL THAY ĐỔI TRẠNG THÁI NGƯỜI DÙNG =====
  const openChangeStatusModal = (record) => {
    setSelectedUser(record);
    setIsStatusModalOpen(true);
  };



  // ===== XỬ LÝ THAY ĐỔI ROLE =====
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

  // ===== XỬ LÝ THAY ĐỔI TRẠNG THÁI NGƯỜI DÙNG =====
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



  // ===== PRODUCT COLUMNS =====
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
      title: 'Phân quyền',
      dataIndex: 'role_name',
      key: 'role_name',
      width: 200,

      filters: [
        { text: 'Quản trị viên', value: 'quản trị viên' },
        { text: 'Khách hàng', value: 'khách hàng' },
        { text: 'Quản lý sản phẩm', value: 'quản lý sản phẩm' },
        { text: 'Quản lý đơn hàng', value: 'quản lý đơn hàng' },
        { text: 'Quản lý phản hồi', value: 'quản lý phản hồi' },
      ],

      onFilter: (value, record) =>
        record.role_name?.trim().toLowerCase() === value.toLowerCase(),

      render: (_, record) => {
        const { role_id, role_name } = record;

        const colorMap = {
          1: 'green',
          2: 'gold',
          3: 'purple',
          4: 'blue',
          5: 'cyan',
        };

        return (
          <div className="flex items-center justify-between w-full">
            {/* Tag phân quyền */}
            <Tag color={colorMap[role_id]} className="rounded-full px-3 py-1">
              {role_name}
            </Tag>

            {/* Icon chỉnh sửa */}
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openRoleModal(record)}
            />
          </div>
        );
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,

      filters: [
        { text: 'Đang hoạt động', value: 'đang hoạt động' },
        { text: 'Bị cấm', value: 'bị cấm' },
        { text: 'Chưa xác nhận', value: 'chưa xác nhận' },
      ],

      onFilter: (value, record) => {
        const normalized = record.status?.trim().normalize("NFC").toLowerCase();
        return normalized === value.toLowerCase();
      },

      render: (statusRaw, record) => {
        const status = statusRaw?.trim().normalize("NFC").toLowerCase();

        const colorMap = {
          "đang hoạt động": "green",
          "bị cấm": "red",
          "chưa xác nhận": "orange",
        };

        const color = colorMap[status] || "default";

        return (
          <div className="flex justify-between items-center w-full">
            {/* TAG trạng thái */}
            <Tag color={color} className="rounded-full">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>

            {/* Button bên phải */}
            {status !== 'chưa xác nhận' && (
              <Button
                type="text"
                icon={
                  status === 'đang hoạt động'
                    ? <LockOutlined />
                    : <UnlockOutlined />
                }
                onClick={() => openChangeStatusModal(record)}
              />
            )}
          </div>
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

  // ===== RENDER EDIT ROLE MODALS =====
  const renderEditRoleModal = () => (
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
  const renderEditStatusModal = () => {
    const currentStatus = selectedUser?.status
      ?.trim()
      ?.normalize("NFC")
      ?.toLowerCase();

    // Xác định hành động dựa trên trạng thái hiện tại
    const actionText =
      currentStatus === "đang hoạt động"
        ? "Vô hiệu hóa"
        : "Kích hoạt";

    return (
      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        onOk={handleChangeStatusUser}
        centered

        okText="Xác nhận"
        cancelText="Hủy"

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
          Bạn có chắc muốn
          <span className="text-red-800 font-bold"> {actionText} </span>
          người dùng:
          <b> {selectedUser?.full_name}</b> không?
        </p>
      </Modal>
    );
  };


  return (
    <div className="bg-white rounded-lg shadow-sm">
      {renderHeader()}
      {renderTable()}
      {renderEditRoleModal()}
      {renderEditStatusModal()}
    </div>
  );

}


export default UserManager;