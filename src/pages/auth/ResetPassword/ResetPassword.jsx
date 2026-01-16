import React, { useContext, useEffect, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import logo from "@/assets/images/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
import { NotificationContext } from "@/App";
import { authService } from "@/services/auth.service";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const resetToken = sessionStorage.getItem("reset_token");

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        new_password: values.password,
        confirm_password: values.confirmPassword,

      };
      const response = await authService.resetPassword(
        payload,
        resetToken
      );
      showNotification(response.data.message, "success");
      sessionStorage.removeItem("reset_token");

      navigate(path.logIn);
    } catch (error) {
      if (error.response?.data?.message) {
        showNotification("reset thất bại: " + error.response.data.message, "error");
      } else {
        showNotification("Đã xảy ra lỗi. Vui lòng thử lại!", "error");
      }
      console.error(error);

    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!resetToken) {
      navigate(path.forgotPassword);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center ">
        <Image preview={false} width={150} src={logo} alt="Gymshark Logo" />

        <div className="mb-4">
          <Title level={4} className="font-bold tracking-wide">
            ĐẶT LẠI MẬT KHẨU
          </Title>
          <Text className="text-gray-500 text-sm">
            Nhập mật khẩu mới của bạn bên dưới để hoàn tất quá trình.
          </Text>
        </div>

        <Form
          name="resetPassword"
          layout="vertical"
          onFinish={onFinish}
          className="w-full space-y-4"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password
              size="large"
              placeholder="Mật khẩu mới*"
              className="rounded-md"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}

          >
            <Input.Password
              size="large"
              placeholder="Xác nhận mật khẩu*"
              className="rounded-md"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-black hover:!bg-gray-700 border-none rounded-full font-semibold"
            >
              ĐẶT LẠI MẬT KHẨU
            </Button>
          </Form.Item>
        </Form>

        <Link
          to={path.logIn}
          className="font-semibold text-sm underline mt-3 text-black hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
