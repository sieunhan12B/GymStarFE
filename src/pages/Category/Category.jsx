import React, { useEffect, useState } from "react";
import { Checkbox, Slider, Button, Drawer, message } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useParams } from "react-router-dom";
// import { danhMucService } from "@/services/category.service";

const Category = () => {
  const { category } = useParams(); // slug category từ route
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [0, 100],
  });
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  console.log(1)
  console.log("object")

  // Giả lập products theo category slug
  const allProducts = {
    nam: [], // sẽ load từ API sau nếu có
    nu: [],
    "phu-kien": [],
  };

  // === Fetch danh mục từ API ===
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await danhMucService.getAll();
  //       const data = res?.data || [];
  //       setCategories(data);

  //       // Tách category hiện tại
  //       const selected = data.find(
  //         (item) =>
  //           item.name.toLowerCase().replace(/\s+/g, "-") === category
  //       );
  //       setSubCategories(
  //         data.filter((item) => item.parent_id === selected?.category_id) || []
  //       );

  //       // Tạm thời gán products rỗng hoặc fake theo parent
  //       setProducts(allProducts[category] || []);
  //     } catch (error) {
  //       message.error("Không thể tải danh mục!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategories();
  // }, [category]);

  // === Filter handlers ===
  const handleCategoryChange = (checkedValues) =>
    setFilters({ ...filters, categories: checkedValues });
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
    setFilters({ categories: [], colors: [], sizes: [], priceRange: [0, 100] });

  // === Filter Sidebar ===
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm mb-4 uppercase">Categories</h3>
        <Checkbox.Group
          className="flex flex-col space-y-2"
          value={filters.categories}
          onChange={handleCategoryChange}
        >
          {subCategories.map((cat) => (
            <Checkbox key={cat.category_id} value={cat.name}>
              {cat.name}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      {/* Colors */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-bold text-sm mb-4 uppercase">Color</h3>
        <div className="grid grid-cols-4 gap-3">
          {["Black","White","Gray","Navy","Blue","Red"].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-12 h-12 rounded-full border-2 ${
                filters.colors.includes(color)
                  ? "border-black scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-bold text-sm mb-4 uppercase">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`py-2 text-sm font-medium border rounded ${
                filters.sizes.includes(size)
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-bold text-sm mb-4 uppercase">Price Range</h3>
        <Slider
          range
          min={0}
          max={100}
          value={filters.priceRange}
          onChange={handlePriceChange}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={clearFilters}
          className="w-full border-black text-black hover:bg-black hover:text-white"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Filter */}
        <div className="lg:hidden mb-4 flex justify-between items-center">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowMobileFilter(true)}
          >
            Filters
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Drawer */}
          <Drawer
            title="Filters"
            placement="left"
            onClose={() => setShowMobileFilter(false)}
            open={showMobileFilter}
            width={320}
          >
            <FilterSidebar />
          </Drawer>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
