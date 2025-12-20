import React, { useState, useEffect, useRef } from 'react';
import { Input, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '@/services/product.service';
import './header.css';

const SearchHeader = () => {
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    // Hàm gọi API tìm kiếm
    const fetchProducts = async (kw) => {
        if (!kw) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await productService.getAllForUserWithKeyWord(`keyword=${kw}`);
            setSuggestions(res.data || []); // Lấy tối đa 4 sản phẩm
        } catch (error) {
            console.error('Lỗi tìm kiếm sản phẩm:', error);
            setSuggestions([]);
        }
    };

    // Debounce 400ms
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchProducts(keyword), 400);
        return () => clearTimeout(debounceRef.current);
    }, [keyword]);

    // Khi nhấn Enter => chuyển trang tìm kiếm
    const handleSearch = () => {
        if (keyword.trim()) {
            navigate(`/tim-kiem?keyword=${keyword.trim()}`);
            setIsFocused(false);
        }
    };

    return (
        <div className="relative w-64">
            <Input
                placeholder="Bạn đang tìm gì hôm nay..."
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // delay để click vào suggestion
                onPressEnter={handleSearch}
                className="rounded-full border-gray-300 focus:border-gray-400"
            />

            {/* Gợi ý sản phẩm */}
            {isFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg mt-1 z-50 rounded-lg">
                    {suggestions.map((product) => (
                        <Link
                            to={`/san-pham/${product.product_id}`}
                            key={product.product_id}
                            className="flex items-center p-2 hover:bg-gray-100"
                            onMouseDown={(e) => e.preventDefault()} // giữ focus khi click
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
            )}
        </div>
    );
};

export default SearchHeader;
