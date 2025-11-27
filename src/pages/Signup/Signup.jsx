import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import logo from "@/assets/images/logo.svg"; // đổi đường dẫn nếu khác
import { Link, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
const { Title, Text } = Typography;
import { NotificationContext } from "@/App"; // giả sử bạn có NotificationContext trong App.jsx
import { authService } from "../../services/auth.service";


const Signup = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);



    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Chuẩn bị dữ liệu gửi lên API
            const payload = {
                full_name: values.name,
                email: values.email,
                password: values.password,
            };

            // Gọi API đăng ký
            const response = await authService.signUp(payload);
            console.log(response);

            showNotification(response.data.message, "success");
            // Nếu API trả về thành công
            navigate(path.logIn);
        } catch (error) {
            // Xử lý lỗi trả về từ API
            if (error.response?.data?.message) {
                showNotification("Đăng ký thất bại: " + error.response.data.message, "error");
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
                        GYMSTAR SIGNUP
                    </Title>
                    <Text className="text-gray-500 text-sm">
                        One account, across all apps, just to make things a <br />
                        little easier.          </Text>
                </div>

                {/* Form */}
                <Form
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    className="w-full space-y-4"
                >
                    <Form.Item
                        name="name"
                        rules={[
                            { required: true, message: "Please input your name!" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Name*"
                            className="rounded-md"
                        />
                    </Form.Item>
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
                    <Form.Item
                        name="confirm"
                        dependencies={["password"]}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: "Confirm password!",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu" />
                    </Form.Item>


                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            className="w-full bg-black  hover:!bg-gray-700 border-none rounded-full font-semibold"
                        >
                            CREATE ACCOUNT
                        </Button>
                    </Form.Item>
                </Form>

                <Text className="text-gray-600 text-sm ">
                    Already have an account?{" "}
                    <Link to={path.logIn} className="text-black hover:underline ">
                        Log in
                    </Link>
                </Text>
            </div>
        </div>
    )
}

export default Signup
