import React, { useContext, useState } from "react";
import { Input, Button, Form, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import logo from "@/assets/images/logo.svg"; // đổi đường dẫn nếu khác
import { Link, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
const { Title, Text } = Typography;
import { NotificationContext } from "@/App"; // giả sử bạn có NotificationContext trong App.jsx
import { authService } from "@/services/auth.service";


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
                       ĐĂNG KÍ
                    </Title>
                    <Text className="text-gray-500 text-sm">
                        Một tài khoản cho tất cả ứng dụng, giúp mọi thứ dễ dàng hơn.     </Text>
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
                            { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Tên đăng nhập*"
                            className="rounded-md"
                            prefix={<UserOutlined />}

                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập Email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Email *"
                            className="rounded-md"
                            prefix={<MailOutlined />}

                        />
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
                            prefix={<LockOutlined />}

                        />
                    </Form.Item>
                    <Form.Item
                        name="confirm"
                        dependencies={["password"]}
                        hasFeedback

                        rules={[
                            {
                                required: true,
                                message: "Xác nhận mật khẩu!",
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
                        <Input.Password placeholder="Nhập lại mật khẩu" prefix={<LockOutlined />}
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
                            TẠO TÀI KHOẢN
                        </Button>
                    </Form.Item>
                </Form>

                <Text className="text-gray-600 text-sm ">
                    Đã có tài khoản ?{" "}
                    <Link to={path.logIn} className="text-black hover:underline ">
                        Đăng nhập
                    </Link>
                </Text>
            </div>
        </div>
    )
}

export default Signup
