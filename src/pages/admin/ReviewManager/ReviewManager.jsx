import { useState, useEffect, useContext } from "react";
import { Modal, Button, Space, Tag, Rate } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Header from "@/templates/AdminTemplate/Header";
import DataTable from "@/components/DataTable/DataTable";
import dayjs from "dayjs";
import { NotificationContext } from "@/App";
// import { reviewService } from "@/services/review.service";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";

const ReviewManager = () => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [selectedReview, setSelectedReview] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusAction, setStatusAction] = useState(""); // approve | reject

    const { showNotification } = useContext(NotificationContext);


    // ===== MOCK DATA =====
    const mockReviews = [
        {
            review_id: 1,
            product_name: "Áo thun nam basic",
            user_name: "Nguyễn Văn A",
            rating: 5,
            status: "pending",
            comment: "Áo đẹp, chất lượng tốt. Giao hàng nhanh.",
            createdAt: "2025-12-01T10:20:30Z",
        },
        {
            review_id: 2,
            product_name: "Giày thể thao Nike",
            user_name: "Trần Thị B",
            rating: 4,
            status: "approved",
            comment: "Giày đẹp nhưng size hơi nhỏ hơn mong đợi.",
            createdAt: "2025-12-02T12:15:00Z",
        },
        {
            review_id: 3,
            product_name: "Túi xách nữ da thật",
            user_name: "Lê Văn C",
            rating: 3,
            status: "rejected",
            comment: "Hàng không như hình, da kém chất lượng.",
            createdAt: "2025-12-03T09:45:12Z",
        },
        {
            review_id: 4,
            product_name: "Quần jeans nam",
            user_name: "Phạm Thị D",
            rating: 5,
            status: "pending",
            comment: "Vừa vặn, mặc rất thoải mái.",
            createdAt: "2025-12-03T16:30:00Z",
        },
        {
            review_id: 5,
            product_name: "Đồng hồ thông minh",
            user_name: "Ngô Văn E",
            rating: 4,
            status: "approved",
            comment: "Đồng hồ xịn, pin dùng lâu.",
            createdAt: "2025-12-04T14:50:00Z",
        },
    ];


    // ==== FETCH REVIEWS ====
    const fetchReviews = async () => {
        setLoading(true);
        try {
            // Thay vì gọi API
            setReviews(mockReviews);
            showNotification("Tải danh sách đánh giá thành công!", "success");
        } catch (error) {
            showNotification("Không thể tải danh sách đánh giá!", "error");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchReviews();
    }, []);

    // ==== FILTER SEARCH ====
    const filteredReviews = reviews.filter((item) => {
        if (!searchText) return true;

        return (
            removeVietnameseTones(item.user_name || "")
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
            removeVietnameseTones(item.product_name || "")
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );
    });

    // ==== OPEN DETAIL MODAL ====
    const handleViewDetails = (record) => {
        setSelectedReview(record);
        setIsViewModalOpen(true);
    };

    // ==== OPEN STATUS MODAL (APPROVE / REJECT) ====
    const handleOpenStatusModal = (record, action) => {
        setSelectedReview(record);
        setStatusAction(action);
        setIsStatusModalOpen(true);
    };

    // ==== UPDATE STATUS ====
    const handleUpdateStatus = async () => {
        try {
            const res = await reviewService.updateStatus(selectedReview.review_id, {
                status: statusAction,
            });

            showNotification(res.data.message, "success");
            setIsStatusModalOpen(false);
            fetchReviews();
        } catch (error) {
            showNotification(
                error.response?.data?.message || "Không thể cập nhật trạng thái!",
                "error"
            );
        }
    };

    // ==== COLUMNS ====
    const reviewColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "product_name",
            key: "product_name",
            render: (text) => <span className="font-semibold">{text}</span>,
        },
        {
            title: "Người đánh giá",
            dataIndex: "user_name",
            key: "user_name",
        },
        {
            title: "Số sao",
            dataIndex: "rating",
            width: 120,
            render: (rating) => <Rate disabled defaultValue={rating} />,
            filters: [1, 2, 3, 4, 5].map((n) => ({ text: `${n} sao`, value: n })),
            onFilter: (value, record) => record.rating === value,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 130,
            filters: [
                { text: "Pending", value: "pending" },
                { text: "Approved", value: "approved" },
                { text: "Rejected", value: "rejected" },
            ],
            onFilter: (val, record) => record.status === val,
            render: (status) => {
                let color = "default";
                if (status === "pending") color = "orange";
                if (status === "approved") color = "green";
                if (status === "rejected") color = "red";

                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 130,
            render: (date) =>
                dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : "—",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />

                    {record.status === "pending" && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleOpenStatusModal(record, "approved")}
                            />
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => handleOpenStatusModal(record, "rejected")}
                            />
                        </>
                    )}
                </Space>
            ),
        },
    ];

    // ==== HEADER ====
    const renderHeader = () => (
        <Header
            searchText={searchText}
            setSearchText={setSearchText}
            itemName="đánh giá"
            categoryFilterOn={false}
            addItemOn={false}
        />
    );

    // ==== DETAILS MODAL ====
    const renderDetailsModal = () => (
        <Modal
            open={isViewModalOpen}
            title="Chi tiết đánh giá"
            onCancel={() => setIsViewModalOpen(false)}
            footer={false}
            centered
        >
            {selectedReview && (
                <div className="space-y-3">
                    <p><b>Sản phẩm:</b> {selectedReview.product_name}</p>
                    <p><b>Người đánh giá:</b> {selectedReview.user_name}</p>
                    <p><b>Số sao:</b> <Rate disabled defaultValue={selectedReview.rating} /></p>
                    <p><b>Nội dung:</b></p>
                    <p className="p-3 bg-gray-100 rounded-lg">{selectedReview.comment}</p>
                </div>
            )}
        </Modal>
    );

    // ==== STATUS CONFIRM MODAL ====
    const renderStatusModal = () => (
        <Modal
            open={isStatusModalOpen}
            onCancel={() => setIsStatusModalOpen(false)}
            onOk={handleUpdateStatus}
            okText="Xác nhận"
            cancelText="Hủy"
            centered
        >
            <p>
                Bạn có chắc muốn
                <b className="text-red-600"> {statusAction === "approved" ? " DUYỆT " : " TỪ CHỐI "} </b>
                đánh giá của <b>{selectedReview?.user_name}</b>?
            </p>
        </Modal>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {renderHeader()}

            <DataTable
                columns={reviewColumns}
                dataSource={filteredReviews}
                loading={loading}
                totalText="đánh giá"
            />

            {renderDetailsModal()}
            {renderStatusModal()}
        </div>
    );
};

export default ReviewManager;
