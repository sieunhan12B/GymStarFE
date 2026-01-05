import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import logo from "@/assets/images/logo.svg";
import { path } from "@/common/path";
import { authService } from "@/services/auth.service";
import { NotificationContext } from "@/App";

// Redux
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { ROLES } from "../../../constants/role";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  const AdminPath = "/admin";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password,
      };

      const response = await authService.logIn(payload);

      dispatch(setUser(response.data.user));

      showNotification("Đăng nhập thành công!", "success");

      switch (response.data.user.role_id) {
        case ROLES.ADMIN:
          navigate(`${AdminPath}/dashboard`);
          break;
        case ROLES.PRODUCT_MANAGER:
          navigate(`${AdminPath}/${path.productManager}`);
          break;
        case ROLES.ORDER_MANAGER:
          navigate(`${AdminPath}/${path.orderManager}`);
          break;
        case ROLES.FEEDBACK_MANAGER:
          navigate(`${AdminPath}/${path.feedbackManager}`);
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Logo */}
        <Image preview={false} width={150} src={logo} alt="Gymshark Logo" />

        {/* Title */}
        <div className="mb-4">
          <Title level={4} className="font-bold tracking-wide">
            ĐĂNG NHẬP
          </Title>
          <Text className="text-gray-500 text-sm">
            Mua sắm phong cách, theo dõi đơn hàng và rèn luyện cùng chúng tôi
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
              { required: true, message: "Vui lòng nhập Email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input size="large" placeholder="Email *" className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              size="large"
              placeholder="Mật khẩu*"
              className="rounded-md"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <div className="text-right">
            <Link
              to={path.forgotPassword}
              className="text-sm text-black hover:underline hover:text-gray-700"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-black hover:!bg-gray-700 border-none rounded-full font-semibold"
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
        </Form>

        <Text className="text-gray-600 text-sm">
          Không có tài khoản?{" "}
          <Link to={path.signUp} className="text-black hover:underline">
            Đăng kí
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default Login;
