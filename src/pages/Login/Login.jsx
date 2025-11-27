import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import logo from "@/assets/images/logo.svg"; // đổi đường dẫn nếu khác
import { Link, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
import { authService } from "@/services/auth.service";
import { NotificationContext } from "@/App"; // giả sử bạn có NotificationContext trong App.jsx
import { getLocalStorage, setLocalStorage } from "../../utils/utils";


const { Title, Text } = Typography;


const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);


  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên API
      const payload = {

        email: values.email,
        password: values.password,
      };


      // Gọi API đăng nhập
      const response = await authService.logIn(payload);
      console.log(response);

      setLocalStorage("user", response.data.user);
      const user=getLocalStorage("user");
      console.log(user)

      showNotification("Đăng nhập thành công!", "success");
      // Nếu API trả về thành công
      navigate(path.home);
    } catch (error) {
      // Xử lý lỗi trả về từ API
      if (error.response?.data?.message) {
        showNotification("Đăng nhập thất bại: " + error.response.data.message, "error");
      } else {
        showNotification("Đã xảy ra lỗi. Vui lòng thử lại!", "error");
      }
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center ">
        {/* Logo */}
        <Image preview={false} width={150} src={logo} alt="Gymshark Logo" />

        {/* Title */}
        <div className="mb-4">
          <Title level={4} className="font-bold tracking-wide">
            GYMSTAR ADMIN LOGIN
          </Title>
          <Text className="text-gray-500 text-sm">
            Shop your styles, save top picks to your wishlist,<br />
            track those orders & train with us.
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

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              size="large"
              placeholder="Password*"
              className="rounded-md"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <div className="text-right">
            <Link to={path.forgotPassword} className="text-sm text-black hover:underline hover:text-gray-700 ">
              Forgot Password?
            </Link>

          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-black  hover:!bg-gray-700 border-none rounded-full font-semibold"
            >
              LOG IN
            </Button>
          </Form.Item>
        </Form>

        <Text className="text-gray-600 text-sm ">
          Don’t have an account?{" "}
          <Link to={path.signUp} className="text-black hover:underline ">
            Sign up
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default Login;
