import React, { useState, useEffect } from 'react';
import { Input, Badge, Dropdown, Image } from 'antd';
import { SearchOutlined, HeartOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { path } from '../../common/path';
import logo from '@/assets/images/logo.svg';
import Announcement from '../Announcement/Announcement';
import { danhMucService } from '@/services/category.service';
import { generateSlug } from '../../utils/generateSlug ';

const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [cartCount] = useState(3);
  const [categories, setCategories] = useState([]);

  // LẤY CATEGORY TỪ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await danhMucService.getAll();
        console.log(res)
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const userMenuItems = [
    { key: '1', label: <Link to="/account">My Account</Link> },
    { key: '2', label: <Link to="/orders">Orders</Link> },
    { key: '3', label: <span>Sign Out</span> }
  ];

  return (
    <>
      <Announcement />

      <header className="w-full bg-white shadow-sm z-50 sticky top-0">
        <div className="relative">

          {/* HEADER MAIN */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* LEFT MENU */}
              <div className="flex items-center h-full w-1/3"
                onMouseLeave={(e) => {
                  const related = e.relatedTarget;
                  if (related && related.closest('.mega-menu-wrapper')) return;
                  setActiveMenu(null);
                }}
              >
                <nav className="space-x-8">
                  {categories.map((parent) => (
                    <span key={parent.category_id} className="relative pe-6 h-full">
                      <span
                        onMouseEnter={() => setActiveMenu(parent)}
                        className={`text-sm font-semibold cursor-pointer transition-colors hover:text-gray-900 
                        ${activeMenu?.category_id === parent.category_id ? 'text-gray-900' : 'text-gray-600'}`}
                      >
                        <b>{parent.name}</b>
                      </span>
                    </span>
                  ))}
                </nav>
              </div>

              {/* LOGO */}
              <div className="flex justify-center w-1/3">
                <Link to={path.home}>
                  <Image src={logo} preview={false} width={100} />
                </Link>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center space-x-6 w-1/3">
                <div className="hidden md:block">
                  <Input
                    placeholder="Bạn đang tìm gì hôm nay..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="w-64 rounded-full border-gray-300 focus:border-gray-400"
                  />
                </div>

                <button className="text-gray-600 hover:text-gray-900 md:hidden">
                  <SearchOutlined className="text-xl" />
                </button>

                <button className="text-gray-600 hover:text-gray-900">
                  <HeartOutlined className="text-xl" />
                </button>

                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <button className="text-gray-600 hover:text-gray-900">
                    <Link to={path.logIn}>

                      <UserOutlined className="text-xl" />
                    </Link>
                  </button>
                </Dropdown>

                <Badge count={cartCount} size="small" offset={[-2, 2]}>
                  <button className="text-gray-600 hover:text-gray-900">
                    <ShoppingOutlined className="text-xl" />
                  </button>
                </Badge>
              </div>
            </div>
          </div>

          {/* MOBILE SEARCH */}
          <div className="md:hidden px-4 pb-3">
            <Input
              placeholder="Bạn đang tìm gì hôm nay..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full rounded-full border-gray-300"
            />
          </div>

          {/* MEGA MENU */}
          {activeMenu && (
            <div
              className="mega-menu-wrapper absolute left-0 w-full bg-white shadow-lg border-t z-50"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="grid grid-cols-4 gap-6">

                  {activeMenu.children?.map((child) => (
                    <div key={child.category_id}>
                      <Link
                        to={`/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}`}
                        className="font-bold text-xl text-gray-900 hover:text-black block"
                      >
                        {child.name}
                      </Link>

                      {/* cấp con của cấp con */}
                      {child.children?.length > 0 && (
                        <div className="mt-2 space-y-1 ">
                          {child.children.map((sub) => (
                            <Link
                              key={sub.category_id}
                              to={`/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}/${generateSlug(sub.name)}`}
                              className="text-gray-600 hover:text-black text-sm block"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* OVERLAY */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setActiveMenu(null)}
        ></div>
      )}
    </>
  );
};

export default Header;
