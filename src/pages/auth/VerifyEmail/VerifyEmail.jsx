import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import logo from "@/assets/images/logo.svg";
import { Link, UNSAFE_LocationContext, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
const { Title, Text } = Typography;
import { NotificationContext } from "@/App"; // giả sử bạn có NotificationContext trong App.jsx
import { authService } from "../../../services/auth.service";
import { useLocation } from "react-router-dom";



const VerifyOtp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const location = useLocation();
  const email = location.state?.email;
  console.log(location)

  const onFinish =  async (values) => {
    setLoading(true);
    try {
          // Chuẩn bị dữ liệu gửi lên API
          const payload = {
            email: email,
            otp: values.otp,
    
          };
          console.log(payload)
    
          // Gọi API đăng ký
          const response = await authService.verifyOtp(payload);
          console.log(response);
    
          showNotification("Xác thực thành công!", "success");
          // Nếu API trả về thành công
          navigate(path.resetPassword,{
                  state: { reset_token: response.data.data.reset_token }
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center ">
        <Image preview={false} width={150} src={logo} alt="Gymshark Logo" />

        <div className="mb-4">
          <Title level={4} className="font-bold tracking-wide">
            NHẬP MÃ OTP
          </Title>
          <Text className="text-gray-500 text-sm">
            Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng nhập mã để tiếp tục.
          </Text>
        </div>

        <Form
          name="verifyOtp"
          layout="vertical"
          onFinish={onFinish}
          className="w-full space-y-4"
        >
          <Form.Item
            name="otp"
            rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
          >
            <Input
              size="large"
              maxLength={6}
              placeholder="Nhập mã OTP (6 số)"
              className="rounded-md text-center  font-semibold text-lg"
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
              XÁC THỰC
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

export default VerifyOtp;
