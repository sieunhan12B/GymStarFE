import React, { useContext, useState } from 'react';
import './AdminTemplate.css';
import logo from '@/assets/images/logo.svg';
import {
  AppstoreOutlined,
  BarChartOutlined,
  ShopOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
  TagOutlined,
  StarOutlined,
  FormOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Image, Layout, Menu, Dropdown, Modal } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { path } from '@/common/path';
import { useDispatch, useSelector } from "react-redux";
import { ROLES } from '@/constants/role';
import { logout } from '../../redux/userSlice';

import { NotificationContext } from '@/App';

import Cookies from "js-cookie";
import { clearCart } from '../../redux/cartSlice';

const { Header, Content, Footer, Sider } = Layout;



const AdminTemplate = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  // Lấy phần sau "/admin/"
  const currentKey = location.pathname.replace("/admin/", "");

  const user = useSelector((state) => state.userSlice.user);

  const getMenuItemsByRole = (role_id) => {
    const allItems = [
      { key: path.dashboard, icon: <BarChartOutlined />, label: 'Dashboard', roles: [ROLES.ADMIN] },
      { key: path.userManager, icon: <UserOutlined />, label: 'Người dùng', roles: [ROLES.ADMIN] },
      { key: path.productManager, icon: <ProductOutlined />, label: 'Sản phẩm', roles: [ROLES.ADMIN, ROLES.PRODUCT_MANAGER] },
      { key: path.categoryManager, icon: <TagOutlined />, label: 'Danh mục', roles: [ROLES.ADMIN, ROLES.PRODUCT_MANAGER] },
      { key: path.promotionManager, icon: <UploadOutlined />, label: 'Khuyến mãi', roles: [ROLES.ADMIN] },
      { key: path.orderManager, icon: <ShopOutlined />, label: 'Đơn hàng', roles: [ROLES.ADMIN, ROLES.ORDER_MANAGER] },
      { key: path.paymentManager, icon: <DollarOutlined />, label: 'Thanh toán', roles: [ROLES.ADMIN, ROLES.ORDER_MANAGER] },
      { key: path.feedbackManager, icon: <FormOutlined />, label: 'Góp ý', roles: [ROLES.ADMIN, ROLES.FEEDBACK_MANAGER] },
      { key: path.reviewManager, icon: <StarOutlined />, label: 'Đánh giá', roles: [ROLES.ADMIN, ROLES.FEEDBACK_MANAGER] },
      { key: path.roleManager, icon: <AppstoreOutlined />, label: 'Loại người dùng', roles: [ROLES.ADMIN] },
      { key: path.addressManager, icon: <HomeOutlined />, label: 'Địa chỉ', roles: [ROLES.ADMIN, ROLES.ORDER_MANAGER] },

    ];

    return allItems.filter(item => item.roles.includes(role_id));
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(clearCart());
    dispatch(logout());
    showNotification("Đăng xuất thành công!", "success");
    navigate(path.logIn);
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];







  return (
    <Layout hasSider>
      <Sider collapsible collapsed={collapsed} className="overflow-auto h-screen sticky left-0 top-0 bottom-0 bg-black">
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-xl text-black">
            <Image src={logo} preview={false} />
          </div>z
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={getMenuItemsByRole(user.role_id)}
          className="bg-black border-r-0"
          onClick={({ key }) => navigate(`/admin/${key}`)}
        />

      </Sider>
      <Layout>
        <Header className="px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-10">

          {/* BÊN TRÁI */}
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <div className="w-30 h-10 bg-transparent rounded-md flex items-center justify-center font-bold text-lg text-white tracking-widest">
              <Link to={path.home}>
                <Image src={logo} preview={false} width={100} />
              </Link>
            </div>
          </div>

          {/* BÊN PHẢI - USER INFO */}
          <Dropdown menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar icon={<UserOutlined />} />

              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm text-gray-800">
                  {user?.full_name}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.email}
                </span>
              </div>
            </div>
          </Dropdown>


        </Header>

        <Content className="my-6 mx-4 overflow-auto">
          <Outlet />
        </Content>
        <Footer className="text-center bg-white text-gray-600 border-t border-gray-200">
          GymStar Admin ©{new Date().getFullYear()} Created by Hoang Anh | Gia Bao
        </Footer>
      </Layout>
    </Layout>
  );
}

export default AdminTemplate;