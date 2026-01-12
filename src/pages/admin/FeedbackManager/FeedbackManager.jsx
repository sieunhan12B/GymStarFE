import { useEffect, useState, useContext, useMemo } from "react";
import {
    Table,
    Tag,
    Button,
    Modal,
    Input,
    Tooltip,
    Popconfirm,
    Space,
    message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// Services
import { feedbackService } from "@/services/feedback.service";

// Components
import Header from "@/templates/AdminTemplate/Header";

// Context
import { NotificationContext } from "@/App";

// Utils
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";
import { normalizeText } from "@/utils/normalizeText";

const { TextArea } = Input;

/* ================= CONSTANTS ================= */
const TYPE_COLOR_MAP = {
    "Khen ngợi": "green",
    "Đề xuất": "blue",
    "Khiếu nại": "red",
    "Câu hỏi": "orange",
    "Góp ý về sản phẩm": "purple",
    "Góp ý về dịch vụ": "cyan",
    "Khác": "gray",
};

/* ================= COMPONENT ================= */
const FeedbackManager = () => {
    const { showNotification } = useContext(NotificationContext);

    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [searchText, setSearchText] = useState("");

    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    /* ===== FETCH ===== */
    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await feedbackService.getAllFeedback();
            setFeedbacks(res?.data?.data || []);
        } catch {
            showNotification("Tải danh sách góp ý thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    /* ===== FILTER ===== */
    const filteredFeedbacks = useMemo(() => {
        if (!searchText) return feedbacks;

        const keyword = removeVietnameseTones(
            normalizeText(searchText)
        );

        return feedbacks.filter((item) => {
            const user = item.feedback?.user;
            return (
                removeVietnameseTones(
                    normalizeText(user?.full_name)
                ).includes(keyword) ||
                normalizeText(user?.email).includes(keyword)
            );
        });
    }, [feedbacks, searchText]);

    /* ===== HANDLERS ===== */
    const openReplyModal = (record) => {
        if (record.reply) return;
        setSelectedFeedback(record);
        setReplyMessage("");
        setIsReplyModalOpen(true);
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) {
            message.error("Vui lòng nhập nội dung phản hồi!");
            return;
        }

        try {
            await feedbackService.replyFeedback(
                selectedFeedback.feedback.feedback_id,
                { message: replyMessage },

            );

            showNotification("Trả lời góp ý thành công", "success");
            setIsReplyModalOpen(false);
            fetchFeedbacks();
        } catch (err) {
            showNotification(
                err?.response?.data?.message ||
                "Trả lời góp ý thất bại",
                "error"
            );
        }
    };

    const handleDelete = async (feedbackId) => {
        try {
            await feedbackService.deleteFeedback(feedbackId);
            showNotification("Xóa góp ý thành công", "success");

            setFeedbacks((prev) =>
                prev.filter(
                    (f) => f.feedback.feedback_id !== feedbackId
                )
            );
        } catch (err) {
            showNotification(
                err?.response?.data?.message ||
                "Xóa góp ý thất bại",
                "error"
            );
        }
    };

    /* ===== TABLE COLUMNS ===== */
    const columns = [
        {
            title: "Người gửi",
            render: (_, record) => {
                const user = record.feedback.user;
                return (
                    <div>
                        <div className="font-semibold">
                            {user.full_name}
                        </div>
                        <div className="text-gray-400 text-sm">
                            {user.email}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Loại góp ý",
            dataIndex: ["feedback", "type"],
            filters: Object.keys(TYPE_COLOR_MAP).map((type) => ({
                text: type,
                value: type,
            })),
            onFilter: (value, record) =>
                record.feedback.type === value,
            render: (type) => (
                <Tag color={TYPE_COLOR_MAP[type] || "default"}>
                    {type}
                </Tag>
            ),
        },
        {
            title: "Nội dung",
            dataIndex: ["feedback", "message"],
            render: (text) =>
                text.length > 50 ? (
                    <Tooltip title={text}>
                        {text.slice(0, 50)}...
                    </Tooltip>
                ) : (
                    text
                ),
        },
        {
            title: "Phản hồi",
            width: 360,
            filters: [
                { text: "Đã phản hồi", value: "replied" },
                { text: "Chưa phản hồi", value: "not_replied" },
            ],
            onFilter: (value, record) =>
                value === "replied"
                    ? !!record.reply
                    : !record.reply,
            render: (_, record) => {
                const reply = record.reply;

                if (!reply) {
                    return (
                        <Button
                            type="link"
                            className="p-0 font-medium"
                            onClick={() =>
                                openReplyModal(record)
                            }
                        >
                            Trả lời
                        </Button>
                    );
                }

                return (
                    <div className="max-w-[320px]">
                        <Tooltip title={reply.message}>
                            <div className="text-green-700 text-sm">
                                {reply.message.length > 60
                                    ? reply.message.slice(0, 60) +
                                    "..."
                                    : reply.message}
                            </div>
                        </Tooltip>
                        <div className="text-xs text-gray-400 mt-1">
                            {reply.replied_at}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Ngày gửi",
            dataIndex: ["feedback", "created_at"],
            render: (date) =>
                dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
                    ? dayjs(date).format("DD/MM/YYYY")
                    : "—",
        },
        {
            title: "Ngày phản hồi",
            render: (_, record) =>
                record.reply?.replied_at
                    ? dayjs(
                        record.reply.replied_at,
                        "HH:mm:ss DD/MM/YYYY"
                    ).format("DD/MM/YYYY")
                    : "—",
        },
        {
            title: "Thao tác",
            width: 120,
            render: (_, record) => (
                <Popconfirm
                    title="Xóa góp ý này?"
                    description="Hành động này không thể hoàn tác."
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() =>
                        handleDelete(
                            record.feedback.feedback_id
                        )
                    }
                >
                    <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                    />
                </Popconfirm>
            ),
        },
    ];

    /* ===== RENDER ===== */
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <Header
                itemName="góp ý"

                searchText={searchText}
                setSearchText={setSearchText}

                showCategoryFilter={false}
                showAddButton={false}
                showReload={true}

                onReload={fetchFeedbacks}
                reloading={loading}
            />


            <Table
                columns={columns}
                dataSource={filteredFeedbacks}
                rowKey={(r) => r.feedback.feedback_id}
                loading={loading}
            />

            {/* REPLY MODAL */}
            <Modal
                title={`Phản hồi cho: ${selectedFeedback?.feedback.user.full_name ||
                    ""
                    }`}
                open={isReplyModalOpen}
                onCancel={() => setIsReplyModalOpen(false)}
                onOk={handleReply}
                okText="Gửi phản hồi"
                cancelText="Hủy"
                centered
            >
                <p className="font-semibold mb-2">Feedback:</p>
                <div className="mb-4 p-2 bg-gray-100 rounded">
                    {selectedFeedback?.feedback.message}
                </div>

                <TextArea
                    rows={6}
                    value={replyMessage}
                    onChange={(e) =>
                        setReplyMessage(e.target.value)
                    }
                    placeholder="Nhập phản hồi tại đây..."
                />
            </Modal>
        </div>
    );
};

export default FeedbackManager;
