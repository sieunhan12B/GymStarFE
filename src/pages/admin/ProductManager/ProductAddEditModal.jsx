import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Button,
    Card,
    Image,
    Tag,
    Tooltip,
    Descriptions,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { NotificationContext } from "@/App";
import { normalizeText } from "../../../utils/normalizeText";
import { formatPrice } from "@/utils/formatPrice";
import { productService } from "@/services/product.service";

const COMMON_SPECS = ["Chất liệu", "Kiểu dáng", "Xuất xứ"];
const BASIC_COLORS = [
    "Đỏ",
    "Xanh",
    "Vàng",
    "Cam",
    "Tím",
    "Hồng",
    "Đen",
    "Trắng",
    "Xám",
    "Nâu",

];



const ProductAddEditModal = ({
    open,
    product, // null = thêm mới, object = sửa
    categories,
    onClose,
    onSuccess, // callback sau khi thành công (reload danh sách)
}) => {
    const [form] = Form.useForm();
    const { showNotification } = useContext(NotificationContext);

    // ===========================================================================
    // 1. STATE NỘI BỘ
    // ===========================================================================
    const [submitLoading, setSubmitLoading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Category levels
    const [categoryLevel1, setCategoryLevel1] = useState(null);
    const [categoryLevel2, setCategoryLevel2] = useState(null);
    const [categoryLevel3, setCategoryLevel3] = useState(null);

    // Refs để lưu danh sách cần xóa (gửi API riêng)
    const deletedColorsRef = useRef(new Set());
    const deletedVariantIds = useRef([]);

    // Set các màu cũ (khi edit) để so sánh
    const oldColorSet = useMemo(() => {
        if (!product?.colors) return new Set();
        return new Set(product.colors.map((c) => c.color));
    }, [product]);

    // ===========================================================================
    // 2. UTILITY FUNCTIONS
    // ===========================================================================

    // Tìm parents danh mục (cấp 1, 2, 3)
    const findCategoryParents = (categories, targetId) => {
        for (const cat of categories) {
            if (cat.category_id === targetId) return { level1: cat.category_id, level2: null, level3: null };

            if (cat.children?.length) {
                for (const child of cat.children) {
                    if (child.category_id === targetId) return { level1: cat.category_id, level2: child.category_id, level3: null };

                    if (child.children?.length) {
                        const level3Cat = child.children.find((c3) => c3.category_id === targetId);
                        if (level3Cat) return { level1: cat.category_id, level2: child.category_id, level3: level3Cat.category_id };
                    }
                }
            }
        }
        return { level1: null, level2: null, level3: null };
    };

    // Map size cũ theo màu
    const buildOldSizeMap = (prod) => {
        const map = {};
        (prod?.product_variants || []).forEach((v) => {
            if (!map[v.color]) map[v.color] = new Set();
            map[v.color].add(v.size);
        });
        return map;
    };

    // Map (color + size) → variant_id (dùng để xóa size)
    const buildVariantIdMap = (prod) => {
        const map = {};
        (prod?.product_variants || []).forEach((v) => {
            if (!map[v.color]) map[v.color] = {};
            map[v.color][v.size] = v.product_variant_id;
        });
        return map;
    };

    // Build danh sách variants khi tạo mới
    const buildVariantsForCreate = (values) => {
        const variants = [];
        values.variants?.forEach((variant) => {
            const { color, sizes = [], stocks = {}, prices = {} } = variant;
            sizes.forEach((size) => {
                variants.push({
                    color,
                    size,
                    stock: Number(stocks?.[size] || 0),
                    price: Number(prices?.[size] || 0),
                });
            });
        });
        return variants;
    };

    // Lấy variants mới (chỉ màu mới)
    const extractNewVariants = (values) => {
        const newVariants = [];
        values.variants?.forEach((variant) => {
            if (oldColorSet.has(variant.color)) return;
            const sizes = variant.sizes || [];
            sizes.forEach((size) => {
                newVariants.push({
                    color: variant.color,
                    size,
                    stock: Number(variant.stocks?.[size] || 0),
                    price: Number(variant.prices?.[size] || 0),
                });
            });
        });
        return newVariants;
    };

    // Build FormData chung (dùng cho cả create và update info)
    const buildFormData = (values) => {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("discount", Number(values.discount || 0));

        const finalCategoryId =
            values.category_level_3 || values.category_level_2 || values.category_level_1;
        formData.append("category_id", finalCategoryId);

        // Thumbnail
        if (values.thumbnail?.length) {
            const file = values.thumbnail[0];
            if (file.originFileObj) formData.append("thumbnail", file.originFileObj);
            else if (file.url) formData.append("thumbnail_url", file.url);
        }

        // Specs
        if (values.spec?.length) formData.append("spec", JSON.stringify(values.spec));

        // Variants + Images
        const productVariants = [];
        values.variants?.forEach((variant) => {
            if (!variant.color || !variant.sizes?.length) return;

            const color = variant.color.trim();
            const encodedColor = encodeURIComponent(color.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

            variant.sizes.forEach((sizeRaw) => {
                const size = sizeRaw === null ? null : sizeRaw;
                productVariants.push({
                    color,
                    size,
                    stock: Number(variant.stocks?.[sizeRaw] ?? 0),
                    price: Number(variant.prices?.[sizeRaw] ?? 0),
                });
            });

            // Xử lý ảnh
            const keepOldImages = [];
            const newImages = [];
            (variant.images || []).forEach((file) => {
                if (file.originFileObj) newImages.push(file.originFileObj);
                else if (file.url) keepOldImages.push(file.url);
            });

            if (product) {
                formData.append(`keep_images[${encodedColor}]`, JSON.stringify(keepOldImages));
            }
            newImages.forEach((file) => formData.append(`images[${encodedColor}][]`, file));
        });

        if (!productVariants.length) throw new Error("Sản phẩm phải có ít nhất 1 biến thể hợp lệ");
        formData.append("product_variants", JSON.stringify(productVariants));

        return formData;
    };

    // Build FormData chỉ để thêm variant mới (màu mới)
    const buildAddVariantFormData = (values, newVariants) => {
        const formData = new FormData();
        formData.append("variants", JSON.stringify(newVariants));

        values.variants?.forEach((variant) => {
            if (!newVariants.some((v) => v.color === variant.color)) return;
            const encodedColor = encodeURIComponent(variant.color.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            (variant.images || []).forEach((file) => {
                if (file.originFileObj) formData.append(`images[${encodedColor}][]`, file.originFileObj);
            });
        });

        return formData;
    };

    // Xóa màu (UI + ref nếu là màu cũ)
    const handleDeleteColor = (color, index) => {
        if (color && product && oldColorSet.has(color)) {
            deletedColorsRef.current.add(color);
        }

        const variants = form.getFieldValue("variants") || [];
        form.setFieldValue("variants", variants.filter((_, i) => i !== index));
    };

    // Load danh mục cấp 2, 3
    const getLevel2 = (categories, parentId) => {
        if (!parentId) return [];
        const parent = categories.find((c) => c.category_id === parentId);
        return parent?.children || [];
    };

    const getLevel3 = (categories, level1Id, level2Id) => {
        const level2List = getLevel2(categories, level1Id);
        const level2 = level2List.find((c) => c.category_id === level2Id);
        return level2?.children || [];
    };

    // ===========================================================================
    // 3. EFFECTS – Chuẩn bị data khi mở modal edit
    // ===========================================================================
    useEffect(() => {
        if (product && open) {
            // Group variants theo màu
            const variantsByColor = (product.product_variants || []).reduce((acc, v) => {
                if (!acc[v.color]) acc[v.color] = { sizes: [], stocks: {}, prices: {} };
                acc[v.color].sizes.push(v.size);
                acc[v.color].stocks[v.size] = Number(v.stock) || 0;
                acc[v.color].prices[v.size] = Number(v.price) || 0;
                return acc;
            }, {});

            const variantsWithPreview = Object.entries(variantsByColor).map(([color, data], index) => {
                const colorImages = product.colors?.find((c) => c.color === color)?.images || [];
                return {
                    color,
                    sizes: data.sizes,
                    stocks: data.stocks,
                    prices: data.prices,
                    images: colorImages.map((url, i) => ({
                        uid: `variant-${index}-${i}`,
                        name: url.split("/").pop(),
                        status: "done",
                        url,
                        type: /\.(mp4|webm|ogg)$/i.test(url) ? "video/mp4" : "image/jpeg",
                    })),
                };
            });

            // Thumbnail
            const thumbnailFileList = product.thumbnail
                ? [{
                    uid: "thumbnail-1",
                    name: product.thumbnail.split("/").pop(),
                    status: "done",
                    url: product.thumbnail,
                }]
                : [];

            // Category parents
            const { level1, level2, level3 } = findCategoryParents(categories, product.category_id);

            // Set state + form
            setCategoryLevel1(level1);
            setCategoryLevel2(level2);
            setCategoryLevel3(level3);
            setThumbnailPreview(product.thumbnail || null);

            form.setFieldsValue({
                name: product.name,
                description: product.description,
                discount: Number(product.discount || 0),
                category_level_1: level1,
                category_level_2: level2,
                category_level_3: level3,
                spec: product.spec || [],
                variants: variantsWithPreview,
                thumbnail: thumbnailFileList,
            });
        } else if (!open) {
            // Cleanup khi đóng
            form.resetFields();
            setThumbnailPreview(null);
            deletedColorsRef.current.clear();
            deletedVariantIds.current = [];
            setCategoryLevel1(null);
            setCategoryLevel2(null);
            setCategoryLevel3(null);
        }
    }, [product, open, categories, form]);

    // ===========================================================================
    // 4. SUBMIT HANDLERS – Tách riêng từng bước
    // ===========================================================================

    // Xử lý xóa size
    const handleDeleteSizes = async () => {
        for (const variantId of deletedVariantIds.current) {
            await productService.deleteSize(variantId);
        }
        deletedVariantIds.current = [];
    };

    // Xử lý xóa biến thể theo màu
    const handleDeleteColors = async () => {
        for (const color of deletedColorsRef.current) {
            await productService.deleteVariantByColor(product.product_id, color);
        }
        deletedColorsRef.current.clear();
    };

    // Xử lý thêm biến thể mới ( thêm cả màu và size)
    const handleAddNewVariants = async (values) => {
        const newVariants = extractNewVariants(values);
        if (newVariants.length > 0) {
            const fd = buildAddVariantFormData(values, newVariants);
            await productService.addProductVariant(product.product_id, fd);
        }
    };

    // Xử lý thêm size mới ( thêm biến thể size cho màu cụ thể)
    const handleAddNewSizesToOldColors = async (values) => {
        const oldSizeMap = buildOldSizeMap(product);
        const oldColors = new Set(product.colors?.map((c) => c.color) || []);

        for (const variant of values.variants || []) {
            const color = variant.color;
            if (!oldColors.has(color)) continue;

            const oldSizes = oldSizeMap[color] || new Set();
            for (const size of variant.sizes || []) {
                if (size === null || oldSizes.has(size)) continue;

                await productService.addSizeToVariant(product.product_id, color, {
                    size,
                    stock: Number(variant.stocks?.[size] || 0),
                    price: Number(variant.prices?.[size] || 0),
                });
            }
        }
    };

    // Xử lý cập nhật sản phẩm
    const handleUpdateProductInfo = async (values) => {
        const formData = buildFormData(values);
        await productService.updateProductInfo(product.product_id, formData);
    };

    // Xử lý tạo sản phẩm mới
    const handleCreateNewProduct = async (values) => {
        const productVariants = buildVariantsForCreate(values);
        if (!productVariants.length) throw new Error("Cần ít nhất 1 biến thể");

        const formData = buildFormData(values);
        await productService.createProduct(formData);
    };

    // Main submit – điều phối các bước
    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            if (!product) {
                // THÊM MỚI
                await handleCreateNewProduct(values);
            } else {
                // CẬP NHẬT
                await handleDeleteSizes();
                await handleDeleteColors();
                await handleAddNewVariants(values);
                await handleAddNewSizesToOldColors(values);
                await handleUpdateProductInfo(values);
            }

            showNotification("Thành công!", "success");
            onSuccess();
        } catch (err) {
            console.error(err);
            showNotification(err?.response?.data?.message || "Thao tác thất bại", "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    // ===========================================================================
    // 5. RENDER
    // ===========================================================================
    return (
        <Modal title={null} open={open} onCancel={onClose} footer={null} width={900} centered>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div className="py-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                    </h2>

                    {/* === TÊN SẢN PHẨM === */}
                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>

                    {/* === DANH MỤC === */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Form.Item label="Danh mục cấp 1" name="category_level_1" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn danh mục cấp 1"
                                value={categoryLevel1}
                                onChange={(val) => {
                                    setCategoryLevel1(val);
                                    setCategoryLevel2(null);
                                    setCategoryLevel3(null);
                                    form.setFieldsValue({
                                        category_level_1: val,
                                        category_level_2: null,
                                        category_level_3: null,
                                    });

                                    if (val === 3) {
                                        const variants = form.getFieldValue("variants") || [];
                                        const nextVariants = variants.map((v) => ({
                                            ...v,
                                            sizes: [null],
                                            stocks: { null: v?.stocks?.null || 0 },
                                        }));
                                        form.setFieldValue("variants", nextVariants);
                                    }
                                }}
                                options={categories.map((c) => ({ label: c.name, value: c.category_id }))}
                                allowClear
                                disabled={!!product}
                            />
                        </Form.Item>

                        <Form.Item label="Danh mục cấp 2" name="category_level_2" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn danh mục cấp 2"
                                value={categoryLevel2}
                                disabled={!categoryLevel1 || !!product}
                                onChange={(val) => {
                                    setCategoryLevel2(val);
                                    setCategoryLevel3(null);
                                    form.setFieldsValue({ category_level_2: val, category_level_3: null });
                                }}
                                options={getLevel2(categories, categoryLevel1).map((c) => ({
                                    label: c.name,
                                    value: c.category_id,
                                }))}
                                allowClear
                            />
                        </Form.Item>

                        <Form.Item
                            label="Danh mục cấp 3"
                            name="category_level_3"
                            rules={[
                                {
                                    required: getLevel3(categories, categoryLevel1, categoryLevel2).length > 0,
                                    message: "Vui lòng chọn danh mục chi tiết",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn danh mục cấp 3"
                                value={categoryLevel3}
                                disabled={!categoryLevel2 || !!product}
                                onChange={(val) => {
                                    setCategoryLevel3(val);
                                    form.setFieldValue("category_level_3", val);
                                }}
                                options={getLevel3(categories, categoryLevel1, categoryLevel2).map((c) => ({
                                    label: c.name,
                                    value: c.category_id,
                                }))}
                                allowClear
                            />
                        </Form.Item>
                    </div>

                    {/* === THUMBNAIL & MÔ TẢ === */}
                    <Card className="mb-6 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Form.Item
                                    name="thumbnail"
                                    label="Ảnh Thumbnail"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => {
                                        const files = e.fileList || [];
                                        if (files.length > 0) {
                                            setThumbnailPreview(
                                                files[0].originFileObj
                                                    ? URL.createObjectURL(files[0].originFileObj)
                                                    : files[0].url
                                            );
                                        } else {
                                            setThumbnailPreview(null);
                                        }
                                        return files;
                                    }}
                                    rules={!product ? [{ required: true, message: "Vui lòng chọn ảnh thumbnail" }] : []}
                                >
                                    <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                                {thumbnailPreview && (
                                    <Image src={thumbnailPreview} alt="Thumbnail" className="mt-3 rounded-lg" width="100%" />
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Mô tả">
                                        <Form.Item name="description" noStyle>
                                            <Input.TextArea rows={3} placeholder="Mô tả sản phẩm..." />
                                        </Form.Item>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giảm giá (%)">
                                        <Form.Item name="discount" noStyle>
                                            <InputNumber
                                                min={1}
                                                max={99} // giới hạn 100% nếu là %
                                                style={{ width: "100%" }}
                                                formatter={(value) => {
                                                    if (!value) return "";
                                                    return `${value} %`;

                                                }}
                                                parser={(value) => value.replace(/\D/g, "")} // loại bỏ ký tự không phải số
                                            />
                                        </Form.Item>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                    </Card>

                    {/* === THÔNG SỐ KỸ THUẬT === */}
                    {/* === THÔNG SỐ KỸ THUẬT === */}
                    <Card title="Thông số kỹ thuật" size="small" className="mb-6">
                        <Form.List name="spec">
                            {(fields, { add, remove }) => (
                                <>
                                    {/* Toggle spec phổ biến */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {COMMON_SPECS.map((specName) => {
                                            const isSelected = fields.some(
                                                ({ name }) => form.getFieldValue(["spec", name, "label"]) === specName
                                            );
                                            return (
                                                <Button
                                                    key={specName}
                                                    type={isSelected ? "primary" : "default"}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            // bỏ spec nếu đã chọn
                                                            const idx = fields.find(
                                                                ({ name }) => form.getFieldValue(["spec", name, "label"]) === specName
                                                            )?.name;
                                                            if (idx !== undefined) remove(idx);
                                                        } else {
                                                            add({ label: specName, value: "" });
                                                        }
                                                    }}
                                                >
                                                    {specName}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Render các spec đang có */}
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card
                                            key={key}
                                            size="small"
                                            className="mb-3 border rounded bg-gray-50"
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span>{form.getFieldValue(["spec", name, "label"]) || `Thông số #${key + 1}`}</span>
                                                    <Button danger size="small" onClick={() => remove(name)}>
                                                        X
                                                    </Button>
                                                </div>
                                            }
                                        >
                                            <Form.Item
                                                {...restField}
                                                label="Tên thông số"
                                                name={[name, "label"]}
                                                rules={[{ required: true, message: "Vui lòng nhập tên thông số" }]}
                                            >
                                                <Input placeholder="Ví dụ: Chất liệu" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                label="Giá trị"
                                                name={[name, "value"]}
                                                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                                            >
                                                <Input placeholder="Ví dụ: Cotton 100%" />
                                            </Form.Item>
                                        </Card>
                                    ))}

                                    {/* Thêm spec mới tự do */}
                                    <Button type="dashed" onClick={() => add({ label: "", value: "" })} block>
                                        + Thêm thông số mới
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>


                    {/* === BIẾN THỂ === */}
                    <Card title={<><span style={{ color: "red" }}>*</span> Biến thể sản phẩm</>} size="small">
                        <Form.List
                            name="variants"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value?.length ? Promise.resolve() : Promise.reject("Cần ít nhất 1 màu"),
                                },
                            ]}
                        >
                            {(fields, { add }) => (
                                <>
                                    {fields.map(({ key, name }) => (
                                        <Card
                                            key={key}
                                            size="small"
                                            className="mb-4 border rounded bg-gray-50"
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span>Màu #{key + 1}</span>
                                                    <Button danger size="small" onClick={() => handleDeleteColor(form.getFieldValue(["variants", name, "color"]), name)}>
                                                        X
                                                    </Button>
                                                </div>
                                            }
                                        >
                                            {/* Tên màu */}
                                            <Form.Item
                                                name={[name, "color"]}
                                                label="Tên màu"
                                                rules={[
                                                    { required: true, message: "Vui lòng nhập tên màu" },
                                                    {
                                                        validator: (_, value) => {
                                                            if (!value?.trim()) return Promise.resolve();
                                                            const firstWord = normalizeText(value.trim().split(" ")[0]);
                                                            const validColors = BASIC_COLORS.map(normalizeText);
                                                            if (!validColors.includes(firstWord)) {
                                                                return Promise.reject(
                                                                    new Error(`Tên màu phải bắt đầu bằng: ${BASIC_COLORS.join(", ")}`)
                                                                );
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                        validateTrigger: "onBlur",
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    disabled={!!product && oldColorSet.has(form.getFieldValue(["variants", name, "color"]) || "")}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (!value) return;
                                                        const words = value.split(" ");
                                                        if (words[0]) {
                                                            const normalized = words[0].normalize("NFC");
                                                            words[0] = normalized.charAt(0).toUpperCase() + normalized.slice(1);
                                                        }
                                                        const newValue = words.join(" ");
                                                        if (value !== newValue) {
                                                            e.target.value = newValue;
                                                            setTimeout(() => e.target.setSelectionRange(newValue.length, newValue.length), 0);
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value = e.target.value.trim();
                                                        if (value) {
                                                            const words = value.split(" ");
                                                            if (words[0]) {
                                                                const normalized = words[0].normalize("NFC");
                                                                words[0] = normalized.charAt(0).toUpperCase() + normalized.slice(1);
                                                            }
                                                            form.setFieldValue(["variants", name, "color"], words.join(" "));
                                                        }
                                                    }}
                                                />
                                            </Form.Item>

                                            {/* Ảnh/Video theo màu */}
                                            <Form.Item
                                                label="Ảnh / Video theo màu"
                                                name={[name, "images"]}
                                                valuePropName="fileList"
                                                getValueFromEvent={(e) => {
                                                    const files = e?.fileList || [];

                                                    // Lọc ra các file mới (originFileObj) → chỉ giữ các file mới, bỏ file cũ
                                                    const newFiles = files.filter(f => f.originFileObj);

                                                    if (newFiles.length > 0) {
                                                        // replace hoàn toàn file cũ bằng file mới
                                                        return newFiles;
                                                    }

                                                    // Nếu không có file mới, giữ lại file cũ (nếu muốn)
                                                    return files;
                                                }}
                                            >
                                                <Upload
                                                    listType="picture-card"
                                                    accept="image/*,video/*"
                                                    multiple
                                                    beforeUpload={() => false} // không auto upload
                                                    itemRender={(originNode, file) =>
                                                        file.type?.startsWith("video") ? (
                                                            <video
                                                                className="w-full h-full border rounded-lg object-cover py-2 px-3"
                                                                src={file.url || URL.createObjectURL(file.originFileObj)}
                                                                controls
                                                            />
                                                        ) : originNode
                                                    }
                                                >
                                                    + Upload
                                                </Upload>
                                            </Form.Item>


                                            {/* Chọn size */}
                                            <Form.Item shouldUpdate>
                                                {() => {
                                                    const selectedSizes = form.getFieldValue(["variants", name, "sizes"]) || [];
                                                    const isAccessory = categoryLevel1 === 3;
                                                    const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

                                                    return (
                                                        <Form.Item
                                                            label="Chọn size"
                                                            name={[name, "sizes"]}
                                                            rules={[
                                                                {
                                                                    validator: (_, value) =>
                                                                        value?.length ? Promise.resolve() : Promise.reject("Chọn ít nhất 1 size"),
                                                                },
                                                            ]}
                                                        >
                                                            <div className="flex flex-wrap gap-3">
                                                                <Button
                                                                    type="default"
                                                                    disabled={!isAccessory}
                                                                    onClick={() => {
                                                                        form.setFieldValue(["variants", name, "sizes"], [null]);
                                                                        form.setFieldValue(["variants", name, "stocks"], { null: 0 });
                                                                    }}
                                                                    className={`min-w-[72px] rounded-full font-medium transition-all ${selectedSizes.includes(null)
                                                                        ? "bg-purple-600 text-white border-purple-600"
                                                                        : "bg-white text-gray-700 border-gray-300"
                                                                        }`}
                                                                >
                                                                    No size
                                                                </Button>

                                                                {SIZE_OPTIONS.map((size) => {
                                                                    const active = selectedSizes.includes(size);
                                                                    return (
                                                                        <Button
                                                                            key={size}
                                                                            disabled={isAccessory}
                                                                            onClick={() => {
                                                                                const current = form.getFieldValue(["variants", name, "sizes"]) || [];
                                                                                const next = active ? current.filter((s) => s !== size) : [...current, size];
                                                                                form.setFieldValue(["variants", name, "sizes"], next);

                                                                                // Đánh dấu xóa size cũ
                                                                                if (active && product) {
                                                                                    const map = buildVariantIdMap(product);
                                                                                    const color = form.getFieldValue(["variants", name, "color"]);
                                                                                    const id = map[color]?.[size];
                                                                                    if (id && !deletedVariantIds.current.includes(id)) {
                                                                                        deletedVariantIds.current.push(id);
                                                                                    }
                                                                                }

                                                                                // Dọn stock/price
                                                                                if (active) {
                                                                                    const stocks = { ...form.getFieldValue(["variants", name, "stocks"]) };
                                                                                    const prices = { ...form.getFieldValue(["variants", name, "prices"]) };
                                                                                    delete stocks[size];
                                                                                    delete prices[size];
                                                                                    form.setFieldValue(["variants", name, "stocks"], stocks);
                                                                                    form.setFieldValue(["variants", name, "prices"], prices);
                                                                                }
                                                                            }}
                                                                            className={`min-w-[48px] rounded-full font-medium transition-all ${active
                                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                                                                }`}
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

                                            {/* Stock + Price */}
                                            <Form.Item shouldUpdate>
                                                {() => {
                                                    const sizes = form.getFieldValue(["variants", name, "sizes"]) || [];
                                                    return (
                                                        <div className="flex flex-col gap-3">
                                                            {sizes.map((size) => (
                                                                <div key={size} className="flex items-center gap-4">
                                                                    <Tooltip title={size === null ? "Phụ kiện không cần size" : ""}>
                                                                        <Tag color={size !== null ? "blue" : "purple"} className="min-w-[60px] px-3 py-1 text-center">
                                                                            {size !== null ? size : "No size"}
                                                                        </Tag>
                                                                    </Tooltip>
                                                                    <Form.Item
                                                                        label="Số lượng"
                                                                        name={[name, "stocks", size]}
                                                                        rules={[{ required: true, message: "Nhập tồn kho" }]}
                                                                        className="flex-1 mb-0"
                                                                    >
                                                                        <InputNumber min={0} className="w-full" />
                                                                    </Form.Item>
                                                                    <Form.Item
                                                                        label="Giá"
                                                                        name={[name, "prices", size]}
                                                                        rules={[{ required: true, message: "Nhập giá" }]}
                                                                        className="flex-1 mb-0"
                                                                    >
                                                                        <InputNumber
                                                                            min={0}
                                                                            formatter={(value) => (value ? formatPrice(value) : "")}
                                                                            parser={(value) => value.replace(/₫|\./g, "")}
                                                                            style={{ width: "100%" }}
                                                                        />
                                                                    </Form.Item>
                                                                </div>
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
                        <Button size="large" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="bg-blue-600"
                            loading={submitLoading}
                        >
                            {product ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default ProductAddEditModal;