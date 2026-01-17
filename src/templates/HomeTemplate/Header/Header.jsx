/* ================= IMPORTS ================= */

// React
import React, { useState, useEffect, useRef, useContext } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// UI - Ant Design
import { Input, Badge, Image } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingOutlined,
  CloseOutlined,
} from "@ant-design/icons";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/userSlice";
import { clearCart, setCart } from "@/redux/cartSlice";
import { setCategoryTree } from "@/redux/categorySlice";

// Assets
import logo from "@/assets/images/logo.svg";

// Components
import Announcement from "@/components/Announcement/Announcement";
import ProductCard from "@/components/ProductCard/ProductCard";

// Services
import { danhMucService } from "@/services/category.service";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";

// Utils
import { generateSlug } from "@/utils/generateSlug";
import { formatPrice } from "@/utils/formatPrice";

// Constants
import { path } from "@/common/path";

// Context
import { NotificationContext } from "@/App";

// Libs
import Cookies from "js-cookie";

// Styles
import "./header.css";

/* ================= UTILS ================= */
const buildCategoryUrl = (category, parents = []) => {
  const parentPath = parents
    .map(p => generateSlug(p.name))
    .join("/");

  const self = `${generateSlug(category.name)}-${category.category_id}`;

  return parentPath
    ? `/danh-muc/${parentPath}/${self}`
    : `/danh-muc/${self}`;
};



