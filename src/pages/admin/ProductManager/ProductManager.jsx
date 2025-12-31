// React
import React, { useContext, useEffect, useMemo, useState } from "react";

// UI libraries
import {
    Table,
    Tag,
    Button,
    Image,
    Card,
    Descriptions,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Typography,
    Upload,
} from "antd";
import {
    EyeOutlined,
    EditOutlined,
    SyncOutlined,
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";

// Services
import { productService } from "@/services/product.service";
import { danhMucService } from "@/services/category.service";

// Utils
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";
import { formatPrice } from "@/utils/utils";

// Context
import { NotificationContext } from "@/App";

const ProductManager = () => {

    const [addForm] = Form.useForm();
    const { showNotification } = useContext(NotificationContext);

    // ===== STATE =====

    // data
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // ui
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [submitLoading, setSubmitLoading] = useState(false);

    // search & filter
    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // selected
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductForStatus, setSelectedProductForStatus] = useState(null);


    // modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    // ===== FORM / PREVIEW =====
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // ===== CATEGORY LEVEL =====
    const [categoryLevel1, setCategoryLevel1] = useState(null);
    const [categoryLevel2, setCategoryLevel2] = useState(null);
    const [categoryLevel3, setCategoryLevel3] = useState(null);



    // ===== FETCH CATEGORIES =====
    const fetchCategories = async () => {
        try {
            const res = await danhMucService.getAll();
            const data = res?.data?.data || [];
            setCategories(data);
        } catch (err) {
            console.error("Lỗi tải danh mục", err);
        }
    };


    // ===== FETCH PRODUCTS =====
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

    // ===== EFFECTS =====
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);





    // ===== UTILITIES =====

    const mapVariantsWithImages = (product) => {
        if (!product.product_variants || !product.colors) return product.product_variants || [];
        return product.product_variants.map(variant => {
            const colorGroup = product.colors.find(c => c.color === variant.color);
            return {
                ...variant,
                images: colorGroup ? colorGroup.images : [],
                thumbnail: product.thumbnail
            };
        });
    };

    const getLevel2 = (categories, parentId) => {
        if (!parentId) return [];
        const parent = categories.find(c => c.category_id === parentId);
        return parent?.children || [];
    };
    const getLevel3 = (categories, level1Id, level2Id) => {
        const level2List = getLevel2(categories, level1Id);
        const level2 = level2List.find(c => c.category_id === level2Id);
        return level2?.children || [];
    };

    const findCategoryParents = (categories, targetId) => {
        for (const cat of categories) {
            if (cat.category_id === targetId) return { level1: cat.category_id, level2: null, level3: null };

            if (cat.children?.length) {
                for (const child of cat.children) {
                    if (child.category_id === targetId) return { level1: cat.category_id, level2: child.category_id, level3: null };

                    if (child.children?.length) {
                        const level3 = child.children.find(c3 => c3.category_id === targetId);
                        if (level3) return { level1: cat.category_id, level2: child.category_id, level3: level3.category_id };
                    }
                }
            }
        }
        return { level1: null, level2: null, level3: null };
    };

    // ===== FILTERING =====
    const filteredProducts = useMemo(() => {
        const keyword = removeVietnameseTones(searchText).toLowerCase();

        return products.filter(p => {
            const nameMatch = removeVietnameseTones(p.name)
                .toLowerCase()
                .includes(keyword);

            const categoryMatch =
                categoryFilter === "all" ||
                removeVietnameseTones(p.category_name)
                    .toLowerCase() ===
                removeVietnameseTones(categoryFilter).toLowerCase();

            return nameMatch && categoryMatch;
        });
    }, [products, searchText, categoryFilter]);


    const categoryForHeader = ['all', ...Array.from(new Set(products.map(item => item.category_name).filter(Boolean)))];

    // ===== TABLE COLUMNS =====
    const productColumns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 100,
            render: (thumbnail) => <Image src={thumbnail} alt="product" width={60} height={60} className="rounded-lg object-cover" />,
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

                return (
                    <div className="flex justify-between items-center w-full">
                        <Tag color={color} className="rounded-full">
                            {status}
                        </Tag>

                        {/* ICON ĐỔI TRẠNG THÁI */}
                        <Button
                            type="text"
                            onClick={() => openStatusModal(record)}
                            icon={<SyncOutlined />}
                            title="Thay đổi trạng thái"
                        />

                    </div>
                );
            }
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
            }
        },
        {
            title: 'Giá bán',
            key: 'price',
            width: 150,
            render: (_, record) => {
                const price = Number(record.price) || 0;
                const discount = Number(record.discount) || 0;
                const finalPrice = price * (1 - discount / 100);

                return (
                    <span>
                        {discount > 0 && <span className="line-through text-gray-400 mr-1">{formatPrice(price)}</span>}
                        <span className="text-green-600 font-bold">{formatPrice(finalPrice)}</span>
                    </span>
                );
            },
            sorter: (a, b) => {
                const priceA = Number(a.price) * (1 - Number(a.discount) / 100);
                const priceB = Number(b.price) * (1 - Number(b.discount) / 100);
                return priceA - priceB;
            }
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            sorter: (a, b) => Number(a.discount || 0) - Number(b.discount || 0),
            render: (discount) => Number(discount) > 0 ? <Tag color="red" className="rounded-full">{discount}%</Tag> : <Tag className="rounded-full">0%</Tag>,
        },
        {
            title: 'Biến thể',
            dataIndex: 'product_variants',
            key: 'product_variants',
            width: 120,
            align: 'center',
            render: (product_variants = []) => <Tag color="purple" className="rounded-full">{product_variants.length} biến thể</Tag>,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'product_variants',
            key: 'stock',
            width: 120,
            align: 'center',
            render: (product_variants = []) => {
                const totalStock = product_variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
                const color = totalStock > 10 ? 'green' : totalStock > 0 ? 'orange' : 'red';
                return <Tag color={color} className="rounded-full">{totalStock}</Tag>;
            },
            sorter: (a, b) => (a.product_variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0) - (b.product_variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 220,
            fixed: 'right',
            render: (_, record) => {

                return (
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"

                            onClick={() => openDetailModal(record)}
                        />

                        <Button
                            type="default"
                            icon={<EditOutlined />}
                            size="small"
                            className="text-blue-500 border-blue-500 hover:bg-blue-50"

                            onClick={() => openEditModal(record)}
                        />
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => openDeleteModal(record)}
                        />
                    </div>
                );

            }
        },

    ];
    const productDetailColumns = [
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            render: (text) => (
                <span className="font-mono text-sm">{text}</span>
            ),
        },
        {
            title: "Màu sắc",
            dataIndex: "color",
            key: "color",
            render: (color) => (
                <Tag color="cyan">{color}</Tag>
            ),
        },
        {
            title: "Kích thước",
            dataIndex: "size",
            key: "size",
            render: (size) => (
                <Tag color="geekblue">{size}</Tag>
            ),
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            key: "stock",
            render: (stock) => (
                <Tag
                    color={
                        stock > 10
                            ? "green"
                            : stock > 0
                                ? "orange"
                                : "red"
                    }
                >
                    {stock} sản phẩm
                </Tag>
            ),
        },
        {
            title: "Hình ảnh / Video",
            dataIndex: "images",
            key: "images",
            render: (images = []) => (
                <div className="flex gap-2">
                    {images.map((url, idx) => {
                        const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

                        return isVideo ? (
                            <video
                                src={url}
                                controls
                                className="w-[80px] h-[80px] object-cover rounded-lg border"
                            />

                        ) : (
                            <Image
                                key={idx}
                                src={url}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover"
                                preview
                            />
                        );
                    })}
                </div>
            ),
        },

    ]

    // ===== HÀM MỞ MODAL CHI TIẾT SẢN PHẨM =====
    const openDetailModal = (product) => {
        const variantsWithImages = mapVariantsWithImages(product);
        setSelectedProduct({
            ...product,
            variants: variantsWithImages,
            specs: product.spec || product.specs || {}
        });
        setIsDetailModalOpen(true);
    };

    // ===== HÀM MỞ MODAL THÊM SẢN PHẨM =====
    const openAddModal = () => {
        setSelectedProduct(null);
        setThumbnailPreview(null);
        addForm.resetFields();
        setCategoryLevel1(null);
        setCategoryLevel2(null);
        setCategoryLevel3(null);
        setIsAddModalVisible(true);
    };

    // ===== MỞ MODAL SỬA SẢN PHẨM =====
    const openEditModal = (product) => {
        if (!product) return;
        console.log(product)

        // ===== GROUP VARIANTS THEO MÀU =====
        const variantsByColor = (product.product_variants || []).reduce(
            (acc, { color, size, stock }) => {
                if (!acc[color]) acc[color] = { sizes: [], stocks: {} };
                acc[color].sizes.push(size);
                acc[color].stocks[size] = Number(stock) || 0;
                return acc;
            },
            {}
        );

        // ===== BUILD DATA CHO FORM =====
        const variantsWithPreview = Object.entries(variantsByColor).map(
            ([color, data], index) => {
                const colorImages =
                    product.colors?.find(c => c.color === color)?.images || [];

                return {
                    color,
                    sizes: data.sizes,
                    stocks: data.stocks,
                    images: colorImages.map((url, i) => {
                        const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                        return {
                            uid: `variant-${index}-${i}`,
                            name: url.split("/").pop(),
                            status: "done",
                            url,
                            type: isVideo ? "video/mp4" : "image/jpeg",
                        };
                    }),
                };
            }
        );

        // ===== THUMBNAIL =====
        const thumbnailFileList = product.thumbnail
            ? [{
                uid: "thumbnail-1",
                name: product.thumbnail.split("/").pop(),
                status: "done",
                url: product.thumbnail,
            }]
            : [];

        if (product.thumbnail) {
            setThumbnailPreview(product.thumbnail);
        }

        // ===== CATEGORY =====
        const { level1, level2, level3 } = findCategoryParents(
            categories,
            product.category_id
        );

        setCategoryLevel1(level1);
        setCategoryLevel2(level2);
        setCategoryLevel3(level3);

        // ===== SET FORM =====
        addForm.setFieldsValue({
            name: product.name,
            description: product.description,
            price: Number(product.price),
            discount: Number(product.discount || 0),
            category_level_1: level1,
            category_level_2: level2,
            category_level_3: level3,
            spec: product.spec || [],
            variants: variantsWithPreview,
            thumbnail: thumbnailFileList,
        });

        setSelectedProduct(product);
        setIsAddModalVisible(true);
    };




    // ===== HÀM MỞ MODAL SỬA TRẠNG THÁI SẢN PHẨM =====
    const openStatusModal = (product) => {
        setSelectedProductForStatus(product);
        setStatusModalOpen(true);
    };

    // ===== HÀM MỞ MODAL XÁC NHẬN XÓA DANH MỤC =====
    const openDeleteModal = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };



    // ===== XỬ LÝ THÊM SỬA SẢN PHẨM  =====
    const handleSubmitProductForm = async (values) => {
        console.log(values)
        setSubmitLoading(true);
        const oldColors = selectedProduct
            ? selectedProduct.colors?.map(c => c.color)
            : [];

        const oldVariantMap = {};

        if (selectedProduct?.product_variants?.length) {
            selectedProduct.product_variants.forEach(v => {
                const key = `${v.color}_${v.size}`;
                oldVariantMap[key] = true;
            });
        }


        try {
            // ================= UPDATE INFO =================
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append("price", Number(values.price));
            formData.append("discount", Number(values.discount || 0));

            const finalCategoryId =
                values.category_level_3 ||
                values.category_level_2 ||
                values.category_level_1;
            formData.append("category_id", finalCategoryId);

            // thumbnail
            if (values.thumbnail?.length) {
                const file = values.thumbnail[0];
                if (file.originFileObj) formData.append("thumbnail", file.originFileObj);
                else if (file.url) formData.append("thumbnail_url", file.url);
            }

            if (values.spec?.length) {
                formData.append("spec", JSON.stringify(values.spec));
            }

            const updateVariants = [];
            const newColorVariants = [];

            // ================= PHÂN LOẠI VARIANT =================
            for (const variant of values.variants || []) {
                const { color, sizes = [], stocks = {}, images = [] } = variant;

                const isNewColor = !oldColors.includes(color);

                if (isNewColor) {
                    // gom màu mới để gọi ThemBienThe
                    sizes.forEach(size => {
                        newColorVariants.push({
                            color,
                            size,
                            stock: Number(stocks[size] || 0),
                        });
                    });
                } else {
                    // màu cũ
                    for (const size of sizes) {
                        updateVariants.push({
                            color,
                            size,
                            stock: Number(stocks[size] || 0),
                        });

                        const key = `${color}_${size}`;
                        if (!oldVariantMap[key]) {
                            // size mới → gọi ThemSize
                            await productService.addSizeToVariant(
                                selectedProduct.product_id,
                                color,
                                { size, stock: Number(stocks[size] || 0) }
                            );
                        }
                    }
                }

                // xử lý images cho màu cũ
                if (!isNewColor) {
                    const encodedColor = encodeURIComponent(
                        color.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    );

                    const keepOldImages = [];
                    const newImages = [];

                    images.forEach(file => {
                        if (file.originFileObj) newImages.push(file.originFileObj);
                        else if (file.url) keepOldImages.push(file.url);
                    });

                    formData.append(
                        `keep_images[${encodedColor}]`,
                        JSON.stringify(keepOldImages)
                    );

                    newImages.forEach(file => {
                        formData.append(`images[${encodedColor}][]`, file);
                    });
                }
            }

            // update variant cũ
            formData.append("product_variants", JSON.stringify(updateVariants));

            await productService.updateInfo(
                selectedProduct.product_id,
                formData
            );

            // ================= THÊM MÀU MỚI =================
            if (newColorVariants.length > 0) {
                const variantFormData = new FormData();
                variantFormData.append(
                    "variants",
                    JSON.stringify(newColorVariants)
                );

                values.variants.forEach(v => {
                    if (!oldColors.includes(v.color)) {
                        const encodedColor = encodeURIComponent(v.color);
                        v.images?.forEach(file => {
                            if (file.originFileObj) {
                                variantFormData.append(
                                    `images[${encodedColor}][]`,
                                    file.originFileObj
                                );
                            }
                        });
                    }
                });

                await productService.addProductVariant(
                    selectedProduct.product_id,
                    variantFormData
                );
            }

            showNotification("Cập nhật sản phẩm thành công", "success");
            setIsAddModalVisible(false);
            fetchProducts();

        } catch (err) {
            console.error(err);
            showNotification(
                err?.response?.data?.message || "Có lỗi xảy ra",
                "error"
            );
        } finally {
            setSubmitLoading(false);
        }
    };


    // ===== XỬ LÝ THAY ĐỔI TRẠNG THÁI =====
    const handleUpdateStatus = async () => {
        if (!selectedProductForStatus) return;
        try {
            const res = await productService.updateStatus(selectedProductForStatus.product_id);
            showNotification(res.data.message, "success");
            setStatusModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification("Cập nhật trạng thái thất bại!", "error");
        }
    };

    // ===== XỬ LÝ XÓA SẢN PHẨM =====
    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;
        try {
            setDeleteLoading(true); // bật loading
            await productService.del(selectedProduct.product_id);
            showNotification("Xóa sản phẩm thành công", "success");
            fetchProducts(); // tải lại danh sách
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || "Xóa thất bại", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteLoading(false); // tắt loading
        }
    };



    // ===== MODAL CHI TIẾT SẢN PHẨM =====
    const renderDetailProductModal = () => (
        <Modal
            title={null}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            width={900}
            centered
        >
            {selectedProduct && (
                <div className="py-4">
                    {/* ================= HEADER ================= */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Chi tiết sản phẩm
                        </h2>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedProduct.name}
                        </h3>

                        <Tag color="blue" className="text-sm">
                            {selectedProduct.parent_category_name || "—"} /{" "}
                            {selectedProduct.category_name}
                        </Tag>
                    </div>

                    {/* ================= THÔNG TIN CHÍNH ================= */}
                    <Card className="mb-6 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">
                            {/* ---------- Thumbnail ---------- */}
                            <div>
                                <Image
                                    src={selectedProduct.thumbnail}
                                    alt={selectedProduct.name}
                                    className="rounded-lg w-full"
                                />
                            </div>

                            {/* ---------- Thông tin + Spec ---------- */}
                            <div className="flex flex-col gap-4">
                                {/* Giá & mô tả */}
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Mô tả">
                                        <Typography.Paragraph
                                            ellipsis={{
                                                rows: 2,
                                                tooltip: selectedProduct.description,
                                            }}
                                            style={{ marginBottom: 0 }}
                                        >
                                            {selectedProduct.description}
                                        </Typography.Paragraph>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Giá gốc">
                                        <span className="text-gray-500 line-through">
                                            {formatPrice(selectedProduct.price)}
                                        </span>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Giảm giá">
                                        <Tag color="red">{selectedProduct.discount}%</Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Giá bán">
                                        <span className="text-xl font-bold text-green-600">
                                            {formatPrice(
                                                selectedProduct.price *
                                                (1 - selectedProduct.discount / 100)
                                            )}
                                        </span>
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Thông số kỹ thuật */}
                                <Card title="Thông số kỹ thuật" size="small">
                                    {selectedProduct.spec?.length > 0 ? (
                                        <Descriptions column={1} bordered size="small">
                                            {selectedProduct.spec.map((item, index) => (
                                                <Descriptions.Item
                                                    key={index}
                                                    label={item.label}
                                                >
                                                    {item.value}
                                                </Descriptions.Item>
                                            ))}
                                        </Descriptions>
                                    ) : (
                                        <p className="text-gray-500">
                                            Không có thông số kỹ thuật
                                        </p>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </Card>

                    {/* ================= VARIANTS ================= */}
                    <Card
                        title={`Biến thể sản phẩm (${selectedProduct.variants?.length || 0})`}
                        size="small"
                    >
                        <Table
                            dataSource={selectedProduct.variants}
                            rowKey="product_variant_id"
                            pagination={false}
                            size="small"
                            columns={productDetailColumns}
                        />
                    </Card>

                    {/* ================= FOOTER ================= */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={() => setIsDetailModalOpen(false)}>
                            Đóng
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );


    // ===== MODAL THÊM SẢN PHẨM =====
    const renderAddEditModal = () => (

        <Modal
            title={null}
            open={isAddModalVisible}
            onCancel={() => setIsAddModalVisible(false)}
            afterClose={() => {
                setThumbnailPreview(null);

                addForm.resetFields();
                setCategoryLevel1(null);
                setCategoryLevel2(null);
                setCategoryLevel3(null);

            }}
            footer={null}
            width={900}
            centered
        >
            <Form form={addForm} layout="vertical" onFinish={handleSubmitProductForm}>
                <div className="py-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>

                    {/* Tên sản phẩm */}
                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>

                    {/* Danh mục */}
                    <div className="grid grid-cols-3 gap-4 mb-6">

                        {/* Cấp 1 */}
                        <Form.Item
                            label="Danh mục cấp 1"
                            name="category_level_1"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục cấp 1" }]}
                        >
                            <Select
                                placeholder="Chọn danh mục cấp 1"
                                value={categoryLevel1}
                                onChange={(val) => {
                                    setCategoryLevel1(val);
                                    setCategoryLevel2(null);
                                    setCategoryLevel3(null);

                                    addForm.setFieldsValue({
                                        category_level_1: val,
                                        category_level_2: null,
                                        category_level_3: null,
                                    });

                                    // Auto NOSIZE nếu là phụ kiện
                                    if (val === 3) {
                                        const variants = addForm.getFieldValue("variants") || [];
                                        const nextVariants = variants.map(v => ({
                                            ...v,
                                            sizes: [null],          // null cho NoSize
                                            stocks: { null: v?.stocks?.NOSIZE || 0 },
                                        }));
                                        addForm.setFieldValue("variants", nextVariants);
                                    }
                                }}
                                options={categories.map(c => ({ label: c.name, value: c.category_id }))}
                                allowClear
                                optionLabelProp="label"
                                disabled={!!selectedProduct}   // <-- khóa nếu đang edit
                            />
                        </Form.Item>

                        {/* Cấp 2 */}
                        <Form.Item
                            label="Danh mục cấp 2"
                            name="category_level_2"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục cấp 2" }]}
                        >
                            <Select
                                placeholder="Chọn danh mục cấp 2"
                                value={categoryLevel2}
                                disabled={!categoryLevel1 || !!selectedProduct}  // <-- khóa nếu đang edit
                                onChange={(val) => {
                                    setCategoryLevel2(val);
                                    setCategoryLevel3(null);
                                    addForm.setFieldsValue({
                                        category_level_2: val,
                                        category_level_3: null,
                                    });
                                }}
                                options={getLevel2(categories, categoryLevel1).map(c => ({ label: c.name, value: c.category_id }))}
                                allowClear
                                optionLabelProp="label"
                            />
                        </Form.Item>

                        {/* Cấp 3 */}
                        <Form.Item
                            label="Danh mục cấp 3"
                            name="category_level_3"
                        >
                            <Select
                                placeholder="Chọn danh mục cấp 3"
                                value={categoryLevel3}
                                disabled={!categoryLevel2 || !!selectedProduct}  // <-- khóa nếu đang edit
                                onChange={(val) => {
                                    setCategoryLevel3(val);
                                    addForm.setFieldValue("category_level_3", val);
                                }}
                                options={getLevel3(categories, categoryLevel1, categoryLevel2).map(c => ({ label: c.name, value: c.category_id }))}
                                allowClear
                                optionLabelProp="label"
                            />
                        </Form.Item>


                    </div>



                    {/* Thumbnail + Thông tin */}
                    <Card className="mb-6 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Form.Item
                                    name="thumbnail"
                                    label="Ảnh Thumbnail"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => {
                                        const files = e.fileList || [];
                                        console.log(files)
                                        if (files.length > 0) {
                                            setThumbnailPreview(files[0].originFileObj ? URL.createObjectURL(files[0].originFileObj) : files[0].url);
                                        } else {
                                            setThumbnailPreview(null);
                                        }
                                        return files;
                                    }}
                                    rules={!selectedProduct ? [{ required: true, message: "Vui lòng chọn ảnh thumbnail" }] : []}
                                >
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        beforeUpload={() => false}
                                        accept="image/*"
                                    >
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>

                                {thumbnailPreview && (
                                    <Image
                                        src={thumbnailPreview}
                                        alt="Thumbnail"
                                        className="mt-3 rounded-lg"
                                        width="100%"
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Mô tả">
                                        <Form.Item
                                            name="description"
                                            noStyle

                                        >
                                            <Input.TextArea rows={3} placeholder="Mô tả sản phẩm..." />
                                        </Form.Item>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><span style={{ color: 'red' }}>*  </span> <span>Giá gốc</span></>}>
                                        <Form.Item
                                            name="price"

                                            rules={[
                                                { required: true, message: "Vui lòng nhập giá tiền" },
                                                {
                                                    type: "number",
                                                    min: 40000,
                                                    max: 10000000,
                                                    message: "Giá phải từ 40.000 đến 10.000.000"
                                                }
                                            ]}
                                        >
                                            <InputNumber min={0} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giảm giá (%)">
                                        <Form.Item name="discount" noStyle>
                                            <InputNumber min={0} max={99} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                    </Card>

                    {/* Thông số kỹ thuật */}
                    <Card title="Thông số kỹ thuật" size="small" className="mb-6">
                        <Form.List name="spec">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card
                                            key={key}
                                            size="small"
                                            className="mb-3 border rounded bg-gray-50"
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span>Thông số #{key + 1}</span>
                                                    <Button
                                                        danger
                                                        size="small"
                                                        onClick={() => remove(name)}
                                                    >
                                                        X
                                                    </Button>
                                                </div>
                                            }
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={[name, "label"]}
                                                label="Tên"
                                                rules={[{ required: true, message: "Vui lòng nhập tên thông số" }]}
                                            >
                                                <Input placeholder="Ví dụ: Chất liệu" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, "value"]}
                                                label="Giá trị"
                                                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                                            >
                                                <Input placeholder="Ví dụ: Cotton 100%" />
                                            </Form.Item>
                                        </Card>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block>
                                        + Thêm thông số
                                    </Button>
                                </>
                            )}
                        </Form.List>

                    </Card>

                    {/* Biến thể sản phẩm */}
                    <Card title={<><span style={{ color: 'red' }}>*  </span> <span>Biến thể sản phẩm</span></>} size="small">
                        <Form.List name="variants">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name }) => (
                                        <Card
                                            key={key}
                                            size="small"
                                            className="mb-4 border rounded bg-gray-50"
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span>Màu #{key + 1}</span>
                                                    {selectedProduct ? "" : <Button danger size="small" onClick={() => remove(name)}>X</Button>}

                                                </div>
                                            }
                                        >
                                            {/* Tên màu */}
                                            <Form.Item name={[name, "color"]} label="Tên màu" rules={[{ required: true }]}>
                                                <Input placeholder="VD: Đỏ" />
                                            </Form.Item>

                                            {/* Upload ảnh theo màu */}
                                            <Form.Item
                                                label="Ảnh / Video theo màu"
                                                name={[name, "images"]}
                                                valuePropName="fileList"
                                                getValueFromEvent={(e) => e?.fileList || []}
                                            >
                                                <Upload
                                                    listType="picture-card"
                                                    accept="image/*,video/*"
                                                    multiple
                                                    beforeUpload={() => false}
                                                    itemRender={(originNode, file) => {
                                                        if (file.type?.startsWith("video")) {
                                                            return (
                                                                <video
                                                                    className="w-full h-full border rounded-lg object-cover py-2 px-3"
                                                                    src={file.url || URL.createObjectURL(file.originFileObj)}
                                                                    controls

                                                                />
                                                            );
                                                        }
                                                        return originNode;
                                                    }}
                                                >
                                                    + Upload
                                                </Upload>
                                            </Form.Item>



                                            {/* ===== SIZE SELECT – UI MỚI ===== */}
                                            <Form.Item shouldUpdate>
                                                {() => {
                                                    const selectedSizes =
                                                        addForm.getFieldValue(["variants", name, "sizes"]) || [];

                                                    const isAccessory = categoryLevel1 === 3;

                                                    const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

                                                    return (
                                                        <Form.Item
                                                            label="Chọn size"
                                                            name={[name, "sizes"]}
                                                            rules={[
                                                                {
                                                                    validator: (_, value) =>
                                                                        value?.length
                                                                            ? Promise.resolve()
                                                                            : Promise.reject("Chọn ít nhất 1 size"),
                                                                },
                                                            ]}
                                                        >
                                                            <div className="flex flex-wrap gap-3">

                                                                {/* ===== NOSIZE ===== */}
                                                                <Button
                                                                    type="default"
                                                                    disabled={!isAccessory}
                                                                    onClick={() => {
                                                                        addForm.setFieldValue(
                                                                            ["variants", name, "sizes"],
                                                                            [null]  // <-- thay "NOSIZE" bằng null
                                                                        );
                                                                        addForm.setFieldValue(
                                                                            ["variants", name, "stocks"],
                                                                            { null: 0 } // tồn kho duy nhất
                                                                        );
                                                                    }}
                                                                    className={`min-w-[72px] rounded-full font-medium transition-all
                                                                            ${selectedSizes.includes(null)
                                                                            ? "bg-purple-600 text-white border-purple-600"
                                                                            : "bg-white text-gray-700 border-gray-300"
                                                                        }`}
                                                                >
                                                                    No size
                                                                </Button>


                                                                {/* ===== SIZE THƯỜNG ===== */}
                                                                {SIZE_OPTIONS.map(size => {
                                                                    const active = selectedSizes.includes(size);

                                                                    return (
                                                                        <Button
                                                                            key={size}
                                                                            disabled={isAccessory}
                                                                            onClick={() => {
                                                                                const nextSizes = active
                                                                                    ? selectedSizes.filter(s => s !== size)
                                                                                    : [...selectedSizes.filter(s => s !== "NOSIZE"), size];

                                                                                addForm.setFieldValue(
                                                                                    ["variants", name, "sizes"],
                                                                                    nextSizes
                                                                                );

                                                                                if (active) {
                                                                                    const stocks =
                                                                                        addForm.getFieldValue(["variants", name, "stocks"]) || {};
                                                                                    delete stocks[size];
                                                                                    addForm.setFieldValue(
                                                                                        ["variants", name, "stocks"],
                                                                                        { ...stocks }
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className={`
                                    min-w-[48px]
                                    rounded-full
                                    font-medium
                                    transition-all
                                    ${active
                                                                                    ? "bg-blue-600 text-white border-blue-600"
                                                                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                                                                }
                                `}
                                                                        >
                                                                            {size}
                                                                        </Button>
                                                                    );
                                                                })}
                                                            </div>

                                                            {isAccessory && (
                                                                <p className="text-sm text-gray-500 mt-2">
                                                                    ⚠️ Danh mục phụ kiện không sử dụng size
                                                                </p>
                                                            )}
                                                        </Form.Item>
                                                    );
                                                }}
                                            </Form.Item>


                                            {/* ===== STOCK INPUT ===== */}
                                            <Form.Item shouldUpdate>
                                                {() => {
                                                    const sizes =
                                                        addForm.getFieldValue(["variants", name, "sizes"]) || [];

                                                    return (
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {sizes.map(size => (
                                                                <Form.Item
                                                                    key={size}
                                                                    label={`Tồn kho size ${size != null ? size : "No size"}`}
                                                                    name={[name, "stocks", size]}
                                                                    rules={[
                                                                        { required: true, message: "Nhập tồn kho" },
                                                                    ]}
                                                                >
                                                                    <InputNumber min={0} className="w-full" />
                                                                </Form.Item>
                                                            ))}
                                                        </div>
                                                    );
                                                }}
                                            </Form.Item>

                                        </Card>
                                    ))}
                                    <Button type="primary" onClick={() => add()} block>
                                        + Thêm màu mới
                                    </Button>
                                </>
                            )}
                        </Form.List>

                    </Card>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={() => setIsAddModalVisible(false)}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="bg-blue-600"
                            loading={submitLoading}   // <-- thêm dòng này
                        >
                            {selectedProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
                        </Button>

                    </div>
                </div>
            </Form>
        </Modal >
    );

    // ===== MODAL XÁC NHẬN THAY ĐỔI TRẠNG THÁI =====
    const renderStatusModal = () => {
        const currentStatus = selectedProductForStatus?.status
            ?.toString()
            ?.trim()
            ?.normalize("NFC")
            ?.toLowerCase();

        // Text hành động dựa trên trạng thái hiện tại
        const actionText =
            currentStatus === "đang bán"
                ? "Ngừng bán"
                : "Kích hoạt bán";

        return (
            <Modal
                title="Xác nhận thay đổi trạng thái"
                open={statusModalOpen}
                onCancel={() => setStatusModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                centered
                okButtonProps={{
                    danger: currentStatus === "đang bán" // nếu đang bán → nút đỏ
                }}
                onOk={handleUpdateStatus}
            >
                <p>
                    Bạn có chắc muốn
                    <span className="font-semibold text-red-600"> {actionText} </span>
                    sản phẩm:
                    <b> {selectedProductForStatus?.name}</b> không?
                </p>
            </Modal>
        );
    };

    // ===== MODAL XÓA SẢN PHẨM =====
    const renderDeleteModal = () => (
        <Modal
            title="Xác nhận xoá sản phẩm"
            open={isDeleteModalOpen}
            onOk={handleDeleteProduct}
            onCancel={() => setIsDeleteModalOpen(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            centered
            okButtonProps={{
                className:
                    "bg-black text-white hover:!bg-white rounded-lg px-5 py-2 font-medium hover:!text-black border-black border-2",
                loading: deleteLoading, // <-- thêm đây
            }}
            cancelButtonProps={{
                className:
                    "bg-white text-black hover:!bg-black rounded-lg px-5 py-2 font-medium hover:!text-white border-black border-2"
            }}
        >
            <p>
                Bạn có chắc muốn xoá sản phẩm:
                <b> {selectedProduct?.name}</b> không?
            </p>
        </Modal>

    );

    // ========== RENDER HEADER ==========
    const renderHeader = () => (
        <Header
            searchText={searchText}
            setSearchText={setSearchText}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categoryForHeader}
            onAddItem={openAddModal}
            itemName={"sản phẩm"}
            addItemOn={true}
        />
    );

    // ========== RENDER TABLE ==========
    const renderTable = () => (
        <DataTable
            columns={productColumns}
            dataSource={filteredProducts}
            loading={loading}
            totalText="sản phẩm"
        />
    );


    return (
        <div className="bg-white rounded-lg shadow-sm">
            {renderHeader()}
            {renderTable()}


            {renderDetailProductModal()}
            {renderAddEditModal()}

            {renderStatusModal()}
            {renderDeleteModal()}

        </div>
    );
};

export default ProductManager;
