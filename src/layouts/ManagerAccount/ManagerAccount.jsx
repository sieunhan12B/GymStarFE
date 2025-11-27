import { useState } from 'react';
import { Layout} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  HistoryOutlined,
  LogoutOutlined,

  CreditCardOutlined,
  HeartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Link, Outlet, Route } from 'react-router-dom';
import { path } from '../../common/path';

const { Header, Sider, Content } = Layout;

const ManagerAccount = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');

  const userMenuItems = [
    {
      label: 'Thông tin tài khoản',
      key: 'profile',
      icon: <UserOutlined />
    },
    {
      label: 'Đăng xuất',
      key: 'logout',
      icon: <LogoutOutlined />
    }
  ];

  const sidebarItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Thông tin tài khoản',
      path:path.account,
    },
    {
      key: '2',
      icon: <ShoppingCartOutlined />,
      label: 'Lịch sử đơn hàng',
      path:path.logIn,

    },
    {
      key: '3',
      icon: <CreditCardOutlined />,
      label: 'Lịch sử CoolCash',
      path:path.signUp,

    },
    {
      key: '4',
      icon: <GiftOutlined />,
      label: 'Ví Voucher',
      path:path.category,

    },
    {
      key: '5',
      icon: <FileTextOutlined />,
      label: 'Số địa chỉ',
      path:path.account,

    },
    {
      key: '6',
      icon: <HeartOutlined />,
      label: 'Đánh giá và phản hồi',
      path:path.account,

    },
    {
      key: '7',
      icon: <HistoryOutlined />,
      label: 'Chính sách & Câu hỏi thường gặp',
      path:path.account,

    },
    {
      key: '8',
      icon: <SettingOutlined />,
      label: 'Đăng xuất',
      path:path.account,

    }
  ];

  // Demo content dựa trên ảnh
  const renderContent = () => {
    switch(selectedKey) {
      case '1':
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-gray-600 mb-2 block">Họ và tên</label>
                <p className="text-lg">Báo Dũng Gia</p>
              </div>
              <div>
                <label className="text-gray-600 mb-2 block">Số điện thoại</label>
                <p className="text-lg">0988925891</p>
              </div>
              <div>
                <label className="text-gray-600 mb-2 block">Giới tính</label>
                <p className="text-lg">Chưa cập nhật</p>
              </div>
              <div>
                <label className="text-gray-600 mb-2 block">Ngày sinh</label>
                <p className="text-lg">Hãy cập nhật ngày sinh để coolmate gửi cho bạn 1 phần quà đặc biệt nhé</p>
              </div>
              <div>
                <label className="text-gray-600 mb-2 block">Chiều cao</label>
                <p className="text-lg">Chưa cập nhật</p>
              </div>
              <div>
                <label className="text-gray-600 mb-2 block">Cân nặng</label>
                <p className="text-lg">Chưa cập nhật</p>
              </div>
            </div>
            
            <button className="px-6 py-2 border-2 border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition-all">
              CẬP NHẬT
            </button>

            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">Thông tin đăng nhập</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-600 mb-2 block">Email</label>
                  <p className="text-lg">summonam@gmail.com</p>
                </div>
                <div>
                  <label className="text-gray-600 mb-2 block">Mật khẩu</label>
                  <p className="text-lg">••••••••••••</p>
                </div>
              </div>
              <button className="mt-6 px-6 py-2 border-2 border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition-all">
                CẬP NHẬT
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{sidebarItems.find(item => item.key === selectedKey)?.label}</h2>
            <p className="text-gray-600">Nội dung đang được phát triển...</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-100 h-screen pt-14">
       <Layout className="max-w-7xl  m-auto">
    

      <Layout className='flex flex-row'>
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 p-6 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              to={item.path}
              key={item.key}
              onClick={() => setSelectedKey(item.key)}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                ${selectedKey === item.key 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6 h-6 flex items-center justify-center bg-white text-black rounded-full ">
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <span className={selectedKey === item.key ? 'text-white' : 'text-gray-400'}>
                →
              </span>
            </Link>
          ))}
        </div>

        {/* Content */}
        <Content className=" w-1/2 p-6 bg-gray-50">
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
    </div>
   
  );
};

export default ManagerAccount;