/* ================= COMPONENT ================= */
const Header = () => {
  /* ===== STATE ===== */
  const [activeMenu, setActiveMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Search
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);

  /* ===== CONTEXT ===== */
  const { showNotification } = useContext(NotificationContext);

  /* ===== REDUX ===== */
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cartSlice.items);
  const cartCount = useSelector((state) => state.cartSlice.count);
  const user = useSelector((state) => state.userSlice.user);

  // ======================= FETCH FUNCTIONS =======================
  const fetchProducts = async (kw) => {
    if (!kw) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await productService.getAllForUserWithKeyWord(kw);
      setSuggestions(res.data.data || []);

    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
      setSuggestions([]);
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await danhMucService.getAllCategory();
      setCategories(res.data.data || []);
      dispatch(setCategoryTree(res.data.data));    

    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  // ======================= EFFECTS =======================
  //lấy sản phẩm sau mỗi lần gõ tìm kiếm
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProducts(keyword), 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword]);

  // --- CATEGORIES ---
  useEffect(() => {
    fetchCategories();
  }, []);


  // ======================= LOGIC HANDLE =======================
  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed) {
      navigate(`/tim-kiem/${encodeURIComponent(trimmed)}`);
      setIsFocused(false);
    }
  };

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

  // ======================= RENDER SECTIONS =======================
  const renderMenuLeftHeader = () => {
    return (
      <>
        <div
          className="flex items-center h-full w-1/3"

        >
          <nav className="space-x-6 h-full flex items-center">

            {/* New */}
            <Link
              to={path.newest}
              className="relative inline-block font-bold text-gray-900 group"
            >
              <span className="bg-gradient-to-r from-red-500 to-pink-400 text-transparent bg-clip-text">
                NEW
              </span>
              <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-red-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>

            <Link
              to={path.bestSeller}
              className="relative inline-block font-bold text-gray-900 group"
            >
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                BÁN CHẠY
              </span>
              <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>



            <div
              onMouseLeave={(e) => {
                const related = e.relatedTarget;
                if (related && related.closest('.mega-menu-wrapper')) return;
                setActiveMenu(null);
              }}
              className="h-full flex gap-6 items-center ">
              {categories.map((parent) => (
                <Link
                  key={parent.category_id}
                  to={buildCategoryUrl(parent)}
                  onMouseEnter={() => setActiveMenu(parent)}
                  className="relative inline-block text-gray-900 font-semibold group hover:text-red-500"
                >
                  {parent.name}
                  <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-red-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
              ))}
            </div>  {/* Danh mục chính */}


            {/* Sale */}
            <Link
              to={path.sale}
              className="relative inline-block font-bold text-gray-900 group"
            >
              <span className="bg-gradient-to-r from-red-500 to-orange-400 text-transparent bg-clip-text">
                SALE
              </span>
              <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-red-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>

          </nav>


        </div>
      </>
    )
  }

  const renderContentRightHeader = () => {
    return (
      <>
        <div className="flex items-center space-x-6 w-1/3 justify-end">

          {/* SEARCH */}
          <div className=" hidden md:block w-64">
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
              className={`absolute  left-0 top-16 inset-x-0 min-h-[30vh]  bg-white shadow-lg border-t z-50 transition-all duration-200 ease-out
    ${isFocused && suggestions.length > 0
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
            >
              <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="grid grid-cols-4 gap-6">
                  {suggestions.slice(0, 4).map((product) => {
                    const hoverStatus = product?.product_variants[0]?.size;
                    return (
                      <ProductCard product={product} badgeContext={["sale"]} hoverSize={hoverStatus == null ? false : true} />
                    );
                  })}
                </div>
              </div>
            </div>





          </div>


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

                {/* Dropdown */}
                <div
                  className="absolute right-0 top-12 z-50 w-64"
                  style={{ animation: "fadeSlideDown 0.2s forwards ease-out" }}
                >
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* USER INFO */}
                    {user ? (
                      <div className="px-4 py-4 flex items-center gap-3 bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                          <UserOutlined />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.full_name || 'Người dùng'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || 'Xin chào bạn 👋'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-4 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700">
                          Chào mừng bạn 👋
                        </p>
                        <p className="text-xs text-gray-500">
                          Đăng nhập để mua sắm nhanh hơn
                        </p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="py-2">
                      {user ? (
                        <>
                          <Link
                            to={`${path.account}/${path.accountInfo}`}
                            onClick={() => setIsUserOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            <UserOutlined />
                            Thông tin tài khoản
                          </Link>

                          <div className="my-1 h-px bg-gray-100" />

                          <button
                            onClick={() => {
                              handleLogout();
                              setIsUserOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            <CloseOutlined />
                            Đăng xuất
                          </button>
                        </>
                      ) : (
                        <Link
                          to={path.logIn}
                          onClick={() => setIsUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <UserOutlined />
                          Đăng nhập
                        </Link>
                      )}
                    </div>
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
                                      {formatPrice(item.product_variant.price)}
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
      </>
    )
  }

  const renderCategoryDropDown = () => {
    return (
      <>
        {activeMenu && (
          <div
            className="mega-menu-wrapper absolute left-0 w-full bg-white shadow-lg border-t z-50 transition-all duration-200 ease-out opacity-100 translate-y-0"
            style={{ animation: "fadeSlideDown 0.2s forwards ease-out" }}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="max-w-7xl min-h-[30vh] mx-auto px-6 py-5">
              <div className="grid grid-cols-4 gap-6">
                {activeMenu.children?.map((child) => (
                  <div key={child.category_id}>
                    <Link
                      to={buildCategoryUrl(child, [activeMenu])}

                      className="hover:text-black block font-bold text-xl text-gray-900"
                    >
                      {child.name}
                    </Link>

                    {child.children?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {child.children.map((sub) => (
                          <Link
                            key={sub.category_id}
                            to={buildCategoryUrl(sub, [activeMenu, child])}

                            className="text-gray-600 hover:text-black text-sm font-semibold block"
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
      </>
    )
  }

  // ======================= MAIN RENDER =======================
  return (
    <>
      <Announcement />

      <header className="w-full bg-white shadow-sm z-50 sticky top-0">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* LEFT MENU */}
              {renderMenuLeftHeader()}

              {/* LOGO */}
              <div className="flex justify-center w-1/3">
                <Link to={path.home}>
                  <Image src={logo} preview={false} width={100} />
                </Link>
              </div>

              {/* RIGHT CONTENT */}
              {renderContentRightHeader()}
            </div>
          </div>

          {/* MEGA MENU */}
          {renderCategoryDropDown()}


        </div>
      </header>

      {/* OVERLAY */}
      {/* làm mờ màn hình mỗi khi bật menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        ></div>
      )}
    </>
  );
};

export default Header;
