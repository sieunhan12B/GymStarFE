import { http } from "./config";

/**
 * Service quản lý API liên quan đến đánh giá (review)
 */
export const reviewService = {
    // ================== USER ==================

    /** User viết đánh giá */
    createReviewByUser: (data) => {
        return http.post("/QuanLyDanhGia/VietDanhGia", data);
    },

    /** Lấy danh sách đánh giá của user */
    getReviewUser: (page = 1, limit = 9999) => {
        return http.get(
            `/QuanLyDanhGia/LayDanhGiaCuaNguoiDung?page=${page}&limit=${limit}`
        );
    },

    /** Lấy chi tiết đánh giá theo order detail */
    getReviewOrderDetail: (order_detail_id) => {
        return http.get(
            `/QuanLyDanhGia/LayDanhGiaCuaChiTietDonHang/${order_detail_id}`
        );
    },

    /** Lấy danh sách đánh giá theo sản phẩm */
    getReviewByProductId: (product_id) => {
        return http.get(
            `/QuanLyDanhGia/LayDanhSachDanhGiaCuaSanPham/${product_id}`
        );
    },

    // ================== ADMIN ==================

    /** Lấy tất cả đánh giá */
    getAllReview: () => {
        return http.get("/QuanLyDanhGia/LayDanhSachTatCaDanhGia");
    },

    /** Cập nhật trạng thái đánh giá (duyệt / ẩn) */
    updateStatusReview: (review_id) => {
        return http.put(
            `/QuanLyDanhGia/CapNhatTrangThaiDanhGia/${review_id}`
        );
    },

    /** Trả lời đánh giá */
    replyReview: (data) => {
        return http.post("/QuanLyDanhGia/TraLoiDanhGia", data);
    },

};
