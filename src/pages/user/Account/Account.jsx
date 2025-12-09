import React, { useState, useEffect, useContext } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, message, Spin } from "antd";
import { userService } from "@/services/user.service";
import dayjs from "dayjs";

import { getLocalStorage } from "../../../utils/utils";
import { NotificationContext } from "@/App"; // giả sử bạn có NotificationContext trong App.jsx


const Account = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModal, setIsPasswordModal] = useState(false);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

    const { showNotification } = useContext(NotificationContext);
  

  const authUser = getLocalStorage("user");

  // Fetch User
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await userService.getInfoUser(authUser.user_id);
      setUserInfo(res.data.data);
    } catch (error) {
      message.error("Không thể lấy thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Open profile modal
  const openModal = () => {
    if (!userInfo) return;

    form.setFieldsValue({
      full_name: userInfo.full_name,
      gender: userInfo.gender,
      birth_date: userInfo.birth_date ? dayjs(userInfo.birth_date, "DD-MM-YYYY") : null,
    });

    setIsModalOpen(true);
  };

  // OPEN CHANGE PASSWORD MODAL
  const openPasswordModal = () => {
    passwordForm.resetFields(); 
    setIsPasswordModal(true);
  };

  // Update Profile
  const handleUpdate = async () => {
    try {
      const formData = form.getFieldsValue();

      const payload = {
        full_name: formData.full_name,
        gender: formData.gender,
        birth_date: formData.birth_date
          ? formData.birth_date.format("DD-MM-YYYY")
          : null,
      };

     const res= await userService.updateProfile(authUser.user_id, payload);
     showNotification(res.data.message, "success");
      fetchUserInfo();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      showNotification(error.response.data.message, "error");
    }
  };

  // --- HANDLE CHANGE PASSWORD ---
  const handleChangePassword = async () => {
    try {
      const values = passwordForm.getFieldsValue();

      if (values.new_password !== values.confirm_password) {
        showNotification("Mật khẩu xác nhận không khớp!","error");
        return;
      }

      const payload = {
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      };
      console.log(payload)

    const res=  await userService.changePassword(authUser.user_id, payload);

      showNotification(res.data.message,"success");
      setIsPasswordModal(false);
    } catch (error) {
      console.log(error)
      showNotification(error.response.data.message,"error");
    }
  };

  if (loading || !userInfo) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>

      {/* --- THÔNG TIN CÁ NHÂN --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-gray-600 mb-2 block">Họ và tên</label>
          <p className="text-lg">{userInfo.full_name}</p>
        </div>

        <div>
          <label className="text-gray-600 mb-2 block">Giới tính</label>
          <p className="text-lg">{userInfo.gender || "Chưa cập nhật"}</p>
        </div>

        <div>
          <label className="text-gray-600 mb-2 block">Ngày sinh</label>
          <p className="text-lg">
            {userInfo.birth_date
              ? dayjs(userInfo.birth_date, "DD-MM-YYYY").format("DD/MM/YYYY")
              : "Chưa cập nhật"}
          </p>
        </div>
      </div>

      <button
        onClick={openModal}
        className="px-6 py-2 border-2 border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition"
      >
        CẬP NHẬT
      </button>

      {/* --- PROFILE MODAL --- */}
      <Modal
        title="Cập nhật thông tin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>,
          <Button type="primary" onClick={handleUpdate}>Lưu</Button>,
        ]}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Giới tính" name="gender">
            <Select placeholder="Chọn giới tính">
              <Select.Option value="nam">Nam</Select.Option>
              <Select.Option value="nữ">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ngày sinh" name="birth_date">
            <DatePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- THÔNG TIN ĐĂNG NHẬP --- */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">Thông tin đăng nhập</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-600 mb-2 block">Email</label>
            <p className="text-lg">{userInfo.email}</p>
          </div>

          <div>
            <label className="text-gray-600 mb-2 block">Mật khẩu</label>
            <p className="text-lg">••••••••••••</p>
          </div>
        </div>

        <button
          onClick={openPasswordModal}
          className="mt-6 px-6 py-2 border-2 border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition"
        >
          ĐỔI MẬT KHẨU
        </button>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModal}
        onCancel={() => setIsPasswordModal(false)}
        footer={[
          <Button onClick={() => setIsPasswordModal(false)}>Hủy</Button>,
          <Button type="primary" onClick={handleChangePassword}>Lưu</Button>,
        ]}
      >
        <Form layout="vertical" form={passwordForm}>
          <Form.Item
            label="Mật khẩu cũ"
            name="old_password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="new_password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirm_password"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Account;
