// React
import { useState, useEffect, useContext, useMemo } from "react";

// UI
import { Form, Select, Button, Modal, Tag, Tooltip } from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";

// Redux
import { useSelector } from "react-redux";

// Utils
import dayjs from "dayjs";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";
import { normalizeText } from "@/utils/normalizeText";

// Constants
import { ROLE_COLOR_MAP, STATUS_COLOR_MAP, STATUS_FILTERS, BIRTHDAY_FILTERS, GENDER_FILTERS } from "../../../constants/userManager";

// Services
import { userService } from "@/services/user.service";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";

// Context
import { NotificationContext } from "@/App";
import { roleService } from "../../../services/role.service";



/* ================= COMPONENT ================= */
const UserManager = () => {
  /* ===== STATE ===== */
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);

  const { showNotification } = useContext(NotificationContext);
  const currentUser = useSelector((state) => state.userSlice.user);
  const [form] = Form.useForm();

  /* ===== FETCH USERS ===== */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data.data);
    } catch {
      showNotification("Tải danh sách người dùng thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ===== FETCH ROLES ===== */
  const fetchRoles = async () => {
    try {
      const res = await roleService.getAll();
      setRoles(res.data.data);
    } catch {
      showNotification("Tải danh sách role thất bại!", "error");
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchRoles();

  }, []);

  /* ===== FILTER USERS ===== */
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;

    const keyword = removeVietnameseTones(normalizeText(searchText));
    return users.filter(
      (u) =>
        removeVietnameseTones(u.full_name || "")
          .toLowerCase()
          .includes(keyword) ||
        (u.email || "").toLowerCase().includes(keyword)
    );
  }, [users, searchText]);

  const roleFilters = useMemo(() => {
    return roles
      // nếu có status thì chỉ lấy role hoạt động
      .filter((r) => r.status !== "inactive")
      .map((r) => ({
        text: r.role_name,
        value: normalizeText(r.role_name),
      }));
  }, [roles]);


  /* ===== HANDLERS ===== */
  const openRoleModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({ role_id: user.role_id });
    setIsRoleModalOpen(true);
  };

  const handleChangeRole = async () => {
    try {
      const { role_id } = await form.validateFields();
      const res = await userService.updateUserRole(editingUser.user_id, { role_id });
      showNotification(res.data.message, "success");
      fetchUsers();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Không thể thay đổi phân quyền!",
        "error"
      );
    } finally {
      setIsRoleModalOpen(false);
    }
  };

  const handleChangeStatusUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await userService.updateUserStatus(selectedUser.user_id);
      showNotification(res.data.message, "success");
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data?.message, "error");
    } finally {
      setIsStatusModalOpen(false);
    }
  };

  /* ===== TABLE COLUMNS ===== */
  const userColumns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, r) => (
        <div>
          <div className="font-semibold">{r.full_name}</div>
          <div className="text-gray-400 text-sm">{r.email}</div>
        </div>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birth_date",
      filters: BIRTHDAY_FILTERS,
      onFilter: (value, record) => {
        if (value === "has_birthday") {
          return !!record.birth_date;
        }
        if (value === "no_birthday") {
          return !record.birth_date;
        }
        return true;
      },

      render: (date) => date || "—",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      filters: GENDER_FILTERS,
      onFilter: (value, record) => {
        if (value === "null") {
          return !record.gender;
        }
        return normalizeText(record.gender) === value;
      },

      render: (genderRaw) => {
        const gender = normalizeText(genderRaw);

        const colorMap = {
          nam: "blue",
          nữ: "pink",
          null: "default",
        };

        return (
          <Tag color={colorMap[gender || "null"]}>
            {gender === "nam"
              ? "Nam"
              : gender === "nữ"
                ? "Nữ"
                : "—"}
          </Tag>
        );
      },
    },
    {
      title: "Phân quyền",
      dataIndex: "role_name",
      filters: roleFilters,
      onFilter: (value, record) =>
        normalizeText(record.role_name) === value,

      render: (_, r) => (
        <div className="flex justify-between items-center">
          <Tag
            color={ROLE_COLOR_MAP[r.role_id]}
            className="rounded-full px-3"
          >
            {r.role_name}
          </Tag>

          <Button
            type="text"
            icon={<EditOutlined />}
            disabled={r.user_id === currentUser.user_id}
            onClick={() => openRoleModal(r)}
          />
        </div>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      filters: STATUS_FILTERS,
      onFilter: (value, record) =>
        normalizeText(record.status) === value,

      render: (_, r) => {
        const statusKey = normalizeText(r.status);

        return (
          <div className="flex justify-between items-center">
            <Tag
              color={STATUS_COLOR_MAP[statusKey]}
              className="rounded-full"
            >
              {r.status}
            </Tag>

            {statusKey !== "chưa xác nhận" && (
              <Tooltip title="Thay đổi phân quyền">
                <Button
                  type="text"
                  icon={
                    statusKey === "đang hoạt động"
                      ? <LockOutlined className="text-red-500" />
                      : <UnlockOutlined className="text-green-500" />
                  }
                  disabled={r.user_id === currentUser.user_id}
                  onClick={() => {
                    setSelectedUser(r);
                    setIsStatusModalOpen(true);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Được tạo",
      dataIndex: "createdAt",
      render: (v) =>
        dayjs(v, "HH:mm:ss DD/MM/YYYY").isValid()
          ? dayjs(v, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
          : "—",
    },
  ];

  /* ===== RENDER ===== */
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Header
        searchText={searchText}
        setSearchText={setSearchText}
        itemName="người dùng"
        categoryFilterOn={false}
        addItemOn={false}
      />

      <DataTable
        columns={userColumns}
        dataSource={filteredUsers}
        loading={loading}
        totalText="người dùng"
      />

      {/* ROLE MODAL */}
      <Modal
        title="Thay đổi phân quyền"
        open={isRoleModalOpen}
        onOk={handleChangeRole}
        onCancel={() => setIsRoleModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role_id"
            label="Phân quyền"
            rules={[{ required: true }]}
          >
            <Select>
              {roles
                // nếu backend có status thì lọc role đang hoạt động
                .filter((r) => r.status !== "inactive")
                .map((r) => (
                  <Select.Option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </Select.Option>
                ))}
            </Select>

          </Form.Item>
        </Form>
      </Modal>

      {/* STATUS MODAL */}
      <Modal
        title="Xác nhận khoá tài khoản"
        open={isStatusModalOpen}
        onOk={handleChangeStatusUser}
        onCancel={() => setIsStatusModalOpen(false)}
      >
        <p>
          Bạn có chắc chắn muốn khoá tài khoản của{" "}
          <b>{selectedUser?.full_name}</b> không?
        </p>
        <p className="text-red-500 text-sm mt-2">
          Hành động này sẽ vô hiệu hoá quyền đăng nhập của người dùng.
        </p>

      </Modal>
    </div>
  );
};

export default UserManager;
