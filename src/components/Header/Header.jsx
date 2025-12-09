import React, { useState, useEffect, useContext } from 'react';
import { Input, Badge, Dropdown, Image } from 'antd';
import { SearchOutlined, HeartOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '@/common/path';
import logo from '@/assets/images/logo.svg';
import Announcement from '../Announcement/Announcement';
import { danhMucService } from '@/services/category.service';
import { generateSlug } from '@/utils/generateSlug ';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/userSlice';
import { NotificationContext } from '@/App';


const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [cartCount] = useState(3);
  const [categories, setCategories] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);


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

  // HANDLE LOGOUT
  const handleLogout = () => {
    dispatch(logout());
    showNotification("Đăng xuất thành công!", "success");
    navigate(path.logIn);
  };

  const userMenuItems = [
    {
      key: "1",
      label: (
        <Link
          to="/account"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition"
        >
          Tài khoản
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link
          to="/orders"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition"
        >
          Đơn hàng
        </Link>
      ),
    },
    {
      type: "divider"
    },
    {
      key: "3",
      label: (
        <span
          onClick={handleLogout}
          className="block px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition cursor-pointer"
        >
          Đăng xuất
        </span>
      ),
    },
  ];


  const userNoLoginMenuItems = [
    {
      key: "1",
      label: (
        <Link
          to={path.logIn}
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition"
        >
          Đăng nhập
        </Link>
      ),
    },
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
              <div
                className="flex items-center h-full w-1/3"
                onMouseLeave={(e) => {
                  const related = e.relatedTarget;
                  if (related && related.closest('.mega-menu-wrapper')) return;
                  setActiveMenu(null);
                }}
              >
                <nav className="space-x-8">
                  {categories.map((parent) => (
                    <Link
                      to={`/danh-muc/${parent.name}`}
                      onMouseEnter={() => setActiveMenu(parent)}
                      className="relative text-sm cursor-pointer font-semibold group inline-block"
                    >
                      {parent.name}
                      <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-black scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    </Link>
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

                <Dropdown menu={{ items: user ? userMenuItems : userNoLoginMenuItems }} placement="bottomRight" trigger={"click"}>
                  <button className="text-gray-600 hover:text-gray-900">
                    <UserOutlined className="text-xl" />
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
                  {activeMenu.category_id !== 28 ? (
                    <>
                      {activeMenu.children?.map((child) => {
                        console.log(activeMenu)
                        console.log(child);
                        return (
                          <div key={child.category_id}>
                            <Link
                              to={`category/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}`}
                              className=" hover:text-black block font-bold  text-xl text-gray-900 "
                            >
                              {child.name}
                            </Link>
                            {/* cấp con của cấp con */}
                            {child.children?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {child.children.map((sub) => (
                                  <Link
                                    key={sub.category_id}
                                    to={`/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}/${generateSlug(sub.name)}`}
                                    className="text-gray-600 hover:text-black text-sm font-semibold block"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      }


                      )}
                    </>


                  ) : (
                    <>
                      <div key={activeMenu.category_id} className="">
                        <Link
                          to={`category/${generateSlug(activeMenu.name)}`}
                          className="  hover:text-black block font-bold  text-xl text-gray-900"
                        >
                          {activeMenu.name}
                        </Link>
                        {activeMenu.children?.map((child) => (
                          <div key={child.category_id} className="mt-2 space-y-1">
                            <Link
                              to={`category/phu-kien/${generateSlug(child.name)}`}
                              className="text-gray-600 hover:text-black text-sm font-semibold block"
                            >
                              {child.name}
                            </Link>
                          </div>
                        ))}
                      </div>


                    </>

                  )}



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
