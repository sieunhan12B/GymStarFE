import React, { useContext, useEffect, useState } from 'react';
import { Table, Tag, Button, Image, Space, Card, Descriptions, Modal, Form, Input, InputNumber, Select } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable/DataTable';
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import { productService } from '@/services/product.service';
import { NotificationContext } from "@/App";
import Header from '../../../templates/AdminTemplate/Header';

const { Option } = Select;

const ProductManager = () => {
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isEditVariantModalVisible, setIsEditVariantModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedProductForStatus, setSelectedProductForStatus] = useState(null);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const [form] = Form.useForm();
    const [variantForm] = Form.useForm();
    const [addForm] = Form.useForm();

    const { showNotification } = useContext(NotificationContext);

    // ===== FETCH PRODUCTS =====
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getAll();
            showNotification(response.data.message, "success");
            setData(response.data.data);
        } catch (err) {
            console.error("Lỗi fetch sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ===== UTILITIES =====
    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));

    const getMinPrice = (variants) => Math.min(...variants.map(v => Number(v.price)));

    const mapVariantsWithImages = (product) => {
        if (!product.variants || !product.colors) return [];
        return product.variants.map(variant => {
            const colorGroup = product.colors.find(c => c.color === variant.color);
            return {
                ...variant,
                images: colorGroup ? colorGroup.images : [],
                thumbnail: product.thumbnail
            };
        });
    };

    // ===== VIEW & EDIT =====
    const handleViewDetails = (product) => {
        const variantsWithImages = mapVariantsWithImages(product);
        setSelectedProduct({
            ...product,
            variants: variantsWithImages,
            specs: product.specs || {}
        });
        setIsModalVisible(true);
    };

    const openEditModal = () => {
        form.setFieldsValue({
            name: selectedProduct.name,
            description: selectedProduct.description,
            discount: Number(selectedProduct.discount),
            price: getMinPrice(selectedProduct.variants),
            category_id: selectedProduct.category_id,
            specs: Object.entries(selectedProduct.specs).map(([key, value]) => ({ key, value }))
        });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            const specsObj = {};
            values.specs?.forEach(s => { if (s.key) specsObj[s.key] = s.value; });

            const payload = { ...values, specs: specsObj };

            const res = await productService.updateInfo(selectedProduct.product_id, payload);
            showNotification(res.data.message, "success");
            setIsEditModalVisible(false);
            setIsModalVisible(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification(err.data?.message || "Cập nhật thất bại", "error");
        }
    };

    // ===== VARIANT EDIT =====
    const openEditVariantModal = (variant) => {
        setSelectedVariant(variant);
        variantForm.setFieldsValue({ ...variant });
        setIsEditVariantModalVisible(true);
    };

    const handleEditVariantSubmit = async () => {
        try {
            const values = await variantForm.validateFields();
            const payload = {
                ...values,
                product_id: selectedProduct.product_id
            };
            const res = await productService.updateVariantInfo(selectedVariant.product_variant_id, payload);
            showNotification(res.data.message, "success");
            setIsEditVariantModalVisible(false);
            setIsModalVisible(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification(err.data?.message || "Cập nhật thất bại", "error");
        }
    };

    // ===== ADD PRODUCT =====
    const openAddModal = () => {
        addForm.resetFields();
        setIsAddModalVisible(true);
    };

    const handleAddSubmit = async () => {
        try {
            const values = await addForm.validateFields();
            const specsObj = {};
            values.specs?.forEach(s => { if (s.key) specsObj[s.key] = s.value; });

            const payload = {
                name: values.name,
                category_id: values.category_id,
                description: values.description,
                discount: values.discount || 0,
                spec: specsObj,
                color: values.color,
                price: values.price,
                has_size: values.has_size || false,
                product_variants: values.product_variants || []
            };

            const res = await productService.add(payload);
            showNotification(res.data.message, "success");
            setIsAddModalVisible(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification(err.data?.message || "Thêm sản phẩm thất bại", "error");
        }
    };

    // ===== STATUS UPDATE =====
    const openStatusModal = (product) => {
        setSelectedProductForStatus(product);
        setStatusModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedProductForStatus) return;

        try {
            const res = await productService.updateStatus(selectedProductForStatus.product_id);
            console.log(res)
            showNotification(res.data.message, "success");
            setStatusModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification("Cập nhật trạng thái thất bại!", "error");
        }
    };

    // ===== FILTERING =====
    const filteredData = data.filter(item => {
        const matchesSearch = removeVietnameseTones(item.name).toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category_name === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(data.map(item => item.category_name))];

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
            width: 120,
            render: (status) => {
                let color = status === 'active' ? 'green' : 'red';
                let text = status === 'active' ? 'Đang kinh doanh' : 'Ngừng kinh doanh';
                return <Tag color={color} className="rounded-full">{text}</Tag>;
            }
        },
        {
            title: 'Danh mục',
            dataIndex: 'category_name',
            key: 'category',
            width: 130,
            render: (_, record) => <Tag color="blue" className="rounded-full">{record.parent_category_name ? record.parent_category_name : "—"}/{record.category_name}</Tag>,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            sorter: (a, b) => a.discount - b.discount,
            render: (discount) => discount > 0 ? <Tag color="red" className="rounded-full">{discount}%</Tag> : <Tag color="default" className="rounded-full">0%</Tag>,
        },
        {
            title: 'Biến thể',
            dataIndex: 'product_variants',
            key: 'product_variants',
            width: 100,
            align: 'center',
            render: (product_variants) => <Tag color="purple" className="rounded-full">{product_variants.length} biến thể</Tag>,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'product_variants',
            key: 'stock',
            width: 100,
            align: 'center',
            render: (product_variants) => {
                const totalStock = product_variants?.reduce((sum, v) => sum + v.stock, 0);
                return <Tag color={totalStock > 10 ? 'green' : totalStock > 0 ? 'orange' : 'red'} className="rounded-full">{totalStock}</Tag>;
            },
            sorter: (a, b) => a.product_variants.reduce((sum, v) => sum + v.stock, 0) - b.product_variants.reduce((sum, v) => sum + v.stock, 0),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)}>Xem</Button>
                    <Button
                        type={record.status === 'active' ? 'default' : 'primary'}
                        danger={record.status === 'active'}
                        size="small"
                        onClick={() => openStatusModal(record)}
                    >
                        {record.status === 'active' ? 'Ngừng kinh doanh' : 'Kinh doanh'}
                    </Button>
                </Space>
            ),
        },
    ];

    // ===== MODALS =====
    const renderProductModal = () => (
        <Modal title={null} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={900} centered>
            {selectedProduct && (
                <div className="py-4">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                        <Tag color="blue" className="text-sm">{selectedProduct.parent_category_name ? selectedProduct.parent_category_name : "—"}  /{selectedProduct.category_name}</Tag>
                    </div>
                    <Card className="mb-6 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Image src={selectedProduct.thumbnail} alt={selectedProduct.name} className="rounded-lg w-full" />
                            </div>
                            <div>
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Mô tả">{selectedProduct.description}</Descriptions.Item>
                                    <Descriptions.Item label="Giá gốc"><span className="text-gray-500 line-through">{formatPrice(getMinPrice(selectedProduct.variants))}</span></Descriptions.Item>
                                    <Descriptions.Item label="Giảm giá"><Tag color="red">{selectedProduct.discount}%</Tag></Descriptions.Item>
                                    <Descriptions.Item label="Giá bán"><span className="text-xl font-bold text-green-600">{formatPrice(getMinPrice(selectedProduct.variants))}</span></Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                    </Card>

                    <Card title="Thông số kỹ thuật" className="mb-6" size="small">
                        <Descriptions column={2} bordered size="small">
                            {Object.entries(selectedProduct.specs || {}).map(([key, value]) => (
                                <Descriptions.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>{value}</Descriptions.Item>
                            ))}
                        </Descriptions>
                    </Card>

                    <Card title={`Biến thể sản phẩm (${selectedProduct.variants.length})`} size="small">
                        <Table columns={[
                            { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (text) => <span className="font-mono text-sm">{text}</span> },
                            { title: 'Màu sắc', dataIndex: 'color', key: 'color', render: (color) => <Tag color="cyan">{color}</Tag> },
                            { title: 'Kích thước', dataIndex: 'size', key: 'size', render: (size) => <Tag color="geekblue">{size}</Tag> },
                            { title: 'Giá', dataIndex: 'price', key: 'price', render: (price) => <span className="font-bold text-green-600">{formatPrice(price)}</span> },
                            { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', render: (stock) => <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock} sản phẩm</Tag> },
                            {
                                title: 'Hình ảnh', dataIndex: 'images', key: 'images', render: (images = []) => (
                                    <Image.PreviewGroup>
                                        <div className="flex gap-2">{images.slice(0, 3).map((img, idx) => <Image key={idx} src={img} width={50} height={50} className="rounded object-cover" />)}</div>
                                    </Image.PreviewGroup>
                                )
                            },
                            { title: 'Thao tác', key: 'action', render: (_, variant) => <Button type="link" onClick={() => openEditVariantModal(variant)}>Chỉnh sửa</Button> }
                        ]} dataSource={selectedProduct.variants} rowKey="product_variant_id" pagination={false} size="small" />
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={() => setIsModalVisible(false)}>Đóng</Button>
                        <Button type="primary" icon={<EditOutlined />} size="large" className="bg-orange-500" onClick={openEditModal}>Chỉnh sửa</Button>
                    </div>
                </div>
            )}
        </Modal>
    );

    const renderEditModal = () => (
        <Modal title="Chỉnh sửa sản phẩm" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} onOk={handleEditSubmit} okText="Lưu" width={600} centered>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}><Input /></Form.Item>
                <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
                <Form.Item name="price" label="Giá gốc" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="discount" label="Giảm giá (%)"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="category_id" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}><Select>{data.map(p => <Option key={p.category_id} value={p.category_id}>{p.category_name}</Option>)}</Select></Form.Item>

                <Form.List name="specs">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: 'Nhập key' }]}><Input placeholder="Key" /></Form.Item>
                                    <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Nhập giá trị' }]}><Input placeholder="Giá trị" /></Form.Item>
                                    <Button type="link" onClick={() => remove(name)}>Xóa</Button>
                                </Space>
                            ))}
                            <Button type="dashed" onClick={() => add()} block>Thêm thông số</Button>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );

    const renderEditVariantModal = () => (
        <Modal title="Chỉnh sửa biến thể" open={isEditVariantModalVisible} onCancel={() => setIsEditVariantModalVisible(false)} onOk={handleEditVariantSubmit} okText="Lưu" width={500} centered>
            <Form form={variantForm} layout="vertical">
                <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Nhập SKU' }]}><Input /></Form.Item>
                <Form.Item name="color" label="Màu sắc" rules={[{ required: true, message: 'Nhập màu sắc' }]}><Input /></Form.Item>
                <Form.Item name="size" label="Kích thước" rules={[{ required: true, message: 'Nhập kích thước' }]}><Input /></Form.Item>
                <Form.Item name="stock" label="Tồn kho" rules={[{ required: true, message: 'Nhập tồn kho' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            </Form>
        </Modal>
    );

    const renderAddModal = () => (
        <Modal title="Thêm sản phẩm mới" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} onOk={handleAddSubmit} okText="Thêm" width={600} centered>
            <Form form={addForm} layout="vertical">
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}><Input /></Form.Item>
                <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
                <Form.Item name="category_id" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}><Select>{data.map(p => <Option key={p.category_id} value={p.category_id}>{p.category_name}</Option>)}</Select></Form.Item>
                <Form.Item name="discount" label="Giảm giá (%)"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="color" label="Màu sắc"><Input /></Form.Item>
                <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="has_size" valuePropName="checked">
                    <Select placeholder="Chọn có size không?"><Option value={true}>Có size</Option><Option value={false}>Không có size</Option></Select>
                </Form.Item>

                <Form.List name="specs">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: 'Nhập key' }]}><Input placeholder="Key" /></Form.Item>
                                    <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Nhập giá trị' }]}><Input placeholder="Giá trị" /></Form.Item>
                                    <Button type="link" onClick={() => remove(name)}>Xóa</Button>
                                </Space>
                            ))}
                            <Button type="dashed" onClick={() => add()} block>Thêm thông số</Button>
                        </>
                    )}
                </Form.List>

                <Form.List name="product_variants">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'size']} rules={[{ required: true, message: 'Nhập size' }]}><Input placeholder="Size" /></Form.Item>
                                    <Form.Item {...restField} name={[name, 'stock']} rules={[{ required: true, message: 'Nhập tồn kho' }]}><InputNumber min={0} placeholder="Tồn kho" /></Form.Item>
                                    <Form.Item {...restField} name={[name, 'sku']} rules={[{ required: true, message: 'Nhập SKU' }]}><Input placeholder="SKU" /></Form.Item>
                                    <Button type="link" onClick={() => remove(name)}>Xóa</Button>
                                </Space>
                            ))}
                            <Button type="dashed" onClick={() => add()} block>Thêm biến thể</Button>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );

    const renderStatusModal = () => (
        <Modal
            title="Xác nhận thay đổi trạng thái"
            open={statusModalOpen}
            onCancel={() => setStatusModalOpen(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: selectedProductForStatus?.status === 'active' }}
            onOk={handleUpdateStatus}
        >
            <p>Bạn có chắc muốn {selectedProductForStatus?.status === 'active' ? 'ngừng kinh doanh' : 'kích hoạt'} sản phẩm: <b>{selectedProductForStatus?.name}</b> không?</p>
        </Modal>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm">
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
            <DataTable
                columns={productColumns}
                dataSource={filteredData}
                loading={loading}
                totalText="sản phẩm"
            />
            {renderProductModal()}
            {renderEditModal()}
            {renderEditVariantModal()}
            {renderAddModal()}
            {renderStatusModal()}
        </div>
    );
};

export default ProductManager;
