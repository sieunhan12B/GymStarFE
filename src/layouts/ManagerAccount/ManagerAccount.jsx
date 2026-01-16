import { useContext } from 'react';
import { Layout } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  HeartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { path } from '../../common/path';
import Cookies from "js-cookie";
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/cartSlice';
import { logout } from '@/redux/userSlice';
import { NotificationContext } from '@/App';

const { Content } = Layout;
const sidebarItems = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: 'Thông tin tài khoản',
    path: path.accountInfo,
  },
  {
    key: '2',
    icon: <ShoppingCartOutlined />,
    label: 'Đơn hàng của tôi',
    path: path.orderHistory,

  },
  {
    key: '3',
    icon: <GiftOutlined />,
    label: 'Voucher của tôi',
    path: path.voucher,
  },

  {
    key: '4',
    icon: <FileTextOutlined />,
    label: 'Số địa chỉ',
    path: path.addresses,

  },
  {
    key: '5',
    icon: <HeartOutlined />,
    label: 'Đánh giá, góp ý và phản hồi',
    path: path.reviewFeedback,

  },
  {
    key: '6',
    icon: <SettingOutlined />,
    label: 'Đăng xuất',
    path: path.account,

  }
];


const ManagerAccount = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);

  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(clearCart());
    dispatch(logout());
    showNotification("Đăng xuất thành công!", "success");
    navigate(path.logIn);
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-14">
      <Layout className="max-w-7xl  m-auto">
        <Layout className='flex flex-row'>
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-6 space-y-2 sticky top-14 h-fit">
            {sidebarItems.map((item) => {
              const isActive = location.pathname.endsWith(item.path);
              if (item.label === 'Đăng xuất') {
                return (
                  <div
                    key={item.key}
                    onClick={handleLogout}
                    className="
          flex items-center justify-between p-3 rounded-lg cursor-pointer
          bg-white text-gray-800 hover:bg-red-50 hover:text-red-600 transition-all
        "
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-6 h-6 flex items-center justify-center bg-white text-black rounded-full">
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                );
              }

              return (
                <Link
                  to={item.path}
                  key={item.key}
                  className={`
        flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
        ${isActive ? 'bg-black text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}
      `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-6 h-6 flex items-center justify-center bg-white text-black rounded-full">
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <span className={isActive ? 'text-white' : 'text-gray-400'}>→</span>
                </Link>
              );
            })}

          </div>
          <Content className=" w-1/2 p-6 bg-gray-50">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>

  );
};

export default ManagerAccount;