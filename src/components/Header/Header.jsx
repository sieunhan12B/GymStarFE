import React, { useState, useEffect, useRef, useContext } from 'react';
import { Input, Badge, Image } from 'antd';
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
import Cookies from "js-cookie";
import { productService } from '../../services/product.service';
import './header.css';

const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  console.log(activeMenu)
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const { showNotification } = useContext(NotificationContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cartSlice.items);
  const cartCount = useSelector((state) => state.cartSlice.count);
  const user = useSelector((state) => state.userSlice.user);

  // --- SEARCH ---
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);

  const fetchProducts = async (kw) => {
    if (!kw) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await productService.getAllForUserWithKeyWord(`keyword=${kw}&page=0&limit=4`);
      console.log(suggestions)
      setSuggestions(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProducts(keyword), 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword]);

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed) {
      // Chuyển đến URL dạng /tim-kiem/keyword
      navigate(`/tim-kiem/${encodeURIComponent(trimmed)}`);
      setIsFocused(false);
    }
  };


  // --- CATEGORIES ---
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

  // --- CART ---
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

  const handleDeleteCartItem = async (cart_detail_id) => {
    try {
      await cartService.deleteCartItem({ cart_detail_id });
      const updatedItems = cartItems.filter(item => item.cart_detail_id !== cart_detail_id);
      dispatch(setCart(updatedItems));
      showNotification("Xóa sản phẩm thành công!", "success");
    } catch (error) {
      showNotification("Xóa sản phẩm thất bại!", "error");
    }
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
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

  return (
    <>
      <Announcement />

      <header className="w-full bg-white shadow-sm z-50 sticky top-0">
        <div className="relative">
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
                      to={`danh-muc/${generateSlug(parent.name).toLowerCase()}`}
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

                {/* SEARCH */}
                <div className="relative hidden md:block w-64">
                  <Input
                    placeholder="Bạn đang tìm gì hôm nay..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onPressEnter={handleSearch}
                    className="rounded-full border-gray-300 focus:border-gray-400"
                  />

                  {/* Dropdown container luôn tồn tại */}
                  <div
                    className={`absolute  right-0 top-12  w-full bg-white border border-gray-200 shadow-lg mt-1 z-50 rounded-lg
      transition-all duration-200 ease-out transform origin-top
      ${isFocused && suggestions.length > 0
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                      }`}
                  >
                    {suggestions.map((product) => (
                      <Link
                        to={`danh-muc/${generateSlug(product.category_name)}/${product.product_id}`}
                        key={product.product_id}
                        className="flex items-center p-2 hover:bg-gray-100"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Image
                          src={product.thumbnail}
                          width={50}
                          height={50}
                          preview={false}
                          className="rounded-md mr-3"
                        />
                        <span className="text-sm text-gray-800">{product.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>


                <button className="text-gray-600 hover:text-gray-900 md:hidden">
                  <SearchOutlined className="text-xl" />
                </button>

                {/* HEART */}
                <button className="text-gray-600 hover:text-gray-900">
                  <HeartOutlined className="text-xl" />
                </button>

                {/* USER DROPDOWN */}
                <div className='relative'>
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <UserOutlined className="text-xl" />
                  </button>

                  {isUserOpen && (
                    <>
                      {/* Overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserOpen(false)} />

                      {/* Dropdown content */}
                      <div
                        className="absolute right-0 top-12 z-50 transition-all duration-200 ease-out opacity-0 translate-y-2"
                        style={{ animation: "fadeSlideDown 0.2s forwards ease-out" }}
                      >
                        <div className="w-48 bg-white shadow-lg rounded-lg border border-gray-100 py-2">
                          {user ? (
                            <>
                              <Link
                                to={`${path.account}/${path.accountInfo}`}
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


                {/* CART DROPDOWN */}
                <div className="relative">
                  <Badge count={cartCount} size="small" offset={[-2, 2]}>
                    <button
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ShoppingOutlined className="text-xl" />
                    </button>
                  </Badge>

                  {isCartOpen && (
                    <>
                      {/* Overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsCartOpen(false)} />

                      {/* Dropdown Content */}
                      <div
                        className="absolute right-0 top-12 z-50 transition-all duration-200 ease-out opacity-0 translate-y-2"
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

                          {/* Cart Items or Empty State */}
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
                                    className={`flex gap-3 py-3 ${index !== cartItems.length - 1 ? "border-b border-gray-100" : ""
                                      }`}
                                  >
                                    {/* Product Image */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Image src={item.product_variant.product.thumbnail} />
                                      </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                                        {item.product_variant.product.name}
                                      </h4>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-500">{item.product_variant.color}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">{item.product_variant.size}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">SL: {item.quantity}</span>
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

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => handleDeleteCartItem(item.cart_detail_id)}
                                      className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="border-t border-gray-100 px-5 py-4 space-y-3 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setIsCartOpen(false);
                                    navigate(path.cart);
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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="w-full rounded-full border-gray-300"
            />
          </div>

          {/* MEGA MENU */}
          {activeMenu && (
            <div
              className="mega-menu-wrapper absolute left-0 w-full bg-white shadow-lg border-t z-50 transition-all duration-200 ease-out opacity-100 translate-y-0"
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
                            to={`danh-muc/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}`}
                            className="hover:text-black block font-bold text-xl text-gray-900"
                          >
                            {child.name}
                          </Link>
                          {child.children?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {child.children.map((sub) => (
                                <Link
                                  key={sub.category_id}
                                  to={`danh-muc/${generateSlug(activeMenu.name)}/${generateSlug(child.name)}/${generateSlug(sub.name)}`}
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
                              to={`phu-kien/${generateSlug(child.name)}`}
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

// Bạn có thể tách MegaMenu, UserDropdown, CartDropdown thành component riêng cho dễ quản lý
export default Header;
