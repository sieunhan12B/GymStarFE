import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import logo from "@/assets/images/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
import { NotificationContext } from "@/App";
import { authService } from "@/services/auth.service";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);


  const onFinish = async (values) => {

    setLoading(true);
    try {
      const payload = {
        email: values.email,
      };
      const response = await authService.forgotPassword(payload);
      showNotification(response.data.message, "success");
      navigate(path.verifyEmail, {
        state: { email: values.email }
      });
    } catch (error) {
      if (error.response?.data?.message) {
        showNotification("Xác thực thất bại: " + error.response.data.message, "error");
      } else {
        showNotification("Đã xảy ra lỗi. Vui lòng thử lại!", "error");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center ">
        {/* Logo */}
        <Image preview={false} width={150} src={logo} alt="Gymshark Logo" />

        {/* Title */}
        <div className="mb-4">
          <Title level={4} className="font-bold tracking-wide">
            NHẬP EMAIL CỦA BẠN?
          </Title>
          <Text className="text-gray-500 text-sm">
            Không sao cả. Hãy nhập địa chỉ email của bạn,
            chúng tôi sẽ gửi hướng dẫn để bạn có thể đặt lại mật khẩu

          </Text>
        </div>

        {/* Form */}
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          className="w-full space-y-4"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              size="large"
              placeholder="Email *"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-black  hover:!bg-gray-700 border-none rounded-full font-semibold"
            >
              GỬI YÊU CẦU
            </Button>
          </Form.Item>
        </Form>


        <Link to={path.logIn} className=" font-semibold text-sm underline mt-3   text-black hover:underline ">
          Quay lại đăng nhập
        </Link>

      </div>
    </div>
  );
};

export default ForgotPassword;
