// ================= IMPORTS =================
// React , hook
import React, { useEffect, useRef, useState } from "react";
import { Slider, Button, message, Tooltip, Select } from "antd";

// Router
import { useLocation, useParams } from "react-router-dom";

import { useSelector } from "react-redux";


//Components
import ProductCard from "@/components/ProductCard/ProductCard";

//Services
import { productService } from "@/services/product.service";
import { danhMucService } from "@/services/category.service";

//Utils
import { formatPrice } from "@/utils/formatPrice";

//Hook
import useDebounce from "@/hooks/useDebounce";
import Banner from "@/components/Banner/Banner";

//Banner
import menBanner from '@/assets/images/menBanner.avif';
// import womenBanner from '@/assets/images/womenBanner.avif';
import womenBanner from '@/assets/mp4s/womenBanner.mp4';
import accessoriesBanner from '@/assets/images/accessoriesBanner.avif';





const { Option } = Select;

// ================= CONSTANTS =================
const COLOR_OPTIONS = [
  { name: "Đen", hex: "#000000" },
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Xám", hex: "#808080" },
  { name: "Đỏ", hex: "#FF0000" },
  { name: "Xanh", hex: "#0000FF" }, // xanh dương
  { name: "Vàng", hex: "#FFFF00" },
  { name: "Cam", hex: "#FFA500" },
  { name: "Tím", hex: "#800080" },
  { name: "Hồng", hex: "#FFC0CB" },
  { name: "Nâu", hex: "#8B4513" },

];
const PAGE_DESCRIPTION_MAP = {
  newest: "Cập nhật những sản phẩm mới nhất, bắt kịp xu hướng thời trang hiện đại.",
  bestseller: "Những sản phẩm được yêu thích và mua nhiều nhất bởi khách hàng.",
  sale: "Ưu đãi hấp dẫn với mức giá tốt nhất – số lượng có hạn!",
  search: "Kết quả tìm kiếm phù hợp với từ khóa bạn đã nhập.",
  category: "Khám phá bộ sưu tập đa dạng, thiết kế tinh tế phù hợp với mọi phong cách."
};

const ROOT_CATEGORY_DESCRIPTION_MAP = {
  nam: "Phong cách mạnh mẽ, hiện đại và nam tính – dễ phối cho mọi hoàn cảnh.",
  nu: "Thanh lịch, tinh tế và thời thượng – tôn vinh vẻ đẹp của bạn.",
  "phu-kien": "Những món phụ kiện giúp outfit của bạn trở nên hoàn hảo hơn."
};

const ROOT_NAME_MAP = {
  nam: "Nam",
  nu: "Nữ",
  "phu-kien": "Phụ kiện",
};

const CATEGORY_BANNER_MAP = {
  nam: {
    imgSrc: menBanner,
    mediaType: "image",
    titleBanner: "Thời trang nam",
    desBanner: "Phong cách mạnh mẽ – hiện đại",
  },
  nu: {
    imgSrc: womenBanner,
    mediaType: "video",
    titleBanner: "Thời trang nữ",
    desBanner: "Thanh lịch – tinh tế – thời thượng",
  },
  "phu-kien": {
    imgSrc: accessoriesBanner,
    mediaType: "image",
    titleBanner: "Phụ kiện",
    desBanner: "Hoàn thiện outfit của bạn",
  },
};


// ================= UTILS =================
const getCategoryId = (splat) => {
  if (!splat) return null;
  const segments = splat?.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const match = lastSegment.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
};

const removeAccents = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
};


