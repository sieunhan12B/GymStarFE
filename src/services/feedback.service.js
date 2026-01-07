import { http } from "./config";

/**
 * Service quản lý API liên quan đến phản hồi / góp ý
 */
export const feedbackService = {
    // ================== ADMIN ==================

    /** Lấy tất cả góp ý (Admin) */
    getAllFeedback: (page = 1, limit = 9999) => {
        return http.get(`/QuanLyGopY/LayDanhSachTatCaGopY?page=${page}&limit=${limit}`);
    },

    /** Xóa góp ý theo feedback_id */
    deleteFeedback: (feedback_id) => {
        return http.delete(`/QuanLyGopY/XoaGopY/${feedback_id}`);
    },

    /** Trả lời góp ý theo feedback_id */
    replyFeedback: (feedback_id, data) => {
        return http.post(`/QuanLyGopY/TraLoiGopY/${feedback_id}`, data);
    },

    // ================== USER ==================

    /** Thêm góp ý mới (User) */
    addFeedback: (data) => {
        return http.post("/QuanLyGopY/VietGopY", data);
    },

    /** Lấy danh sách góp ý của user hiện tại */
    getFeedbackUser: (page = 1, limit = 9999) => {
        return http.get(`/QuanLyGopY/LayDanhSachGopYUser?page=${page}&limit=${limit}`);
    },

};
