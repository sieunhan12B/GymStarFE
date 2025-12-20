import React, { useEffect, useState } from "react";
import { Checkbox, Slider, Button, Drawer, message } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useParams } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { formatPrice } from "../../../utils/utils";

const SearchPage = () => {
    const { keyword } = useParams();

    const [filters, setFilters] = useState({
        categories: [],
        colors: [],
        priceRange: [40000, 1000000],
    });
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [sortBy, setSortBy] = useState("featured");
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const colorOptions = [
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Gray", hex: "#808080" },
        { name: "Navy", hex: "#000080" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Red", hex: "#FF0000" },
    ];

    // === Fetch sản phẩm theo keyword ===
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await productService.getAllForUserWithKeyWord(keyword);
                setProducts(res.data.data || []);
            } catch (error) {
                console.error(error);
                message.error("Không thể tải sản phẩm!");
            } finally {
                setLoading(false);
            }
        };
        if (keyword) fetchProducts();
    }, [keyword]);

    // === Fetch categories ===
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productService.getAllCategories();
                setSubCategories(res.data.data || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCategories();
    }, []);

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


    const handlePriceChange = (value) =>
        setFilters({ ...filters, priceRange: value });

    const clearFilters = () =>
        setFilters({ categories: [], colors: [], priceRange: [40000, 1000000] });

    const toggleExpandCategory = (id) =>
        setExpandedCategories((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
        );

    // === FilterSidebar component ===
    const FilterSidebar = () => {
        const filteredCategories = subCategories.filter((cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="flex flex-col h-full">
                <h2 className="font-bold text-lg mb-4 sticky top-0 bg-white z-10">
                    Lọc sản phẩm
                </h2>



                <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                />

                {/* Categories */}
                <div className="mb-4">
                    <h3 className="font-bold text-sm mb-2 uppercase">Danh mục</h3>
                    {filteredCategories.map((cat) => (
                        <div key={cat.category_id} className="mb-1">
                            {cat.subCategories?.length ? (
                                <>
                                    <button
                                        className="w-full text-left font-medium"
                                        onClick={() => toggleExpandCategory(cat.category_id)}
                                    >
                                        {cat.name}
                                    </button>
                                    {expandedCategories.includes(cat.category_id) && (
                                        <Checkbox.Group
                                            className="ml-4 flex flex-col space-y-1"
                                            value={filters.categories}
                                            onChange={handleCategoryChange}
                                        >
                                            {cat.subCategories.map((sub) => (
                                                <Checkbox key={sub.id} value={sub.name}>
                                                    {sub.name}
                                                </Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                    )}
                                </>
                            ) : (
                                <Checkbox
                                    value={cat.name}
                                    checked={filters.categories.includes(cat.name)}
                                    onChange={(e) =>
                                        handleCategoryChange(
                                            e.target.checked
                                                ? [...filters.categories, cat.name]
                                                : filters.categories.filter((c) => c !== cat.name)
                                        )
                                    }
                                >
                                    {cat.name}
                                </Checkbox>
                            )}
                        </div>
                    ))}
                </div>

                {/* Colors */}
                <div className="mb-4">
                    <h3 className="font-bold text-sm mb-2 uppercase">Màu</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {colorOptions.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => handleColorChange(color.name)}
                                className={`w-12 h-12 rounded-full border-2 ${filters.colors.includes(color.name)
                                    ? "border-black scale-110"
                                    : "border-gray-300 hover:border-gray-400"
                                    }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

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

                <div className="mt-4 sticky bottom-0 bg-white pt-2 border-t">
                    <Button
                        onClick={clearFilters}
                        className="w-full border-black text-black hover:bg-black hover:text-white"
                    >
                        Clear All Filters
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white ">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-10">
                    Kết quả tìm kiếm: "{keyword}" ({products.length} sản phẩm)
                </h1>

                {/* Desktop Sort Dropdown */}
                <div className="hidden lg:flex justify-end mb-4 gap-4">
                    <span className="text-sm font-medium self-center">Sắp xếp:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                        <option value="featured">Tất cả</option>
                        <option value="price-low">Giá: Thấp tới Cao</option>
                        <option value="price-high">Giá: Cao tới Thấp</option>
                        <option value="newest">Mới nhất</option>
                    </select>
                </div>


                <div className="flex gap-8  min-h-[80vh]">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-20">
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
                        {/* Filter Chips */}
                        {(filters.categories.length ||
                            filters.colors.length ||
                            filters.priceRange[0] !== 40000 ||
                            filters.priceRange[1] !== 1000000) && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {filters.categories.map((cat) => (
                                        <span
                                            key={cat}
                                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                                        >
                                            {cat}
                                            <button
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        categories: filters.categories.filter((c) => c !== cat),
                                                    })
                                                }
                                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-300 transition"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}

                                    {filters.colors.map((color) => (
                                        <span
                                            key={color}
                                            className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition"
                                        >
                                            {color}
                                            <button
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        colors: filters.colors.filter((c) => c !== color),
                                                    })
                                                }
                                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-300 transition"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}

                                  

                                    {(filters.priceRange[0] !== 40000 || filters.priceRange[1] !== 1000000) && (
                                        <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-200 transition">
                                            {formatPrice(filters.priceRange[0])} – {formatPrice(filters.priceRange[1])}
                                            <button
                                                onClick={() => setFilters({ ...filters, priceRange: [40000, 1000000] })}
                                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-yellow-300 transition"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {loading ? (
                                <p>Đang tải sản phẩm...</p>
                            ) : products.length > 0 ? (
                                products.map((product) => <ProductCard key={product.id} product={product} />)
                            ) : (
                                <div className="col-span-full text-center py-10 text-gray-500">
                                    <p className="text-lg font-medium">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{keyword}"</p>
                                    <p className="text-sm">Hãy thử kiểm tra chính tả hoặc tìm kiếm bằng từ khóa khác.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
