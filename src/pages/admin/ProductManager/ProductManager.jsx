import React, { useContext, useEffect, useState } from 'react';
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
} from 'antd';
import { EyeOutlined, EditOutlined, SyncOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import { productService } from '@/services/product.service';
import { danhMucService } from '@/services/category.service';

import { NotificationContext } from "@/App";
import Header from '../../../templates/AdminTemplate/Header';
import { formatPrice } from '../../../utils/utils';

const ProductManager = () => {

    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);



    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductForStatus, setSelectedProductForStatus] = useState(null);


    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [variantPreviews, setVariantPreviews] = useState({});

    const [categoryLevel1, setCategoryLevel1] = useState(null);
    const [categoryLevel2, setCategoryLevel2] = useState(null);
    const [categoryLevel3, setCategoryLevel3] = useState(null);


    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [categoriesForModal, setCategoriesForModal] = useState([]);


    const [addForm] = Form.useForm();

    const { showNotification } = useContext(NotificationContext);



    // ===== FETCH CATEGORIES =====
    const fetchCategories = async () => {
        try {
            const res = await danhMucService.getAll();
            const data = res?.data?.data || [];
            setCategoriesForModal(data);
        } catch (err) {
            console.error("Lỗi tải danh mục", err);
        }
    };


    // ===== FETCH PRODUCTS =====
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getAll();
            // Optionally show notification on load — you had it previously, keep if desired
            // showNotification(response.data.message, "success");
            setData(response.data.data);
        } catch (err) {
            console.error("Lỗi fetch sản phẩm:", err);
            showNotification("Lỗi khi tải sản phẩm", "error");
        } finally {
            setLoading(false);
        }
    };

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

    const getLevel2 = (categoriesForModal, parentId) => {
        if (!parentId) return [];
        const parent = categoriesForModal.find(c => c.category_id === parentId);
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
    const filteredData = data.filter(item => {
        const normalizedName = removeVietnameseTones(item.name).toLowerCase();
        const normalizedSearch = removeVietnameseTones(searchText).toLowerCase();

        const matchesSearch = normalizedName.includes(normalizedSearch);

        const matchesCategory =
            categoryFilter === "all" ||
            removeVietnameseTones(item.category_name).toLowerCase() ===
            removeVietnameseTones(categoryFilter).toLowerCase();

        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(data.map(item => item.category_name).filter(Boolean)))];

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

                const status = record.status
                    ?.toString()
                    .trim()
                    .normalize("NFC")
                    .toLowerCase();

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
        addForm.resetFields();
        setIsAddModalVisible(true);
    };

    // ===== HÀM MỞ MODAL SỬA SẢN PHẨM =====
    const openEditModal = (product) => {
        if (!product) return;

        const variantsByColor = {};
        (product.product_variants || []).forEach(v => {
            if (!variantsByColor[v.color]) {
                variantsByColor[v.color] = [];
            }
            variantsByColor[v.color].push({ size: v.size, stock: v.stock });
        });

        // 1️⃣ Map biến thể để giữ cấu trúc Form.List
        const variantsWithPreview = Object.entries(variantsByColor).map(([color, items]) => ({
            color,
            images: [], // sẽ set preview từ product.colors
            items
        }));

        // 2️⃣ Set preview ảnh biến thể từ product.colors
        const variantPreviewsObj = {};
        (product.colors || []).forEach(c => {
            const index = variantsWithPreview.findIndex(v => v.color === c.color);
            if (index !== -1) {
                variantPreviewsObj[index] = c.images || [];
            }
        });
        setVariantPreviews(variantPreviewsObj);

        // 3️⃣ Set thumbnail preview
        setThumbnailPreview(product.thumbnail || null);

        if (product.category_id) {
            const { level1, level2, level3 } = findCategoryParents(categoriesForModal, product.category_id);

            setCategoryLevel1(level1);
            setCategoryLevel2(level2);
            setCategoryLevel3(level3);

            // 5️⃣ Set selected product
            setSelectedProduct(product);

            // 6️⃣ Set giá trị cho Form
            addForm.setFieldsValue({
                name: product.name,
                description: product.description,
                price: Number(product.price),
                discount: Number(product.discount || 0),
                category_level_1: level1,
                category_level_2: level2,
                category_level_3: level3,
                spec: product.spec || [],
                variants: variantsWithPreview
            });
        }





        // 7️⃣ Mở modal
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
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("price", Number(values.price));
        formData.append("discount", Number(values.discount || 0));
        const finalCategoryId = values.category_level_3 || values.category_level_2 || values.category_level_1;
        formData.append("category_id", finalCategoryId);

        // 🔹 Xử lý thumbnail: giữ ảnh cũ nếu không chọn mới
        if (values.thumbnail?.[0]) {
            formData.append("thumbnail", values.thumbnail[0]);
        } else if (selectedProduct?.thumbnail) {
            // Backend cần nhận url hoặc tên file cũ, hoặc không gửi gì nếu tự giữ
            // Tùy backend xử lý, ví dụ:
            formData.append("thumbnail_url", selectedProduct.thumbnail);
        }

        // specs
        if (values.spec?.length) formData.append("spec", JSON.stringify(values.spec));

        // variants
        if (values.variants?.length) {
            const productVariantsArray = [];
            values.variants.forEach(variant => {
                variant.items.forEach(item => {
                    productVariantsArray.push({
                        color: variant.color,
                        size: item.size,
                        stock: Number(item.stock),
                    });
                });

                const encodedColor = encodeURIComponent(
                    variant.color.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                );

                variant.images?.forEach(file => {
                    formData.append(`images[${encodedColor}][]`, file);
                });
            });
            formData.append("product_variants", JSON.stringify(productVariantsArray));
        }

        try {
            if (selectedProduct) {
                await productService.updateInfo(selectedProduct.product_id, formData);
                showNotification("Cập nhật sản phẩm thành công", "success");
            } else {
                await productService.add(formData);
                showNotification("Thêm sản phẩm thành công", "success");
            }
            setIsAddModalVisible(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification("Cập nhật thất bại", "error");
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
            await productService.del(selectedProduct.product_id);
            showNotification("Xóa sản phẩm thành công", "success");
            fetchProducts(); // tải lại danh sách
        } catch (error) {
            console.error(error);
            showNotification("Xóa sản phẩm thất bại", "error");
        }finally{
            setIsDeleteModalOpen(false);
        }
    };






    // const renderEditModal = () => (
    //     <Modal
    //         title="Chỉnh sửa sản phẩm"
    //         open={isEditModalVisible}
    //         onCancel={() => setIsEditModalVisible(false)}
    //         onOk={handleEditSubmit}
    //         okText="Lưu thay đổi"
    //         width={650}
    //         centered
    //     >
    //         <Form form={form} layout="vertical">

    //             {/* Tên sản phẩm */}
    //             <Form.Item
    //                 name="name"
    //                 label="Tên sản phẩm"
    //                 rules={[{ required: true, message: "Vui lòng nhập tên" }]}
    //             >
    //                 <Input />
    //             </Form.Item>

    //             {/* Mô tả */}
    //             <Form.Item name="description" label="Mô tả">
    //                 <Input.TextArea rows={3} />
    //             </Form.Item>

    //             {/* Giá */}
    //             <Form.Item
    //                 name="price"
    //                 label="Giá gốc"
    //                 rules={[{ required: true, message: "Vui lòng nhập giá" }]}
    //             >
    //                 <InputNumber min={0} style={{ width: "100%" }} />
    //             </Form.Item>

    //             {/* Giảm giá */}
    //             <Form.Item name="discount" label="Giảm giá (%)">
    //                 <InputNumber min={0} max={100} style={{ width: "100%" }} />
    //             </Form.Item>

    //             {/* Danh mục */}
    //             <Form.Item
    //                 name="category_id"
    //                 label="Danh mục"
    //                 rules={[{ required: true, message: "Chọn danh mục" }]}
    //             >
    //                 <Select>
    //                     {categoriesForModal.map(c => (
    //                         <Select.Option key={c.category_id} value={c.category_id}>
    //                             {c.name}
    //                         </Select.Option>
    //                     ))}
    //                 </Select>
    //             </Form.Item>

    //             {/* Upload Thumbnail */}
    //             <Form.Item label="Ảnh thumbnail">
    //                 <Upload
    //                     listType="picture-card"
    //                     beforeUpload={(file) => {
    //                         setThumbnailFile(file);
    //                         setThumbnailPreview(URL.createObjectURL(file));
    //                         return false;
    //                     }}
    //                     showUploadList={false}
    //                 >
    //                     {thumbnailPreview ? (
    //                         <img
    //                             src={thumbnailPreview}
    //                             alt="thumbnail"
    //                             style={{ width: "100%", height: "100%", objectFit: "cover" }}
    //                         />
    //                     ) : (
    //                         <PlusOutlined />
    //                     )}
    //                 </Upload>
    //             </Form.Item>

    //             {/* SPEC */}
    //             <Form.List name="specs">
    //                 {(fields, { add, remove }) => (
    //                     <>
    //                         {fields.map(({ key, name, ...rest }) => (
    //                             <Space
    //                                 key={key}
    //                                 style={{ display: "flex", marginBottom: 8 }}
    //                                 align="baseline"
    //                             >
    //                                 <Form.Item
    //                                     {...rest}
    //                                     name={[name, "label"]}
    //                                     rules={[{ required: true, message: "Nhập tên thông số" }]}
    //                                 >
    //                                     <Input placeholder="Tên thông số" />
    //                                 </Form.Item>

    //                                 <Form.Item
    //                                     {...rest}
    //                                     name={[name, "value"]}
    //                                     rules={[{ required: true, message: "Nhập giá trị" }]}
    //                                 >
    //                                     <Input placeholder="Giá trị" />
    //                                 </Form.Item>

    //                                 <Button danger onClick={() => remove(name)}>
    //                                     Xóa
    //                                 </Button>
    //                             </Space>
    //                         ))}

    //                         <Button type="dashed" onClick={() => add()} block>
    //                             + Thêm thông số
    //                         </Button>
    //                     </>
    //                 )}
    //             </Form.List>

    //         </Form>
    //     </Modal>
    // );


    // const handleEditSubmit = async () => {
    //     try {
    //         const values = await form.validateFields();

    //         const formData = new FormData();

    //         formData.append("name", values.name);
    //         formData.append("description", values.description || "");
    //         formData.append("price", values.price);
    //         formData.append("discount", values.discount || 0);
    //         formData.append("category_id", values.category_id);

    //         // specs: array -> stringify JSON
    //         formData.append("spec", JSON.stringify(values.specs || []));

    //         // append thumbnail nếu người dùng đổi ảnh
    //         if (thumbnailFile) {
    //             formData.append("thumbnail", thumbnailFile);
    //         }

    //         const res = await productService.updateInfo(
    //             selectedProduct.product_id,
    //             formData
    //         );

    //         showNotification(res.data.message, "success");
    //         setIsEditModalVisible(false);
    //         setIsDetailModalOpen(false);
    //         fetchProducts();

    //     } catch (err) {
    //         console.error(err);
    //         showNotification("Cập nhật thất bại", "error");
    //     }
    // };








    // ===== MODAL CHI TIẾT SẢN PHẨM =====
    const renderDetailProductModal = () => (
        <Modal title={null} open={isDetailModalOpen} onCancel={() => setIsDetailModalOpen(false)} footer={null} width={900} centered>
            {selectedProduct && (

                <div className="py-4">
                    <div className="mb-6">
                        {/* Tên sản phẩm  */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Chi tiết sản phẩm</h2>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>

                        <Tag color="blue" className="text-sm">
                            {selectedProduct.parent_category_name ? selectedProduct.parent_category_name : "—"}  / {selectedProduct.category_name}
                        </Tag>
                    </div>

                    <Card className="mb-6 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">

                            {/* Ảnh */}
                            <div>
                                <Image
                                    src={selectedProduct.thumbnail}
                                    alt={selectedProduct.name}
                                    className="rounded-lg w-full"
                                />
                            </div>

                            {/* Thông tin + Thông số kỹ thuật */}
                            <div className="flex flex-col gap-4">

                                {/* Mô tả - Giá */}
                                <Descriptions column={1} bordered size="small">


                                    <Descriptions.Item label="Mô tả">
                                        <Typography.Paragraph
                                            ellipsis={{
                                                rows: 2,
                                                expandable: false,
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
                                                selectedProduct.price * (1 - selectedProduct.discount / 100)
                                            )}
                                        </span>
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Thông số kỹ thuật */}
                                <Card title="Thông số kỹ thuật" size="small">
                                    {selectedProduct.spec && selectedProduct.spec.length > 0 ? (
                                        <Descriptions column={1} bordered size="small">
                                            {selectedProduct.spec.map((item, index) => (
                                                <Descriptions.Item key={index} label={item.label}>
                                                    {item.value}
                                                </Descriptions.Item>
                                            ))}
                                        </Descriptions>
                                    ) : (
                                        <p className="text-gray-500">Không có thông số kỹ thuật</p>
                                    )}
                                </Card>


                            </div>
                        </div>
                    </Card>



                    <Card title={`Biến thể sản phẩm (${selectedProduct.variants?.length || 0})`} size="small">
                        <Table columns={[
                            { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (text) => <span className="font-mono text-sm">{text}</span> },
                            { title: 'Màu sắc', dataIndex: 'color', key: 'color', render: (color) => <Tag color="cyan">{color}</Tag> },
                            { title: 'Kích thước', dataIndex: 'size', key: 'size', render: (size) => <Tag color="geekblue">{size}</Tag> },

                            { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', render: (stock) => <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock} sản phẩm</Tag> },
                            {
                                title: 'Hình ảnh', dataIndex: 'images', key: 'images', render: (images = []) => (
                                    <Image.PreviewGroup>
                                        <div className="flex gap-2">{(images || []).slice(0, 3).map((img, idx) => <Image key={idx} src={img} width={50} height={50} className="rounded object-cover" />)}</div>
                                    </Image.PreviewGroup>
                                )
                            },
                            // { title: 'Thao tác', key: 'action', render: (_, variant) => <Button type="link" onClick={() => openEditVariantModal(variant)}>Chỉnh sửa</Button> }
                        ]} dataSource={selectedProduct.variants} rowKey="product_variant_id" pagination={false} size="small" />
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>

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
                setVariantPreviews({});
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
                                    console.log(categoryLevel1)
                                    setCategoryLevel2(null);
                                    setCategoryLevel3(null);
                                    addForm.setFieldsValue({
                                        category_level_1: val,
                                        category_level_2: null,
                                        category_level_3: null
                                    });
                                }}
                                options={categoriesForModal.map(c => ({ label: c.name, value: c.category_id }))}
                                allowClear
                                optionLabelProp="label" // quan trọng

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
                                disabled={!categoryLevel1}
                                onChange={(val) => {
                                    console.log(val);
                                    setCategoryLevel2(val);
                                    setCategoryLevel3(null);
                                    addForm.setFieldsValue({
                                        category_level_2: val,
                                        category_level_3: null
                                    });
                                }}
                                options={getLevel2(categoriesForModal, categoryLevel1).map(c => ({ label: c.name, value: c.category_id }))}
                                allowClear
                                optionLabelProp="label" // ← Thêm dòng này


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
                                disabled={!categoryLevel2}
                                onChange={(val) => {
                                    setCategoryLevel3(val);
                                    addForm.setFieldValue("category_level_3", val);
                                }}
                                options={getLevel3(categoriesForModal, categoryLevel1, categoryLevel2).map(c => ({ label: c.name, value: c.category_id }))}
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
                                        const files = e.target.files ? Array.from(e.target.files) : [];
                                        if (files.length > 0) setThumbnailPreview(URL.createObjectURL(files[0]));
                                        return files;
                                    }}
                                    rules={
                                        !selectedProduct
                                            ? [{ required: true, message: "Vui lòng chọn ảnh thumbnail" }]
                                            : []
                                    }
                                >
                                    <input type="file" accept="image/*" />
                                </Form.Item>

                                {thumbnailPreview && (
                                    <Image src={thumbnailPreview} alt="Thumbnail" className="mt-3 rounded-lg" width="100%" />
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
                        <Form.List
                            name="variants"
                        >
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
                                                    <Button danger size="small" onClick={() => {
                                                        remove(name);
                                                        setVariantPreviews(prev => {
                                                            const copy = { ...prev };
                                                            delete copy[name];
                                                            return copy;
                                                        });
                                                    }}>X</Button>
                                                </div>
                                            }
                                        >
                                            <Form.Item
                                                name={[name, "color"]}
                                                label="Tên màu"
                                                rules={[{ required: true }]}
                                            >
                                                <Input placeholder="VD: Đỏ" />
                                            </Form.Item>

                                            <Form.Item
                                                name={[name, "images"]}
                                                label="Ảnh theo màu"
                                                valuePropName="fileList"
                                                getValueFromEvent={(e) => {
                                                    const files = e.target.files ? Array.from(e.target.files) : [];
                                                    setVariantPreviews(prev => ({
                                                        ...prev,
                                                        [name]: files.length > 0 ? files.map(f => URL.createObjectURL(f)) : prev[name] || []
                                                    }));
                                                    return files;
                                                }}
                                                rules={
                                                    !selectedProduct
                                                        ? [{ required: true, message: "Vui lòng chọn ảnh" }]
                                                        : []
                                                }
                                            >
                                                <input type="file" accept="image/*" multiple />
                                            </Form.Item>


                                            {/* Preview ảnh */}
                                            {variantPreviews[name]?.length > 0 && (
                                                <div className="flex gap-2 mb-3">
                                                    {variantPreviews[name].map((url, idx) => (
                                                        <Image key={idx} src={url} width={50} height={50} className="rounded" />
                                                    ))}
                                                </div>
                                            )}


                                            {/* SIZE + STOCK */}
                                            <Form.List name={[name, "items"]}>
                                                {(subFields, subOps) => (
                                                    <>
                                                        {subFields.map(({ key: k2, name: n2 }) => (
                                                            <div key={k2} className="flex gap-3 mb-3">
                                                                <Form.Item
                                                                    name={[n2, "size"]}
                                                                    label="Size"
                                                                    className="flex-1"

                                                                >
                                                                    <Input placeholder="VD: S, M, L hoặc 20mm" />
                                                                </Form.Item>

                                                                <Form.Item
                                                                    name={[n2, "stock"]}
                                                                    label="Tồn kho"
                                                                    rules={[
                                                                        { required: true, message: "Vui lòng nhập số lượng tồn kho" },
                                                                        {
                                                                            type: "number",
                                                                            min: 1,
                                                                            max: 10000,
                                                                            message: "Số lượng tồn kho phải từ 1 đến 10.000"
                                                                        }
                                                                    ]}
                                                                    className="w-32"
                                                                >
                                                                    <InputNumber min={1} max={10000} />
                                                                </Form.Item>

                                                                <Button danger onClick={() => subOps.remove(n2)}>X</Button>
                                                            </div>
                                                        ))}

                                                        <Button type="dashed" onClick={() => subOps.add()} block>
                                                            + Thêm size
                                                        </Button>
                                                    </>
                                                )}
                                            </Form.List>

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
                        <Button type="primary" htmlType="submit" size="large" className="bg-blue-600">{selectedProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}</Button>
                    </div>
                </div>
            </Form>
        </Modal>
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
                    "bg-black text-white hover:!bg-white rounded-lg px-5 py-2 font-medium hover:!text-black border-black border-2"
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
            categories={categories}
            onAddItem={openAddModal}
            itemName={"sản phẩm"}
            addItemOn={true}
        />
    );

    // ========== RENDER TABLE ==========
    const renderTable = () => (
        <DataTable
            columns={productColumns}
            dataSource={filteredData}
            loading={loading}
            totalText="sản phẩm"
        />
    );






    return (
        <div className="bg-white rounded-lg shadow-sm">
            {renderHeader()}
            {renderTable()}
            {renderDetailProductModal()}
            {/* {renderEditModal()} */}
            {renderAddEditModal()}
            {renderStatusModal()}
            {renderDeleteModal()}

        </div>
    );
};

export default ProductManager;
