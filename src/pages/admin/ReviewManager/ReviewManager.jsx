import { Button, Modal, Space, Tag, Image, Typography, Tooltip, Input } from "antd";
import { EyeOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import DataTable from "@/components/DataTable/DataTable";
import { reviewService } from "@/services/review.service";
import dayjs from "dayjs";
import { useEffect, useState, useContext, useMemo } from "react";
import { NotificationContext } from "@/App";
import Header from "@/templates/AdminTemplate/Header";
import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import { normalizeText } from "../../../utils/normalizeText";

const ReviewManager = () => {
    // ===== STATE =====
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");



    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const { showNotification } = useContext(NotificationContext);

    // ===== FETCH REVIEWS =====
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await reviewService.getAllReview();
            setData(res.data.data);
            showNotification(res.data.message, "success");
        } catch (error) {
            showNotification("Tải danh sách đánh giá thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // ===== FILTER SEARCH =====


    const filteredData = useMemo(() => {
        if (!searchText) return data;

        const keyword = removeVietnameseTones(
            normalizeText(searchText)
        );

        return data.filter((item) => {
            const user = item.reviewer;
            return (
                removeVietnameseTones(
                    normalizeText(user?.full_name)
                ).includes(keyword) ||
                normalizeText(user?.email).includes(keyword)
            );
        });
    }, [data, searchText]);


    const openReplyModal = (record) => {
        setSelectedReview(record);
        setReplyContent(record.reply?.message || "");
        setIsReplyModalOpen(true);
    };

    const handleReplyReview = async () => {
        if (!replyContent.trim()) {
            showNotification("Vui lòng nhập nội dung phản hồi", "warning");
            return;
        }
        try {
            const res = await reviewService.replyReview({
                review_id: selectedReview.review_id,
                message: replyContent,
            });
            showNotification(res.data.message, "success");
            setIsReplyModalOpen(false);
            fetchReviews();
        } catch (error) {
            showNotification(
                error.response?.data?.message || "Phản hồi thất bại",
                "error"
            );
        }
    };


    const handleChangeStatus = async () => {
        if (!selectedReview) return;
        try {
            const res = await reviewService.updateStatusReview(
                selectedReview.review_id
            );
            showNotification(res.data.message, "success");
            setIsStatusModalOpen(false);
            fetchReviews(); // reload list
        } catch (error) {
            showNotification(
                error.response?.data?.message || "Đổi trạng thái thất bại",
                "error"
            );
        }
    };


    // ===== COLUMNS =====
    const reviewColumns = [
        {
            title: "Sản phẩm",
            key: "product",
            width: 200,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Image
                        src={record.product.thumbnail}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                        preview={false}
                    />
                    <span className="text-sm">{record.product.product_name}</span>
                </div>
            ),
        },
        {
            title: "⭐ Số sao",
            dataIndex: "rating",
            key: "rating",
            width: 150,
            filters: [1, 2, 3, 4, 5].map(v => ({ text: `${v} sao`, value: v })),
            onFilter: (value, record) => record.rating === value,
            render: rating => (
                <Tag color={rating >= 4 ? "green" : rating >= 2 ? "orange" : "red"}>
                    {rating} ⭐
                </Tag>
            ),
        },
        {
            title: "Nội dung",
            dataIndex: "comment",
            key: "comment",
            width: 350,
            filters: [
                { text: "Có nội dung", value: "comment" },
                { text: "Chưa có nội dung", value: "not_comment" },
            ],
            onFilter: (value, record) => {
                if (value === "comment") return !!record.comment;
                if (value === "not_comment") return !record.comment;
                return true;
            },
            render: (text) => (
                <div className="max-w-80">
                    <Typography.Text
                        ellipsis={{ tooltip: text }}
                        className="cursor-pointer"
                    >
                        {text || "—"}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: "Phản hồi",
            dataIndex: "reply",
            key: "reply",
            width: 320,

            filters: [
                { text: "Đã phản hồi", value: "replied" },
                { text: "Chưa phản hồi", value: "not_replied" },
            ],
            onFilter: (value, record) => {
                if (value === "replied") return !!record.reply;
                if (value === "not_replied") return !record.reply;
                return true;
            },
            render: (reply, record) => {
                if (!reply) {
                    return (
                        <Button
                            className="p-0 font-semibold text-orange-500"
                            type="link"
                            onClick={() => openReplyModal(record)}
                        >
                            Chưa phản hồi
                        </Button>
                    );
                }
                return (
                    <div className="max-w-80 flex flex-col gap-1">
                        <Typography.Text
                            ellipsis={{ tooltip: reply.message }}
                            className="text-green-700"
                        >
                            {reply.message}
                        </Typography.Text>

                        <span className="text-xs text-gray-400">
                            Đã phản hồi
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Người đánh giá",
            key: "reviewer",
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{record.reviewer.full_name}</span>
                    <span className="text-gray-400 text-sm">
                        {record.reviewer.email}
                    </span>
                </div>
            ),
        },
        {
            title: "Ảnh",
            dataIndex: "images",
            key: "images",
            width: 120,
            render: (images = []) =>
                images.length ? (
                    <Image.PreviewGroup>
                        <div className="flex gap-1">
                            {images.slice(0, 2).map((img, idx) => (
                                <Image
                                    key={idx}
                                    src={img}
                                    width={40}
                                    height={40}
                                    className="rounded object-cover cursor-pointer"
                                />
                            ))}
                            {images.length > 2 && (
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded text-xs">
                                    +{images.length - 2}
                                </div>
                            )}
                        </div>
                    </Image.PreviewGroup>
                ) : (
                    "—"
                ),
        },

        {
            title: "Trạng thái",
            dataIndex: "is_visible",
            key: "is_visible",
            width: 130,
            filters: [
                { text: "Hiển thị", value: true },
                { text: "Ẩn", value: false },
            ],
            onFilter: (value, record) => record.is_visible === value,
            render: visible => (
                <Tag color={visible ? "green" : "red"}>
                    {visible ? "Hiển thị" : "Đã ẩn"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: date =>
                dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
                    ? dayjs(date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                    : "—",
        },
        {
            title: "Hành động",
            key: "action",
            width: 140,
            render: (_, record) => {
                const isVisible = record.is_visible;

                return (
                    <Space>
                        {/* XEM CHI TIẾT */}
                        <Tooltip title="Xem chi tiết đánh giá">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    setSelectedReview(record);
                                    setIsDetailModalOpen(true);
                                }}
                            />
                        </Tooltip>

                        {/* ĐỔI TRẠNG THÁI */}
                        <Tooltip
                            title={
                                isVisible
                                    ? "Ẩn đánh giá"
                                    : "Hiển thị đánh giá"
                            }
                        >
                            <Button
                                type="text"
                                danger={isVisible}
                                className={
                                    isVisible
                                        ? "font-bold text-red-600"
                                        : "font-bold text-green-600"
                                }
                                icon={
                                    isVisible ? (
                                        <LockOutlined />
                                    ) : (
                                        <UnlockOutlined />
                                    )
                                }
                                onClick={() => {
                                    setSelectedReview(record);
                                    setIsStatusModalOpen(true);
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },

    ];

    const renderModalChangeStatus = () => {
        return (
            <Modal
                open={isStatusModalOpen}
                title="Xác nhận thay đổi trạng thái"
                onCancel={() => setIsStatusModalOpen(false)}
                onOk={handleChangeStatus}
                okText="Xác nhận"
                cancelText="Hủy"
                centered
                okButtonProps={{
                    className:
                        "bg-black text-white hover:!bg-white hover:!text-black border-2 border-black",
                }}
                cancelButtonProps={{
                    className:
                        "bg-white text-black hover:!bg-black hover:!text-white border-2 border-black",
                }}
            >
                <p>
                    Bạn có chắc muốn{" "}
                    <b
                        className={
                            selectedReview?.is_visible
                                ? "text-red-600"
                                : "text-green-600"
                        }
                    >
                        {selectedReview?.is_visible
                            ? "Ẩn"
                            : "Hiển thị"}
                    </b>{" "}
                    đánh giá này không?
                </p>
            </Modal>
        )
    }

    // ===== HEADER =====
    const renderHeader = () => (
        <Header
            itemName="đánh giá"
            searchText={searchText}
            setSearchText={setSearchText}
            onReload={fetchReviews}
            reloading={loading}
            showCategoryFilter={false}
            showAddButton={false}
        />
    );

    const renderReplyModal = () => (
        <Modal
            open={isReplyModalOpen}
            title="Phản hồi đánh giá"
            onCancel={() => setIsReplyModalOpen(false)}
            onOk={handleReplyReview}
            okText="Gửi phản hồi"
            cancelText="Hủy"
            centered
            width={600}
            okButtonProps={{
                className:
                    "bg-black text-white hover:!bg-white hover:!text-black border-2 border-black",
            }}
            cancelButtonProps={{
                className:
                    "bg-white text-black hover:!bg-black hover:!text-white border-2 border-black",
            }}
        >
            <div className="space-y-3">
                <div className="text-sm text-gray-500">
                    <b>Người đánh giá:</b> {selectedReview?.reviewer?.full_name}
                </div>

                <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedReview?.comment}
                </div>

                <Input.TextArea
                    rows={5}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Nhập phản hồi của admin..."
                />
            </div>
        </Modal>
    );

    // ===== DETAIL MODAL =====
    const renderDetailModal = () => (

        <Modal
            open={isDetailModalOpen}
            title="Chi tiết đánh giá"
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            centered
            width={700}
        >
            {selectedReview && (
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Tag color="green">{selectedReview.rating} ⭐</Tag>
                        <span className="text-gray-400">
                            {selectedReview.createdAt}
                        </span>
                    </div>

                    <p className="text-gray-700">{selectedReview.comment}</p>

                    {selectedReview.images?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {selectedReview.images.map((img, idx) => (
                                <Image
                                    key={idx}
                                    src={img}
                                    width={100}
                                    height={100}
                                    className="rounded"
                                />
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-3 text-sm text-gray-500">
                        <div>
                            <b>Người đánh giá:</b>{" "}
                            {selectedReview.reviewer.full_name}
                        </div>
                        <div>{selectedReview.reviewer.email}</div>
                    </div>
                </div>
            )}
        </Modal>

    );

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {renderHeader()}
            <DataTable
                columns={reviewColumns}
                dataSource={filteredData}
                loading={loading}
                totalText="đánh giá"
            />
            {renderDetailModal()}
            {renderReplyModal()}
            {renderModalChangeStatus()}
        </div>
    );
};

export default ReviewManager;
