import React, { useState } from "react";
import { Input, Select, Button } from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";

const Header = ({
    title,
    itemName,

    // Data
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    categories = [],

    // Actions
    onAddItem,
    onReload,

    // Feature toggles
    showFilter = true,
    showAddButton = true,
    showReload = true,
    showSearch = true,
    showCategoryFilter = true,

    reloading = false,
}) => {
    const [lastUpdated, setLastUpdated] = useState(
        new Date().toLocaleTimeString("vi-VN")
    );
    const handleReload = async () => {
        if (onReload) {
            await onReload(); // chờ reload xong
        }
        setLastUpdated(new Date().toLocaleTimeString("vi-VN")); // cập nhật giờ
    };
    return (
        <div className="p-6 border-b border-gray-200">
            {/* === HEADER TITLE === */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {title || `Quản lý ${itemName}`}
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Dữ liệu cập nhật lúc {lastUpdated}
                    </p>
                </div>

                <div className="flex gap-3">
                    {showReload && (
                        <Button
                            icon={<ReloadOutlined />}
                            size="large"
                            onClick={handleReload}
                            loading={reloading}
                        >
                            Tải lại
                        </Button>
                    )}

                    {showAddButton && (
                        <Button
                            type="default"
                            icon={<PlusOutlined />}
                            size="large"
                            className="font-semibold bg-white text-black border-black border-2 hover:!bg-black hover:!text-white hover:!border-black transition-color duration-200"
                            onClick={onAddItem}
                        >
                            Thêm {itemName}
                        </Button>
                    )}
                </div>
            </div>

            {/* === FILTERS === */}
            {showFilter && (
                <div className="flex gap-4 flex-wrap mt-3">
                    {showSearch && (
                        <Input
                            placeholder={`Tìm kiếm ${itemName}...`}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                            size="large"
                        />
                    )}

                    {showCategoryFilter && (
                        <Select
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            className="w-48"
                            size="large"
                        >
                            {categories.map((cat) => (
                                <Select.Option key={cat} value={cat}>
                                    {cat === "all" ? "Tất cả danh mục" : cat}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;
