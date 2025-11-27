import React from 'react';
import { Input, Select, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';


const Header = ({
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    categories,
    onAddItem,
    filterOn = true,
    addItemOn = true,
    itemName,
    searchTextOn = true,
    categoryFilterOn = true,
}) => {
    return (
        <div className="p-6 border-b border-gray-200">

            {/* === HEADER TITLE === */}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý {itemName}</h1>
                {addItemOn &&
                    <Button
                        type="default"
                        icon={<PlusOutlined />}
                        size="large"
                        className="font-semibold bg-white text-black border-black border-2 hover:!bg-black hover:!text-white hover:!border-black transition-color duration-200 "
                        onClick={onAddItem}
                    >
                        Thêm {itemName}
                    </Button>


                }
            </div>

            {/* === FILTERS === */}
            {filterOn &&
                <div className="flex gap-4 flex-wrap">
                    {searchTextOn &&
                        <Input
                            placeholder={`Tìm kiếm ${itemName}...`}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                            size="large"
                        />
                    }
                    {categoryFilterOn &&
                        <Select
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            className="w-48"
                            size="large"
                        >
                            {categories.map((cat) => (
                                <Select.Option key={cat} value={cat}>
                                    {cat === 'all' ? 'Tất cả danh mục' : cat}
                                </Select.Option>
                            ))}
                        </Select>
                    }
                </div>
            }
        </div>
    );
};

export default Header;
