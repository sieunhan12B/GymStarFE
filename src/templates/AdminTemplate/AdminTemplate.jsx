// IMPORT: thư viện, icon, UI, router, redux, asset
import React, { useContext, useMemo, useState } from "react";
import "./AdminTemplate.css";
import logo from "@/assets/images/logo.svg";
import {
  AppstoreOutlined,
  BarChartOutlined,
  ShopOutlined,
  UploadOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
  TagOutlined,
  StarOutlined,
  FormOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Image, Layout, Menu, Dropdown } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { path } from "@/common/path";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/userSlice";
import { NotificationContext } from "@/App";
import Cookies from "js-cookie";
import { clearCart } from "../../redux/cartSlice";

// CONFIG: layout & menu config
const { Header, Content, Footer, Sider } = Layout;

const MENU_ITEMS = [
  { key: path.dashboard, icon: <BarChartOutlined />, label: "Dashboard", roles: ["Quản trị viên"] },
  { key: path.userManager, icon: <UserOutlined />, label: "Người dùng", roles: ["Quản trị viên"] },
  { key: path.productManager, icon: <ProductOutlined />, label: "Sản phẩm", roles: ["Quản trị viên", "Quản lý sản phẩm"] },
  { key: path.categoryManager, icon: <TagOutlined />, label: "Danh mục", roles: ["Quản trị viên", "Quản lý sản phẩm"] },
  { key: path.promotionManager, icon: <UploadOutlined />, label: "Khuyến mãi", roles: ["Quản trị viên"] },
  { key: path.orderManager, icon: <ShopOutlined />, label: "Đơn hàng", roles: ["Quản trị viên", "Quản lý đơn hàng"] },
  { key: path.paymentManager, icon: <DollarOutlined />, label: "Thanh toán", roles: ["Quản trị viên", "Quản lý đơn hàng"] },
  { key: path.feedbackManager, icon: <FormOutlined />, label: "Góp ý", roles: ["Quản trị viên", "Quản lý phản hồi"] },
  { key: path.reviewManager, icon: <StarOutlined />, label: "Đánh giá", roles: ["Quản trị viên", "Quản lý phản hồi"] },
  { key: path.roleManager, icon: <AppstoreOutlined />, label: "Loại người dùng", roles: ["Quản trị viên"] },
  { key: path.addressManager, icon: <HomeOutlined />, label: "Địa chỉ", roles: ["Quản trị viên", "Quản lý đơn hàng"] },
];

const AdminTemplate = () => {
  // STATE: UI state
  const [collapsed, setCollapsed] = useState(false);

  // ROUTER: navigation & location
  const navigate = useNavigate();
  const location = useLocation();

  // REDUX: state & dispatch
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userSlice.user);

  // CONTEXT: notification
  const { showNotification } = useContext(NotificationContext);

  // DERIVED: current menu key
  const currentKey = location.pathname.replace("/admin/", "") || path.dashboard;

  // DERIVED: filter menu theo role
  const filteredMenuItems = useMemo(() => {
    if (!user?.role_name) return [];
    return MENU_ITEMS.filter((item) =>
      item.roles.includes(user.role_name)
    );
  }, [user?.role_name]);

  // HANDLER: logout
  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(clearCart());
    dispatch(logout());
    showNotification("Đăng xuất thành công!", "success");
    navigate(path.logIn);
  };

  // CONFIG: dropdown menu
  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // UI
  return (
    <Layout hasSider>
      {/* SIDEBAR */}
      <Sider
        collapsible
        collapsed={collapsed}
        className="overflow-auto h-screen sticky left-0 top-0 bottom-0 bg-black"
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Image src={logo} preview={false} />
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={filteredMenuItems}
          className="bg-black border-r-0"
          onClick={({ key }) => navigate(`/admin/${key}`)}
        />
      </Sider>

      {/* MAIN */}
      <Layout>
        {/* HEADER */}
        <Header className="px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
          {/* LEFT */}
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px", width: 64, height: 64 }}
            />

            <Link to={path.home}>
              <Image src={logo} preview={false} width={100} />
            </Link>
          </div>

          {/* RIGHT */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
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

        {/* CONTENT */}
        <Content className="my-6 mx-4 overflow-auto">
          <Outlet />
        </Content>

        {/* FOOTER */}
        <Footer className="text-center bg-white text-gray-600 border-t border-gray-200">
          GymStar Admin ©{new Date().getFullYear()} Created by Hoang Anh | Gia Bao
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminTemplate;
