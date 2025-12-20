import { http } from "./config";

export const reviewService = {


    createReviewByUser: async (data) => {
        try {
            return await http.post("/QuanLyDanhGia/VietDanhGia", data);
        } catch (error) {
            console.error("Lỗi Review Services:", error);
            throw error;
        }
    },

    getAllReview: async () => {
        try {
            return await http.get("/QuanLyDanhGia/LayDanhSachTatCaDanhGia");
        } catch (error) {
            console.error("Lỗi Review Services:", error);
            throw error;
        }
    },

    updateStatusReview: async (review_id) => {
        try {
            return await http.put(`/QuanLyDanhGia/CapNhatTrangThaiDanhGia/${review_id}`);
        } catch (error) {
            console.error("Lỗi Review Services:", error);
            throw error;
        }
    },
    replyReview: async (data) => {
        try {
            return await http.post("/QuanLyDanhGia/TraLoiDanhGia", data);
        } catch (error) {
            console.error("Lỗi Review Services:", error);
            throw error;
        }
    },

    getReviewVariant: async (variant_id) => {
        try {
            return await http.get(`/QuanLyDanhGia/LayDanhSachDanhGiaCua1BienThe/${variant_id}`);
        } catch (error) {
            console.error("Lỗi Review Services:", error);
            throw error;
        }
    },






};