const Category = () => {
  // ================= ROUTER / PARAMS =================
  const { "*": splat, keyword } = useParams();
  const location = useLocation();
  const categoryId = getCategoryId(splat);

  const segments = splat?.split("/").filter(Boolean);
  const rawRootSlug = segments?.[0];
  const rootSlug = rawRootSlug?.replace(/-\d+$/, "");
  const bannerData = CATEGORY_BANNER_MAP[rootSlug];

  const categoryTree = useSelector((state) => state.categorySlice.tree);

  // ================= PAGE TYPE FLAGS =================
  const isNewestPage = location.pathname === "/san-pham-moi";
  const isBestSellerPage = location.pathname === "/san-pham-ban-chay";
  const isSalePage = location.pathname === "/san-pham-giam-gia";

  const getRootCategoryDescription = () => {
    if (!rootSlug) return PAGE_DESCRIPTION_MAP.category;
    return ROOT_CATEGORY_DESCRIPTION_MAP[rootSlug] || PAGE_DESCRIPTION_MAP.category;
  };

  const pageDescription = isNewestPage
    ? PAGE_DESCRIPTION_MAP.newest
    : isBestSellerPage
      ? PAGE_DESCRIPTION_MAP.bestseller
      : isSalePage
        ? PAGE_DESCRIPTION_MAP.sale
        : keyword
          ? PAGE_DESCRIPTION_MAP.search
          : getRootCategoryDescription();

  // ================= STATE =================
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [40000, 10000000],
  });
  const debouncedPriceRange = useDebounce(filters.priceRange, 150);
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState();
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ================= REFS =================
  const listRef = useRef(null);

  const filterSellingProducts = (products = []) => {
    return products.filter(
      (p) =>
        p?.status === "đang bán" &&
        Array.isArray(p.product_variants) &&
        p.product_variants.some(v => v.stock > 0)
    );
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [categoryId, keyword]);

  // ================= FETCH FUNCTION =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res;

      if (isNewestPage) {
        res = await productService.getNewestProducts();
      } else if (isBestSellerPage) {
        res = await productService.getBestSellingProducts();
      } else if (isSalePage) {
        res = await productService.getDiscountedProducts();
      } else if (keyword) {
        res = await productService.getAllForUserWithKeyWord(keyword);
      } else {
        res = await productService.getProductByCategoryId(categoryId);
        setCategory(res.data.category);
      }

      const sellingProducts = filterSellingProducts(res.data.data || []);
      setProducts(sellingProducts);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!categoryId || keyword) return;
    try {
      const res = await danhMucService.getLvl3Category(categoryId);
      setCategoryFilter(res.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh mục!");
    }
  };

  // ================= EFFECTS =================

  useEffect(() => {
    fetchProducts();
  }, [categoryId, keyword, isNewestPage, isBestSellerPage, isSalePage]);

  useEffect(() => {
    setFilters({
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [40000, 10000000],
    });
    setSortBy("featured");
  }, [categoryId, keyword]);

  useEffect(() => {
    fetchCategories();
  }, [categoryId, keyword]);


  // ======================= HANDLE FILTER =======================
  const handleColorChange = (color) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleSizeChange = (size) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handlePriceChange = (value) =>
    setFilters({ ...filters, priceRange: value });

  const clearFilters = () =>
    setFilters({ categories: [], colors: [], sizes: [], priceRange: [40000, 10000000] });

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(product.category_id);


    const matchesColor =
      filters.colors.length === 0 ||
      product.product_variants.some((variant) => {
        const variantColorClean = removeAccents(variant.color.toLowerCase());

        return filters.colors.some((filterColor) => {
          const filterClean = removeAccents(filterColor.toLowerCase());

          // Nếu chọn "Nâu" → hiện tất cả màu bắt đầu bằng "nâu" (không phân biệt dấu, hoa thường)
          return variantColorClean.startsWith(filterClean);
        });
      });
    const matchesSize =
      filters.sizes.length === 0 ||
      product.product_variants.some((variant) =>
        filters.sizes.includes(variant.size)
      );

    const prices = product.product_variants
      .map(v => Number(v.price))
      .filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) return false;


    const matchesPrice = product.product_variants.some((variant) => {
      const originalPrice = Number(variant.price);
      if (isNaN(originalPrice)) return false;

      const discountPercent = product.discount || 0;
      const finalPrice = originalPrice * (1 - discountPercent / 100);

      return finalPrice >= debouncedPriceRange[0] && finalPrice <= debouncedPriceRange[1];
    });

    return matchesCategory && matchesColor && matchesSize && matchesPrice;
  });

  const currentRoot = categoryTree.find(
    (r) => r.name === ROOT_NAME_MAP[rootSlug]
  );

  const groupedCategories = currentRoot?.children || [];

  // ======================= HELPERS =======================
  const getProductMinPrice = (product) => {
    const discountPercent = product.discount || 0;
    const prices = product.product_variants
      .map(v => Number(v.price))
      .filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) return Infinity;

    const minOriginal = Math.min(...prices);
    return minOriginal * (1 - discountPercent / 100);
  };

  // Sorted
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductMinPrice(a);
    const priceB = getProductMinPrice(b);

    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Count products per category
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    return acc;
  }, {});


  // Chuyển ID danh mục đang được chọn → thành tên danh mục để hiện lên UI,"Tìm thấy 10 sản phẩm có danh mục "Áo thun, Áo sơ mi""
  const activeCategories = filters.categories
    .map(catId => {
      const cat = categoryFilter.find(c => c.category_id === catId);
      return cat ? cat.name : null;
    })
    .filter(Boolean);

  //Danh mục là phụ kiện -> không có bộ lọc size
  const hasSizeFilter = filteredProducts.some(
    (product) => product.product_variants.some((variant) => variant.size)
  );

  //Lấy badge cho mỗi loại trang 
  const getBadgeContext = (product) => {
    const badges = [];
    if (isNewestPage) badges.push("new");
    if (product.discount > 0) badges.push("sale");
    if (categoryId && !keyword) badges.push("category");
    if (product.is_bestseller) badges.push("bestseller");

    return badges;
  };

  const parentToChildrenMap = categoryFilter.reduce((acc, item) => {
    if (!acc[item.parent_name]) acc[item.parent_name] = [];
    acc[item.parent_name].push(item.category_id);
    return acc;
  }, {});


  const toggleChildCategory = (id) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const toggleParentCategory = (childrenIds) => {
    setFilters((prev) => {
      const isAllSelected = childrenIds.every((id) =>
        prev.categories.includes(id)
      );

      return {
        ...prev,
        categories: isAllSelected
          ? prev.categories.filter((id) => !childrenIds.includes(id))
          : Array.from(new Set([...prev.categories, ...childrenIds])),
      };
    });
  };

  const parentCategoryCounts = groupedCategories.reduce((acc, parent) => {
    if (!parent.children) return acc;

    acc[parent.category_id] = parent.children.reduce(
      (sum, child) => sum + (categoryCounts[child.category_id] || 0),
      0
    );

    return acc;
  }, {});


  // ======================= RENDER SECTIONS =======================

  // Sidebar filters
  const renderContentLeft = () => (
    <aside className="w-full lg:w-64 pt-6 lg:pt-24 flex-shrink-0">
      <div className="sticky top-20">
        <div className="flex flex-col h-full">
          <h2 className="font-bold text-lg mb-4 sticky top-0 bg-white z-10">
            Lọc sản phẩm
          </h2>

          <div className="flex-1 space-y-4">
            {/* Categories */}
            {groupedCategories.map((parent) => {
              const hasChildren = parent.children && parent.children.length > 0;

              // ===== CẤP CUỐI (không có con) =====
              if (!hasChildren) {
                return (
                  <label
                    key={parent.category_id}
                    className="flex items-center gap-3 text-base cursor-pointer select-none py-1 hover:text-black transition-all"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-black cursor-pointer" q
                      checked={filters.categories.includes(parent.category_id)}
                      onChange={() => toggleChildCategory(parent.category_id)}
                    />
                    <span>
                      {parent.name}
                      <span className="ml-1 text-gray-400 text-sm">
                        ({categoryCounts[parent.category_id] || 0})
                      </span>
                    </span>
                  </label>
                );
              }

              // ===== CÓ CON =====
              const childrenIds = parent.children.map((c) => c.category_id);
              const isAllChecked = childrenIds.every((id) =>
                filters.categories.includes(id)
              );
              const isSomeChecked =
                childrenIds.some((id) => filters.categories.includes(id)) &&
                !isAllChecked;

              return (
                <div
                  key={parent.category_id}
                  className="mb-4 rounded-lg  transition-all"
                >
                  {/* CHA */}
                  <label className="flex items-center gap-3 font-semibold text-base cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-black cursor-pointer"
                      checked={isAllChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeChecked;
                      }}
                      onChange={() => toggleParentCategory(childrenIds)}
                    />
                    <span>
                      {parent.name}
                      <span className="ml-1 text-gray-400 text-sm">
                        ({parentCategoryCounts[parent.category_id] || 0})

                      </span>
                    </span>
                  </label>

                  {/* CON */}
                  <div className="ml-6 mt-3 space-y-2">
                    {parent.children.map((child) => (
                      <label
                        key={child.category_id}
                        className="flex items-center gap-3 text-base cursor-pointer select-none hover:text-black transition-all"
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-black cursor-pointer"
                          checked={filters.categories.includes(child.category_id)}
                          onChange={() => toggleChildCategory(child.category_id)}
                        />
                        <span>
                          {child.name}
                          <span className="ml-1 text-gray-400 text-sm">
                            ({categoryCounts[child.category_id] || 0})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Colors */}
            <div>
              <h3 className="font-bold text-sm mb-2 uppercase">Màu</h3>
              <div className="grid grid-cols-4 gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <Tooltip key={color.name} title={color.name} placement="top">
                    <button
                      onClick={() => handleColorChange(color.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all
                        ${filters.colors.includes(color.name)
                          ? "border-black scale-110"
                          : "border-gray-300 hover:border-gray-400"
                        }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {hasSizeFilter && (
              <div>
                <h3 className="font-bold text-sm mb-2 uppercase">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`py-2 text-sm font-medium border rounded
            ${filters.sizes.includes(size)
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-300 hover:border-black"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <h3 className="font-bold text-sm mb-2 uppercase">Khoảng giá</h3>
              <Slider
                range
                min={40000}
                max={10000000}
                value={filters.priceRange}
                onChange={handlePriceChange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sticky bottom-0 bg-white pt-2 border-t">
            <Button
              onClick={clearFilters}
              className="w-full border-black text-black hover:bg-black hover:text-white"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );

  // Main content
  const renderContentRight = () => {

    const hasActiveFilters =
      filters.categories.length > 0 ||
      filters.colors.length > 0 ||
      filters.sizes.length > 0 ||
      debouncedPriceRange[0] !== 40000 ||
      debouncedPriceRange[1] !== 10000000;

    return (
      <div className="flex-1">
        {/* Filter chips */}
        <div className="mb-4 min-h-[100px]">
          <div className="flex flex-wrap gap-2  transition-all duration-200">
            {hasActiveFilters && (
              <>
                {/* Categories */}
                {filters.categories.map((catId) => {
                  const cat = categoryFilter.find(c => c.category_id === catId);
                  return cat ? (
                    <span
                      key={cat.category_id}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      Danh mục: {cat.name}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            categories: filters.categories.filter((c) => c !== cat.category_id),
                          })
                        }
                      >
                        ✕
                      </button>
                    </span>
                  ) : null;
                })}

                {/* Sizes */}
                {filters.sizes.map((size) => (
                  <span
                    key={size}
                    className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {size}
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          sizes: filters.sizes.filter((s) => s !== size),
                        })
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Colors */}
                {filters.colors.map((color) => (
                  <span
                    key={color}
                    className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {color}
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          colors: filters.colors.filter((c) => c !== color),
                        })
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Price */}
                {(debouncedPriceRange[0] !== 40000 || debouncedPriceRange[1] !== 10000000) && (
                  <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formatPrice(debouncedPriceRange[0])} – {formatPrice(debouncedPriceRange[1])}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, priceRange: [40000, 10000000] })
                      }
                    >
                      ✕
                    </button>
                  </span>
                )}
              </>
            )}
          </div>

          {hasActiveFilters && filteredProducts.length === 0 && (
            <p className="mt-2 text-base md:text-lg text-red-600 italic border-l-4 border-red-400 bg-red-50 px-4 py-3 rounded shadow-sm flex items-center gap-2">
              😔 Không tìm thấy sản phẩm nào với bộ lọc hiện tại.
            </p>
          )}

          {hasActiveFilters && filteredProducts.length > 0 && (

            <p className="mt-2 text-base md:text-lg text-gray-800 italic border-l-4 border-blue-400 bg-blue-50 px-4 py-3 rounded shadow-sm flex items-center gap-2">
              <span>🎉</span>
              <span>
                {`Tìm thấy ${filteredProducts.length} sản phẩm có`}
                {activeCategories.length > 0 && ` danh mục "${activeCategories.join(", ")}"`}
                {filters.colors.length > 0 && ` màu "${filters.colors.join(", ")}"`}
                {filters.sizes.length > 0 && ` size "${filters.sizes.join(", ")}"`}
                . Hãy click chọn để xem chi tiết!
              </span>

            </p>
          )}
        </div>

        {/* Mobile Filter + Sort bar */}
        <div className="flex lg:hidden justify-between items-center mb-4 gap-2">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 border border-gray-300 py-[3px] rounded-md font-medium"
          >
            Bộ lọc
          </button>

          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="flex-1"
            size="middle"
          >
            <Option value="featured">Tất cả</Option>
            <Option value="price-low">Giá: thấp → cao</Option>
            <Option value="price-high">Giá: cao → thấp</Option>
            <Option value="newest">Mới nhất</Option>
          </Select>
        </div>

        {/* Sort */}
        <div className="hidden lg:flex justify-end mb-4 gap-4 items-center" >
          <span className="text-sm font-medium">Sắp xếp:</span>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-56 "
            size="middle"
          >
            <Option value="featured">Tất cả</Option>
            <Option value="price-low">Giá: thấp tới cao</Option>
            <Option value="price-high">Giá: cao tới thấp</Option>
            <Option value="newest">Mới nhất</Option>
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" ref={listRef} >
          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                hoverSize={!!product?.product_variants?.some(v => v.size)}
                product={product}
                badgeContext={getBadgeContext(product)}
              />

            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              <p className="text-lg font-medium">
                😔 Không tìm thấy sản phẩm nào
                {keyword && ` với từ khóa "${keyword}"`}
                {filters.categories.length > 0 && ` thuộc danh mục "${activeCategories.join(", ")}"`}
                {filters.colors.length > 0 && ` màu "${filters.colors.join(", ")}"`}
                {filters.sizes.length > 0 && `, size "${filters.sizes.join(", ")}"`}
                {filters.priceRange[0] !== 40000 || filters.priceRange[1] !== 10000000
                  ? ` trong khoảng giá ${formatPrice(filters.priceRange[0])} – ${formatPrice(filters.priceRange[1])}`
                  : ""}
                .
              </p>
              <p className="text-sm">
                {keyword ? "  Hãy thử thay đổi bộ lọc hoặc kiểm tra chính tả nếu có từ khóa." : "Hãy thử thay đổi bộ lọc khác"}

              </p>
            </div>
          )}

        </div>


      </div>
    );
  };

  // ======================= MAIN RENDER =======================
  return (
    <div className="min-h-screen bg-white">
      {bannerData && !keyword && !isNewestPage && !isBestSellerPage && !isSalePage && (
        <div className="mb-10">
          <Banner
            imgSrc={bannerData.imgSrc}
            mediaType={bannerData.mediaType}
            titleBanner={bannerData.titleBanner}
            desBanner={bannerData.desBanner}
            categories={[]}
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 space-y-3">
          <h1 className={`font-bold ${keyword ? "text-3xl" : "text-5xl"}`}>
            {isNewestPage
              ? "Sản phẩm mới"
              : isBestSellerPage
                ? "Sản phẩm hot/bán chạy"
                : isSalePage
                  ? "Sản phẩm giảm giá"
                  : !keyword
                    ? category?.name || "Không có sản phẩm nào"
                    : `Kết quả tìm kiếm: "${keyword}"`
            }
          </h1>

          <p className="mt-2 text-gray-600 text-lg">
            {sortedProducts.length} sản phẩm
          </p>

          <p className="mt-1 text-xl  max-w-2xl">
            {pageDescription}
          </p>
        </div>

        <div className="flex gap-8">
          {/* <div className="hidden lg:block"> */}
            {renderContentLeft()}
          {/* </div> */}

          {renderContentRight()}
        </div>

        {/* MOBILE FILTER DRAWER */}
        {isMobileFilterOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsMobileFilterOpen(false)}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl max-h-[70vh] overflow-y-auto p-4 animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Bộ lọc</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-xl"
                >
                  ✕
                </button>
              </div>

              <div>
                {renderContentLeft()}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Category;
