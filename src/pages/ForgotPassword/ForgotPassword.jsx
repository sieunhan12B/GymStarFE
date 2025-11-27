import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import logo from "@/assets/images/logo.svg"; // đổi đường dẫn nếu khác
import { Link, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
import { authService } from "../../services/auth.service";
import { NotificationContext } from "@/App"; // giả sử bạn có NotificationContext trong App.jsx

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);


  const onFinish = async (values) => {

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên API
      const payload = {
        email: values.email,

      };

      // Gọi API đăng ký
      const response = await authService.forgotPassword(payload);
      console.log(response);

      showNotification(response.data.message, "success");
      // Nếu API trả về thành công
      navigate(path.verifyEmail, {
        state: { email: values.email }
      });
    } catch (error) {
      // Xử lý lỗi trả về từ API
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
            No problem. Enter your account email address and
            we’ll send you instructions so you can reset your
            password.

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
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Email is not valid!" },
            ]}
          >
            <Input
              size="large"
              placeholder="Email address*"
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
              XÁC THỰC EMAIL
            </Button>
          </Form.Item>
        </Form>


        <Link to={path.logIn} className=" font-semibold text-sm underline mt-3   text-black hover:underline ">
          Back To Login
        </Link>

      </div>
    </div>
  );
};

export default ForgotPassword;
