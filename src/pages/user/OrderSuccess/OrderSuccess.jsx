import React, { useEffect, useState } from 'react';
import {
    CheckCircleFilled,
    ShoppingOutlined,
    InboxOutlined,
    CarOutlined,
    CheckOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import {
    Layout,
    Card,
    Typography,
    Steps,
    List,
    Avatar,
    Row,
    Col,
    Divider,
    Button,
    Tag,
} from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;
const OrderSuccess = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const orderData = {
        orderNumber: 'GYM' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        orderDate: new Date().toLocaleDateString('vi-VN'),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
        customer: {
            name: 'Nguyễn Văn A',
            phone: '0912 345 678',
            email: 'customer@example.com',
            address: '123 Đường ABC, Quận 1, TP.HCM',
        },
        items: [
            {
                id: 1,
                name: 'Áo Tank Top Nam Pro Fit',
                size: 'L',
                color: 'Đen',
                quantity: 2,
                price: 299000,
                image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop',
            },
            {
                id: 2,
                name: 'Quần Jogger Gym Essential',
                size: 'M',
                color: 'Xám',
                quantity: 1,
                price: 450000,
                image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=100&h=100&fit=crop',
            },
        ],
        payment: {
            subtotal: 1048000,
            shipping: 30000,
            total: 1078000,
            method: 'COD',
        },
    };

    return (
        <Layout style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            <Content style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
                {/* SUCCESS HEADER */}
                <Card
                    style={{
                        textAlign: 'center',
                        marginBottom: 32,
                        background: '#000',
                        color: '#fff',
                    }}
                    bordered={false}
                >
                    <CheckCircleFilled
                        style={{
                            fontSize: 72,
                            color: '#52c41a',
                            transform: animate ? 'scale(1)' : 'scale(0)',
                            transition: 'all .5s',
                        }}
                    />
                    <Title level={2} style={{ color: '#fff', marginTop: 16 }}>
                        Đặt Hàng Thành Công!
                    </Title>
                    <Text style={{ color: '#ccc' }}>
                        Cảm ơn bạn đã tin tưởng và mua sắm tại Gym Store
                    </Text>

                    <Divider />

                    <Tag color="green" style={{ fontSize: 16, padding: '6px 16px' }}>
                        Mã đơn hàng: <strong>{orderData.orderNumber}</strong>
                    </Tag>
                </Card>

                {/* STEPS */}
                <Card style={{ marginBottom: 32 }}>
                    <Steps
                        current={0}
                        items={[
                            { title: 'Đã đặt hàng', icon: <CheckOutlined /> },
                            { title: 'Đang xử lý', icon: <InboxOutlined /> },
                            { title: 'Đang giao', icon: <CarOutlined /> },
                            { title: 'Hoàn thành', icon: <ShoppingOutlined /> },
                        ]}
                    />
                </Card>

                <Row gutter={24}>
                    {/* LEFT */}
                    <Col xs={24} md={16}>
                        {/* PRODUCTS */}
                        <Card title="Sản phẩm đã đặt" style={{ marginBottom: 24 }}>
                            <List
                                itemLayout="horizontal"
                                dataSource={orderData.items}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar shape="square" size={80} src={item.image} />}
                                            title={item.name}
                                            description={
                                                <>
                                                    <Text>Size: {item.size} | Màu: {item.color}</Text>
                                                    <br />
                                                    <Text>Số lượng: {item.quantity}</Text>
                                                </>
                                            }
                                        />
                                        <Text strong>
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </Text>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        {/* SHIPPING INFO */}
                        <Card title="Thông tin giao hàng">
                            <p><strong>{orderData.customer.name}</strong></p>
                            <p><PhoneOutlined /> {orderData.customer.phone}</p>
                            <p><MailOutlined /> {orderData.customer.email}</p>
                            <p><EnvironmentOutlined /> {orderData.customer.address}</p>
                        </Card>
                    </Col>

                    {/* RIGHT */}
                    <Col xs={24} md={8}>
                        <Card
                            title="Tóm tắt đơn hàng"
                            style={{ background: '#000', color: '#fff' }}
                            headStyle={{ color: '#fff' }}
                        >
                            <Row justify="space-between">
                                <Text style={{ color: '#ccc' }}>Tạm tính</Text>
                                <Text strong style={{ color: '#fff' }}>
                                    {orderData.payment.subtotal.toLocaleString('vi-VN')}đ
                                </Text>
                            </Row>

                            <Row justify="space-between">
                                <Text style={{ color: '#ccc' }}>Phí vận chuyển</Text>
                                <Text strong style={{ color: '#fff' }}>
                                    {orderData.payment.shipping.toLocaleString('vi-VN')}đ
                                </Text>
                            </Row>

                            <Divider style={{ borderColor: '#444' }} />

                            <Row justify="space-between">
                                <Title level={5} style={{ color: '#fff' }}>Tổng cộng</Title>
                                <Title level={5} style={{ color: '#fff' }}>
                                    {orderData.payment.total.toLocaleString('vi-VN')}đ
                                </Title>
                            </Row>

                            <Divider style={{ borderColor: '#444' }} />

                            <Text style={{ color: '#ccc' }}>Thanh toán</Text>
                            <p><strong>COD – Thanh toán khi nhận hàng</strong></p>

                            <Divider style={{ borderColor: '#444' }} />

                            <Text style={{ color: '#ccc' }}>Dự kiến giao</Text>
                            <p><strong>{orderData.estimatedDelivery}</strong></p>

                            <Button type="primary" block style={{ marginBottom: 8 }}>
                                Theo dõi đơn hàng
                            </Button>
                            <Button block ghost>
                                Tiếp tục mua sắm
                            </Button>
                        </Card>
                    </Col>
                </Row>

                {/* FOOTER */}
                <Card style={{ marginTop: 32, textAlign: 'center' }}>
                    <Title level={4}>Cảm ơn bạn đã ủng hộ!</Title>
                    <Text>
                        Email xác nhận đã được gửi đến <strong>{orderData.customer.email}</strong>
                    </Text>
                    <br />
                    <Text type="secondary">
                        Hotline hỗ trợ: <strong>1900-xxxx</strong>
                    </Text>
                </Card>
            </Content>
        </Layout>
    );
}
export default OrderSuccess
