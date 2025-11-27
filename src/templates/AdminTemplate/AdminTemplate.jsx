import React, { useState } from 'react';
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
} from '@ant-design/icons';
import {Button, Image, Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { path } from '@/common/path';

const { Header, Content, Footer, Sider } = Layout;

const menuItems = [
  {
    key: path.dashboard,
    icon: <BarChartOutlined />,
    label: 'Dashboard',
  },
  {
    key: path.product,
    icon: <ProductOutlined /> ,
    label: 'Sản phẩm',
    
  },
  {
    key:path.order,
    icon:<ShopOutlined />,
    label:'Đơn hàng',
  },
  {
    key: path.category,
    icon: <TagOutlined />,
    label: 'Danh mục',
  },
  {
    key: path.user,
    icon: <UserOutlined />,
    label: 'Người dùng',
  },
  {
    key:path.review,
    icon:<StarOutlined />,
    label:'Đánh giá',
  },
  {
    key:path.feedback,
    icon:<FormOutlined />,
    label:'Góp ý',
  },
 
  {
    key: 'media',
    icon: <VideoCameraOutlined />,
    label: 'Media',
    children: [
      { key: 'videos', label: 'Videos', icon: <VideoCameraOutlined /> },
      { key: 'uploads', label: 'Uploads', icon: <UploadOutlined /> },
    ],
  },
];


const AdminTemplate = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate =useNavigate();


  return (
    <Layout hasSider>
      <Sider collapsible collapsed={collapsed} className="overflow-auto h-screen sticky left-0 top-0 bottom-0 bg-black">
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-xl text-black">
            <Image src={logo} preview={false}/>
          </div>z
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['4']} 
          items={menuItems}
          className="bg-black border-r-0"
          onClick={({key})=>{navigate(key)}}
        />
      </Sider>
      <Layout>
        <Header className="px-6 bg-white border-b border-gray-200 flex items-center shadow-sm sticky top-0 z-10">
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
                        <Image src={logo} preview={false} width={100}/>

          </div>
        </Header>
        <Content className="my-6 mx-4 overflow-auto">
          {/* <div className="p-6 text-center bg-white rounded-lg border border-gray-200 min-h-[280px]">
            <p className="text-base font-medium text-black">Long content</p>
            {
              Array.from({ length: 100 }, (_, index) => (
                <React.Fragment key={index}>
                  {index % 20 === 0 && index ? 'more' : '...'}
                  <br />
                </React.Fragment>
              ))
            }
          </div> */}
          <Outlet />
        </Content>
        <Footer className="text-center bg-white text-gray-600 border-t border-gray-200">
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}

export default AdminTemplate;