// src/components/ProductManager/ProductDetailModal.jsx
import React, { useState } from "react";
import {
    Modal,
    Card,
    Table,
    Image,
    Tag,
    Descriptions,
    Typography,
    Button,
} from "antd";
import { formatPrice } from "@/utils/formatPrice"; 
import { isVideo } from "@/utils/isVideo";

// Hàm map biến thể với hình ảnh theo màu (copy từ ProductManager)
const mapVariantsWithImages = (product) => {
    if (!product.product_variants || !product.colors) {
        return product.product_variants || [];
    }

    return product.product_variants.map((variant) => {
        const colorGroup = product.colors.find((c) => c.color === variant.color);
        return {
            ...variant,
            images: colorGroup ? colorGroup.images : [],
            thumbnail: product.thumbnail,
        };
    });
};

const ProductDetailModal = ({ open, product, onClose }) => {
    const [mediaModal, setMediaModal] = useState({
        open: false,
        media: [],
    });

    if (!product) return null;

    const variantsWithImages = mapVariantsWithImages(product);

    // Cột bảng biến thể trong modal chi tiết
    const productDetailColumns = [
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            render: (text) => <span className="font-mono text-sm">{text}</span>,
        },
        {
            title: "Màu sắc",
            dataIndex: "color",
            key: "color",
            render: (color) => <Tag color="cyan">{color}</Tag>,
        },
        {
            title: "Kích thước",
            dataIndex: "size",
            key: "size",
            render: (size) => <Tag color="geekblue">{size ?? "No size"}</Tag>,
        },
        {
            title: "Giá bán",
            dataIndex: "price",
            width: 150,
            key: "price",
            render: (price, record) => {
                const discount = Number(product.discount || 0);
                return (
                    <div>
                        {discount > 0 && (
                            <div className="text-gray-400 line-through text-xs">
                                {formatPrice(price)}
                            </div>
                        )}
                        <div className="text-green-600 font-bold">
                            {formatPrice(record.final_price)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            key: "stock",
            render: (stock) => (
                <Tag
                    color={
                        stock > 10 ? "green" : stock > 0 ? "orange" : "red"
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
            render: (images = []) => {
                if (!images.length) return <span className="text-gray-400">—</span>;

                const maxDisplay = 5;
                const visibleItems = images.slice(0, maxDisplay);
                const remaining = images.length - maxDisplay;

                return (
                    <div className="flex items-center gap-2">
                        {visibleItems.map((url, idx) => {

                            return isVideo(url) ? (
                                <video
                                    key={idx}
                                    src={url}
                                    controls
                                    className="w-[80px] h-[80px] object-cover rounded-lg border cursor-pointer"
                                    onClick={() => setMediaModal({ open: true, media: images })}
                                />
                            ) : (
                                <img
                                    key={idx}
                                    src={url}
                                    alt="media"
                                    className="w-[80px] h-[80px] object-cover rounded-lg border cursor-pointer"
                                    onClick={() => setMediaModal({ open: true, media: images })}
                                />
                            );
                        })}
                        {remaining > 0 && (
                            <div
                                className="w-[80px] h-[80px] rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 border cursor-pointer"
                                title={`${remaining} media khác`}
                                onClick={() => setMediaModal({ open: true, media: images })}
                            >
                                +{remaining}
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    // Modal xem lớn các media của một màu
    const renderMediaModal = () => (
        <Modal
            open={mediaModal.open}
            footer={null}
            onCancel={() => setMediaModal({ open: false, media: [] })}
            width={800}
            centered
        >
            <div className="flex flex-wrap gap-3">
                {mediaModal.media.map((url, idx) => {
                    return isVideo(url) ? (
                        <video
                            key={idx}
                            src={url}
                            controls
                            className="w-[200px] h-[200px] object-cover rounded-lg border"
                        />
                    ) : (
                        <Image
                            key={idx}
                            src={url}
                            width={200}
                            height={200}
                            className="rounded-lg object-cover"
                            preview={true}
                        />
                    );
                })}
            </div>
        </Modal>
    );

    return (
        <>
            <Modal
                title={null}
                open={open}
                onCancel={onClose}
                footer={null}
                width={1200}
                centered
            >
                <div className="py-4">
                    {/* HEADER */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Chi tiết sản phẩm
                        </h2>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h3>
                        <Tag color="blue" className="text-sm">
                            {product.parent_category_name || "—"} / {product.category_name}
                        </Tag>
                    </div>

                    {/* THÔNG TIN CHÍNH */}
                    <Card className="mb-6 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Thumbnail */}
                            <div>
                                <Image
                                    src={product.thumbnail}
                                    alt={product.name}
                                    className="rounded-lg w-full"
                                    preview={true}
                                />
                            </div>

                            {/* Thông tin + Spec */}
                            <div className="flex flex-col gap-4">
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Mô tả">
                                        <Typography.Paragraph
                                            ellipsis={{ rows: 2, tooltip: product.description }}
                                            style={{ marginBottom: 0 }}
                                        >
                                            {product.description || "—"}
                                        </Typography.Paragraph>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giảm giá">
                                        <Tag color="red">{product.discount || 0}%</Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Thông số kỹ thuật */}
                                <Card title="Thông số kỹ thuật" size="small">
                                    {product.spec && product.spec.length > 0 ? (
                                        <Descriptions column={1} bordered size="small">
                                            {product.spec.map((item, index) => (
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

                    {/* BIẾN THỂ */}
                    <Card
                        title={`Biến thể sản phẩm (${variantsWithImages.length || 0})`}
                        size="small"
                    >
                        <Table
                            dataSource={variantsWithImages}
                            rowKey="product_variant_id"
                            pagination={false}
                            size="small"
                            columns={productDetailColumns}
                        />
                    </Card>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal xem lớn media */}
            {renderMediaModal()}
        </>
    );
};

export default ProductDetailModal;