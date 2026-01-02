import React, { useEffect, useRef, useState } from "react";
import { Slider, Button, message, Tooltip, Select } from "antd";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useParams } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { formatPrice } from "../../../utils/utils";
import { getCategoryId } from "../../../utils/generateSlug";
import { danhMucService } from "../../../services/category.service";

const { Option } = Select;

const Category = () => {
  const { "*": splat, keyword } = useParams();
  console.log(keyword)
  const categoryId = getCategoryId(splat);

  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [40000, 1000000],
  });
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState();
  const [categoryFilter, setCategoryFilter] = useState([]);
  const listRef = useRef(null); // thêm ref
  const [loading, setLoading] = useState(false);
  const filterSellingProducts = (products = []) => {
    return products.filter(
      (p) =>
        p?.status === "đang bán" &&
        Array.isArray(p.product_variants) &&
        p.product_variants.some(v => v.stock > 0)
    );
  };




  // Color options
  const colorOptions = [
    { name: "Đen", hex: "#000000" },
    { name: "Trắng", hex: "#FFFFFF" },
    { name: "Xám", hex: "#808080" },
    { name: "Xanh", hex: "#0000FF" },
    { name: "Đỏ", hex: "#FF0000" },
    { name: "Nâu", hex: "#8B4513" },
    { name: "Hồng", hex: "#FFC0CB" },

  ];

  const normalizeColor = (color) => {
    if (!color) return "";
    return color.split(" ")[0];
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, sortBy]);


  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let res;
        setLoading(true);
        if (keyword) {
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
    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    setFilters({
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [40000, 1000000],
    });
  }, [categoryId]);


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!categoryId) return;
      try {
        const res = await danhMucService.getCategoryByParentCategory(categoryId);
        setCategoryFilter(res.data.data || []);
      } catch (error) {
        console.error(error);
        message.error("Không thể tải danh mục!");
      }
    };
    fetchCategories();
  }, [categoryId]);

  // Handlers
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
    setFilters({ categories: [], colors: [], sizes: [], priceRange: [40000, 1000000] });

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(product.category_id);

    const matchesColor =
      filters.colors.length === 0 ||
      product.product_variants.some((variant) =>
        filters.colors.includes(normalizeColor(variant.color))
      );

    const matchesSize =
      filters.sizes.length === 0 ||
      product.product_variants.some((variant) =>
        filters.sizes.includes(variant.size)
      );

    // ===== SỬA PHẦN GIÁ Ở ĐÂY =====
    const prices = product.product_variants
      .map(v => Number(v.price))
      .filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) return false; // không có giá → ẩn

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Nếu các variant có giá khác nhau → kiểm tra khoảng
    // Nhưng thường giá giống nhau → dùng minPrice
    const matchesPrice =
      minPrice >= filters.priceRange[0] && maxPrice <= filters.priceRange[1];

    return matchesCategory && matchesColor && matchesSize && matchesPrice;
  });

  const getProductMinPrice = (product) => {
    const prices = product.product_variants
      .map(v => Number(v.price))
      .filter(p => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : Infinity;
  };

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
  const categoryCounts = categoryFilter.reduce((acc, cat) => {
    acc[cat.category_id] = filterSellingProducts(products).filter(
      p => p.category_id === cat.category_id
    ).length;
    return acc;
  }, {});

  const activeCategories = filters.categories
    .map(catId => {
      const cat = categoryFilter.find(c => c.category_id === catId);
      return cat ? cat.name : null;
    })
    .filter(Boolean);
  const hasSizeFilter = filteredProducts.some(
    (product) => product.product_variants.some((variant) => variant.size)
  );



  // Sidebar filters
  const renderContentLeft = () => (
    <aside className="hidden lg:block w-64 pt-24 flex-shrink-0">
      <div className="sticky top-20">
        <div className="flex flex-col h-full">
          <h2 className="font-bold text-lg mb-4 sticky top-0 bg-white z-10">
            Lọc sản phẩm
          </h2>

          <div className="flex-1 space-y-4">
            {console.log(categoryFilter)}
            {/* Categories */}
            {categoryFilter.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-2 uppercase">Danh mục</h3>
                <div className="overflow-y-auto max-h-60 border p-2 rounded">
                  {categoryFilter.map((cat) => (
                    <label key={cat.category_id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat.category_id)}
                        onChange={() => {
                          setFilters((prev) => ({
                            ...prev,
                            categories: prev.categories.includes(cat.category_id)
                              ? prev.categories.filter((c) => c !== cat.category_id)
                              : [...prev.categories, cat.category_id],
                          }));
                        }}
                      />
                      <span className="flex justify-between w-full">
                        <span>{cat.name}</span>
                        <span className="text-gray-500">({categoryCounts[cat.category_id] || 0})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}


            {/* Colors */}
            <div>
              <h3 className="font-bold text-sm mb-2 uppercase">Màu</h3>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
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
              <h3 className="font-bold text-sm mb-2 uppercase">Price Range</h3>
              <Slider
                range
                min={40000}
                max={1000000}
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
      filters.categories.length ||
      filters.colors.length ||
      filters.sizes.length ||
      filters.priceRange[0] !== 40000 ||
      filters.priceRange[1] !== 1000000;

    return (
      <div className="flex-1">
        {/* Filter chips */}
        <div className="mb-4 min-h-[100px]">
          <div className="flex flex-wrap gap-2 min-h-[40px] transition-all duration-200">
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
                {(filters.priceRange[0] !== 40000 || filters.priceRange[1] !== 1000000) && (
                  <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formatPrice(filters.priceRange[0])} – {formatPrice(filters.priceRange[1])}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, priceRange: [40000, 1000000] })
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

        {/* Sort */}
        <div className="hidden lg:flex justify-end mb-4 gap-4 items-center">
          <span className="text-sm font-medium">Sắp xếp:</span>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-56"
            size="middle"
          >
            <Option value="featured">Tất cả</Option>
            <Option value="price-low">Giá: thấp tới cao</Option>
            <Option value="price-high">Giá: cao tới thấp</Option>
            <Option value="newest">Mới nhất</Option>
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" ref={listRef}>
          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                hoverSize={product?.product_variants[0]?.size != null}
                product={product}
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
                {filters.priceRange[0] !== 40000 || filters.priceRange[1] !== 1000000
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className={`font-bold mb-10 ${keyword ? "text-3xl" : "text-5xl"}`}>
          {!keyword
            ? `${category?.name} (${sortedProducts.length})`
            : `Kết quả tìm kiếm: "${keyword}" (${sortedProducts.length} sản phẩm)`}
        </h1>




        <div className="flex  gap-8">
          {renderContentLeft()}
          {renderContentRight()}
        </div>
      </div>
    </div>
  );
};

export default Category;
