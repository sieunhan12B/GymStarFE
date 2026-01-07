// React
import React, { useContext, useEffect, useMemo, useState } from "react";

// UI libraries
import {
    Tag,
    Button,
    Image,
    Modal,
    Tooltip,
} from "antd";
import {
    EyeOutlined,
    EditOutlined,
    SyncOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";
import ProductDetailModal from "./ProductDetailModal";
import ProductAddEditModal from "./ProductAddEditModal";

// Services
import { productService } from "@/services/product.service";
import { danhMucService } from "@/services/category.service";

// Utils
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";
import { formatPrice } from "@/utils/utils";

// Context
import { NotificationContext } from "@/App";

const ProductManager = () => {
    const { showNotification } = useContext(NotificationContext);

    // ========================================
    // 1. STATE & DATA
    // ========================================
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductForStatus, setSelectedProductForStatus] = useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // ========================================
    // 2. FETCH DATA & EFFECTS
    // ========================================
    const fetchCategories = async () => {
        try {
            const res = await danhMucService.getAllCategory();
            setCategories(res?.data?.data || []);
        } catch (err) {
            console.error("Lỗi tải danh mục", err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getAllForAdmin();
            setProducts(res.data.data);
        } catch {
            showNotification("Lỗi khi tải sản phẩm", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // ========================================
    // 3. FILTERING
    // ========================================
    const filteredProducts = useMemo(() => {
        const keyword = removeVietnameseTones(searchText).toLowerCase();
        return products.filter(p => {
            const nameMatch = removeVietnameseTones(p.name).toLowerCase().includes(keyword);
            const categoryMatch =
                categoryFilter === "all" ||
                removeVietnameseTones(p.category_name).toLowerCase() ===
                removeVietnameseTones(categoryFilter).toLowerCase();
            return nameMatch && categoryMatch;
        });
    }, [products, searchText, categoryFilter]);

    const categoryForHeader = ['all', ...Array.from(new Set(products.map(item => item.category_name).filter(Boolean)))];

    // ========================================
    // 4. TABLE CONFIGURATION
    // ========================================
    const productColumns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 100,
            render: (thumbnail) => (
                <Image
                    src={thumbnail}
                    alt="product"
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (text) => <span className="font-medium text-gray-900">{text}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            filters: [
                { text: 'Đang bán', value: 'đang bán' },
                { text: 'Ngưng bán', value: 'ngưng bán' },
            ],
            onFilter: (value, record) =>
                record.status?.toString().normalize("NFC").trim().toLowerCase() === value,
            render: (status, record) => {
                const s = status?.toString().normalize("NFC").trim().toLowerCase();
                const color = s === 'đang bán' ? 'green' : 'red';

                const handleOpenStatus = () => {
                    setSelectedProductForStatus(record);
                    setStatusModalOpen(true);
                };

                return (
                    <div className="flex justify-between items-center w-full">
                        <Tag color={color} className="rounded-full">
                            {status}
                        </Tag>
                        <Button
                            type="text"
                            onClick={handleOpenStatus}
                            icon={<SyncOutlined />}
                            title="Thay đổi trạng thái"
                        />
                    </div>
                );
            },
        },
        {
            title: 'Danh mục',
            dataIndex: 'category_name',
            key: 'category',
            width: 200,
            render: (_, record) => {
                const parent = record.parent_category_name;
                const child = record.category_name;
                const text = parent ? `${parent} / ${child}` : child || '—';
                return <Tag color="blue" className="rounded-full">{text}</Tag>;
            },
        },
        {
            title: 'Giá bán',
            key: 'price',
            width: 160,
            render: (_, record) => {
                const variants = record.product_variants || [];
                if (!variants.length) return <span className="text-gray-400">—</span>;

                const prices = variants
                    .map(v => Number(v.price))
                    .filter(p => !isNaN(p));

                if (!prices.length) return <span className="text-gray-400">—</span>;

                const discount = Number(record.discount || 0);
                const finalPrices = prices.map(p => p * (1 - discount / 100));

                const min = Math.min(...finalPrices);
                const max = Math.max(...finalPrices);

                if (min === max) {
                    return <span className="text-green-600 font-bold">{formatPrice(min)}</span>;
                }

                return <span className="text-green-600 font-bold">{formatPrice(min)} – {formatPrice(max)}</span>;
            },
            sorter: (a, b) => {
                const getMin = (p) => {
                    const variants = p.product_variants || [];
                    const prices = variants.map(v => Number(v.price)).filter(Boolean);
                    if (!prices.length) return 0;
                    const discount = Number(p.discount || 0);
                    return Math.min(...prices) * (1 - discount / 100);
                };
                return getMin(a) - getMin(b);
            },
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            sorter: (a, b) => Number(a.discount || 0) - Number(b.discount || 0),
            render: (discount) => (
                Number(discount) > 0
                    ? <Tag color="red" className="rounded-full">{discount}%</Tag>
                    : <Tag className="rounded-full">0%</Tag>
            ),
        },
        {
            title: 'Biến thể',
            dataIndex: 'product_variants',
            key: 'product_variants',
            width: 120,
            align: 'center',
            sorter: (a, b) => (a.product_variants?.length || 0) - (b.product_variants?.length || 0),
            render: (product_variants = []) => (
                <Tag color="purple" className="rounded-full">{product_variants.length} biến thể</Tag>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'product_variants',
            key: 'stock',
            width: 120,
            align: 'center',
            render: (product_variants = []) => {
                const totalStock = product_variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
                const color = totalStock > 10 ? 'green' : totalStock > 0 ? 'orange' : 'red';
                return <Tag color={color} className="rounded-full">{totalStock}</Tag>;
            },
            sorter: (a, b) => {
                const sumStock = (p) => p.product_variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;
                return sumStock(a) - sumStock(b);
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 220,
            fixed: 'right',
            render: (_, record) => {
                const canEdit = record.status === "ngưng bán";

                const handleOpenDetail = () => {
                    const variantsWithImages = record.product_variants?.map(variant => {
                        const colorGroup = record.colors?.find(c => c.color === variant.color);
                        return {
                            ...variant,
                            images: colorGroup ? colorGroup.images : [],
                            thumbnail: record.thumbnail,
                        };
                    }) || [];

                    setSelectedProduct({
                        ...record,
                        variants: variantsWithImages,
                        specs: record.spec || record.specs || {},
                    });
                    setIsDetailModalOpen(true);
                };

                const handleOpenDelete = () => {
                    setSelectedProduct(record);
                    setIsDeleteModalOpen(true);
                };

                return (
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={handleOpenDetail}
                        />
                        <Tooltip
                            title={
                                canEdit
                                    ? "Chỉnh sửa sản phẩm"
                                    : "Vui lòng ngưng bán sản phẩm trước khi chỉnh sửa"
                            }
                        >
                            <span>
                                <Button
                                    type="default"
                                    icon={<EditOutlined />}
                                    size="small"
                                    className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                    disabled={!canEdit}
                                    onClick={() => openEditModal(record)}
                                />
                            </span>
                        </Tooltip>
                        <Tooltip
                            title={
                                canEdit
                                    ? "Xóa sản phẩm"
                                    : "Vui lòng ngưng bán sản phẩm trước khi xóa"
                            }
                        >
                            <span>
                                <Button
                                    type="primary"
                                    danger
                                    disabled={!canEdit}
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={handleOpenDelete}
                                />
                            </span>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    // ========================================
    // 5. MODAL HANDLERS
    // ========================================
    const openAddModal = () => {
        setSelectedProduct(null);
        setIsAddModalVisible(true);
    };

    const openEditModal = (record) => {
        setSelectedProduct(record);
        setIsAddModalVisible(true);
    };

    // ========================================
    // 6. API HANDLERS 
    // ========================================
    const handleUpdateStatus = async () => {
        if (!selectedProductForStatus) return;
        try {
            const res = await productService.updateProductStatus(selectedProductForStatus.product_id);
            showNotification(res.data.message, "success");
            setStatusModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification("Cập nhật trạng thái thất bại!", "error");
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;
        try {
            setDeleteLoading(true);
            await productService.deleteProduct(selectedProduct.product_id);
            showNotification("Xóa sản phẩm thành công", "success");
            fetchProducts();
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || "Xóa thất bại", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteLoading(false);
        }
    };

    // ========================================
    // 7. MODAL RENDER 
    // ========================================
    const renderStatusModal = () => {
        const currentStatus = selectedProductForStatus?.status?.toString().trim().normalize("NFC").toLowerCase();
        const actionText = currentStatus === "đang bán" ? "Ngừng bán" : "Kích hoạt bán";

        return (
            <Modal
                title="Xác nhận thay đổi trạng thái"
                open={statusModalOpen}
                onCancel={() => setStatusModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                centered
                okButtonProps={{ danger: currentStatus === "đang bán" }}
                onOk={handleUpdateStatus}
            >
                <p>
                    Bạn có chắc muốn <span className="font-semibold text-red-600">{actionText}</span> sản phẩm:
                    <b> {selectedProductForStatus?.name}</b> không?
                </p>
            </Modal>
        );
    };

    const renderDeleteModal = () => (
        <Modal
            title="Xác nhận xoá sản phẩm"
            open={isDeleteModalOpen}
            onOk={handleDeleteProduct}
            onCancel={() => setIsDeleteModalOpen(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            centered
            okButtonProps={{
                className: "bg-black text-white hover:!bg-white rounded-lg px-5 py-2 font-medium hover:!text-black border-black border-2",
                loading: deleteLoading,
            }}
            cancelButtonProps={{
                className: "bg-white text-black hover:!bg-black rounded-lg px-5 py-2 font-medium hover:!text-white border-black border-2"
            }}
        >
            <p>
                Bạn có chắc muốn xoá sản phẩm:
                <b> {selectedProduct?.name}</b> không?
            </p>
        </Modal>
    );

    // ========================================
    // 8. MAIN RENDER
    // ========================================
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <Header
                searchText={searchText}
                setSearchText={setSearchText}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categories={categoryForHeader}
                onAddItem={openAddModal}
                itemName="sản phẩm"
                addItemOn={true}
            />

            <DataTable
                columns={productColumns}
                dataSource={filteredProducts}
                loading={loading}
                totalText="sản phẩm"
            />

            <ProductDetailModal
                open={isDetailModalOpen}
                product={selectedProduct}
                onClose={() => setIsDetailModalOpen(false)}
            />

            <ProductAddEditModal
                open={isAddModalVisible}
                product={selectedProduct}
                categories={categories}
                onClose={() => setIsAddModalVisible(false)}
                onSuccess={() => {
                    fetchProducts();
                    setIsAddModalVisible(false);
                }}
            />

            {renderStatusModal()}
            {renderDeleteModal()}
        </div>
    );
};

export default ProductManager;