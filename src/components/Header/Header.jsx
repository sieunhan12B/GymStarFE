import React, { useState, useEffect, useContext } from 'react';
import { Input, Badge, Dropdown, Image } from 'antd';
import { SearchOutlined, HeartOutlined, UserOutlined, ShoppingOutlined, CloseOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '@/common/path';
import logo from '@/assets/images/logo.svg';
import Announcement from '../Announcement/Announcement';
import { danhMucService } from '@/services/category.service';
import { generateSlug } from '@/utils/generateSlug ';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/userSlice';
import { NotificationContext } from '@/App';
import { cartService } from '../../services/cart.service';
import { clearCart, setCart } from '../../redux/cartSlice';
import './header.css'


const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showNotification } = useContext(NotificationContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cartSlice.items);
  const cartCount = useSelector((state) => state.cartSlice.count);
  const user = useSelector((state) => state.userSlice.user?.user);

  const [isUserOpen, setIsUserOpen] = useState(false);


  // LẤY CATEGORY TỪ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await danhMucService.getAll();
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // LẤY GIỎ HÀNG SAU KHI LOGIN
  useEffect(() => {
    if (!user?.user_id) return;

    const fetchCart = async () => {
      try {
        const res = await cartService.getCart();
        dispatch(setCart(res.data.data));
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
      }
    };

    fetchCart();
  }, [user]);

  // HANDLE LOGOUT
  const handleLogout = () => {
    dispatch(clearCart());
    dispatch(logout());
    showNotification("Đăng xuất thành công!", "success");
    navigate(path.logIn);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product_variant.product.final_price) * item.quantity);
  }, 0);

  const userMenuItems = [
    {
      key: "1",
      label: (
        <Link to="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition">
          Tài khoản
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition">
          Đơn hàng
        </Link>
      ),
    },
    {
      type: "divider"
    },
    {
      key: "3",
      label: (
        <span onClick={handleLogout} className="block px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition cursor-pointer">
          Đăng xuất
        </span>
      ),
    },
  ];

  const userNoLoginMenuItems = [
    {
      key: "1",
      label: (
        <Link to={path.logIn} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition">
          Đăng nhập
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
                      key={parent.category_id}
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
              <div className="flex items-center space-x-6 w-1/3 justify-end">
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

                <div className="relative">
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <UserOutlined className="text-xl" />
                  </button>

                  {isUserOpen && (
                    <>
                      {/* Overlay */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserOpen(false)}
                      />

                      {/* Dropdown content */}
                      <div
                        className="
    absolute right-0 top-12 z-50
    transition-all duration-200 ease-out
    opacity-0 translate-y-2
  "
                        style={{ animation: "fadeSlideDown 0.2s forwards ease-out" }}
                      >
                        <div className="w-48 bg-white shadow-lg rounded-lg border border-gray-100 py-2">
                          {user ? (
                            <>
                              <Link
                                to={path.account}
                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => setIsUserOpen(false)}
                              >
                                Tài khoản
                              </Link>
                              <Link
                                to="/orders"
                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => setIsUserOpen(false)}
                              >
                                Đơn hàng
                              </Link>

                              <div className="border-t my-1"></div>

                              <span
                                onClick={() => {
                                  handleLogout();
                                  setIsUserOpen(false);
                                }}
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                Đăng xuất
                              </span>
                            </>
                          ) : (
                            <Link
                              to={path.logIn}
                              className="block px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => setIsUserOpen(false)}
                            >
                              Đăng nhập
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>


                {/* CART BUTTON VỚI DROPDOWN */}
                <div className="relative">
                  <Badge count={cartCount} size="small" offset={[-2, 2]}>
                    <button
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ShoppingOutlined className="text-xl" />
                    </button>
                  </Badge>

                  {/* CART DROPDOWN */}
                  {isCartOpen && (
                    <>
                      {/* Overlay */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCartOpen(false)}
                      />

                      {/* Dropdown Content */}
                      <div
                        className="
    absolute right-0 top-12 z-50
    transition-all duration-200 ease-out
    opacity-0 translate-y-2
  "
                        style={{ animation: "fadeSlideDown 0.2s forwards ease-out" }}
                      >
                        <div className="w-80 bg-white rounded-lg shadow-2xl border border-gray-100 max-h-[500px] flex flex-col">

                          {/* Header */}
                          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-gray-900">Giỏ hàng</h3>
                              <span className="bg-black text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {cartCount}
                              </span>
                            </div>
                            <button
                              onClick={() => setIsCartOpen(false)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <CloseOutlined className="text-base" />
                            </button>
                          </div>

                          {/* Cart Items hoặc Empty State */}
                          {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <ShoppingOutlined className="text-3xl text-gray-400" />
                              </div>
                              <h4 className="text-base font-semibold text-gray-900 mb-1">Giỏ hàng trống</h4>
                              <p className="text-xs text-gray-500 text-center">
                                Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Cart Items - Scrollable */}
                              <div className="flex-1 overflow-y-auto px-5 py-3">
                                {cartItems.map((item, index) => (
                                  <div
                                    key={item.cart_id}
                                    className={`flex gap-3 py-3 ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                                  >
                                    {/* Product Image Placeholder */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ShoppingOutlined className="text-xl" />
                                      </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                                        {item.product_variant.product.name}
                                      </h4>

                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-500">
                                          {item.product_variant.color}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">
                                          {item.product_variant.size}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">
                                          SL: {item.quantity}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-900">
                                          {formatPrice(item.product_variant.product.final_price)}
                                        </p>
                                        {item.product_variant.product.discount > 0 && (
                                          <p className="text-xs text-gray-400 line-through">
                                            {formatPrice(item.product_variant.product.price)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="border-t border-gray-100 px-5 py-4 space-y-3 flex-shrink-0">


                                {/* View Cart Button */}
                                <button
                                  onClick={() => {
                                    setIsCartOpen(false);
                                    navigate('/cart');
                                  }}
                                  className="w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
                                >
                                  Xem giỏ hàng
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
              className=" mega-menu-wrapper absolute left-0 w-full bg-white shadow-lg border-t z-50
      transition-all duration-200 ease-out
      opacity-100 translate-y-0"
              style={{ animation: "fadeSlideDown 0.2s forwards ease-out" }}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="grid grid-cols-4 gap-6">
                  {activeMenu.category_id !== 28 ? (
                    <>
                      {activeMenu.children?.map((child) => (
                        <div key={child.category_id}>
                          <Link
                            to={`category/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}`}
                            className="hover:text-black block font-bold text-xl text-gray-900"
                          >
                            {child.name}
                          </Link>
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
                      ))}
                    </>
                  ) : (
                    <>
                      <div key={activeMenu.category_id}>
                        <Link
                          to={`category/${generateSlug(activeMenu.name)}`}
                          className="hover:text-black block font-bold text-xl text-gray-900"
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