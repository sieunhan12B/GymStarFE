import { useEffect, useState, useContext } from "react";
import { Table, Tag, Button, Modal, Input, Tooltip, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { feedbackService } from "@/services/feedback.service";
import { NotificationContext } from "@/App";
import Header from "../../../templates/AdminTemplate/Header";

const { TextArea } = Input;

const typeColorMap = {
    "Khen ngợi": "green",
    "Đề xuất": "blue",
    "Khiếu nại": "red",
    "Câu hỏi": "orange",
    "Góp ý về sản phẩm": "purple",
    "Góp ý về dịch vụ": "cyan",
    "Khác": "gray",
};

const FeedbackManager = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const { showNotification } = useContext(NotificationContext);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await feedbackService.getAll();
            setData(res.data.data);
        } catch (err) {
            showNotification("Tải danh sách góp ý thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const openReplyModal = (feedback) => {
        if (feedback.reply) return; // không cho sửa phản hồi
        setSelectedFeedback(feedback);
        setReplyMessage("");
        setReplyModalVisible(true);
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) {
            message.error("Vui lòng nhập nội dung phản hồi!");
            return;
        }
        try {
            const payload = { message: replyMessage };
            const res = await feedbackService.reply(payload, selectedFeedback.feedback.feedback_id);

            showNotification(res.data.message || "Trả lời góp ý thành công", "success");

            // Cập nhật data local
            setData(prev =>
                prev.map(item =>
                    item.feedback.feedback_id === selectedFeedback.feedback.feedback_id
                        ? { ...item, reply: res.data.reply }
                        : item
                )
            );

            setReplyModalVisible(false);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Trả lời góp ý thất bại", "error");
        }
    };

    const columns = [
        {
            title: "Người gửi",
            dataIndex: ["feedback", "user", "full_name"],
            key: "user",
            render: (_, record) => (
                <div>
                    <div className="font-semibold">{record.feedback.user.full_name}</div>
                    <div className="text-gray-400 text-sm">{record.feedback.user.email}</div>
                </div>
            ),
        },
        {
            title: "Loại góp ý",
            dataIndex: ["feedback", "type"],
            key: "type",
            filters: Object.keys(typeColorMap).map(type => ({
                text: type,
                value: type,
            })),
            onFilter: (value, record) => record.feedback.type === value,
            render: (type) => <Tag color={typeColorMap[type] || "default"}>{type}</Tag>,
        },

        {
            title: "Nội dung",
            dataIndex: ["feedback", "message"],
            key: "message",
            render: (text) =>
                text.length > 50 ? <Tooltip title={text}>{text.slice(0, 50)}...</Tooltip> : text,
        },

        {
            title: "Phản hồi",
            key: "replyContent",
            filters: [
                { text: "Đã phản hồi", value: "replied" },
                { text: "Chưa phản hồi", value: "not_replied" },

            ],
            onFilter: (value, record) =>
                value === "replied" ? !!record.reply : !record.reply,
            render: (_, record) => {
                const replyText = record.reply?.message;
                return replyText ? (
                    <Tooltip title={replyText}>
                        <Tag color="blue">Đã phản hồi</Tag>
                        <div className="text-gray-600 mt-1">
                            {replyText.length > 50 ? replyText.slice(0, 50) + "..." : replyText}
                        </div>
                    </Tooltip>
                ) : (
                    <Tag color="orange">Chưa phản hồi</Tag>
                );
            },
        },
        {
            title: "Ngày gửi",
            dataIndex: ["feedback", "created_at"],
            key: "created_at",
            sorter: (a, b) =>
                new Date(a.feedback.created_at.split(" ").slice(1).join(" ")) -
                new Date(b.feedback.created_at.split(" ").slice(1).join(" ")),
            render: (date) => date,
        },
        {
            title: "Ngày phản hồi",
            key: "reply_date",
            sorter: (a, b) => {
                const dateA = a.reply?.replied_at ? new Date(a.reply.replied_at.split(" ").slice(1).join(" ")) : 0;
                const dateB = b.reply?.replied_at ? new Date(b.reply.replied_at.split(" ").slice(1).join(" ")) : 0;
                return dateA - dateB;
            },
            render: (_, record) =>
                record.reply?.replied_at ? record.reply.replied_at : "—",
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                !record.reply && (
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => openReplyModal(record)}
                    >
                        Phản hồi
                    </Button>
                )
            ),
        },
    ];


    const renderHeader = () => (
        <Header
            searchTextOn={false}

            filterOn={false}
            itemName="góp ý"
            categoryFilterOn={false}
            addItemOn={false}
        />
    );

    const renderModalReply = () => (
        <Modal
            title={`Phản hồi cho: ${selectedFeedback?.feedback.user.full_name || ""}`}
            open={replyModalVisible}
            onCancel={() => setReplyModalVisible(false)}
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
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Nhập phản hồi tại đây..."
            />
        </Modal>
    )

    const renderTable = () => (
        <Table
            columns={columns}
            dataSource={data}
            rowKey={(record) => record.feedback.feedback_id}
            loading={loading}
        />
    );

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            {renderHeader()}
            {renderTable()}
            {renderModalReply()}

        </div>
    );
};

export default FeedbackManager;
