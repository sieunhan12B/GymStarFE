import { http } from "./config";

export const promotionService = {


    // ------------------ ADMIN ------------------


    // Lấy danh sách tất cả người dùng
    getAllPromotionAdmin: async (page = 1, limit = 9999) => {
        try {
            return await http.get(
                `/QuanLyKhuyenMai/LayDanhSachKhuyenMaiAdmin?page=${page}&limit=${limit}`
            );
        } catch (error) {
            console.error("Lỗi trong promotion service:", error);
            throw error;
        }
    },



};
