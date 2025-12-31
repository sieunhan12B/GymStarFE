import { http } from "./config";

export const promotionService = {


    // ------------------ ADMIN ------------------


    // Lấy danh sách tất cả khuyến mãi cho admin
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


    // 👉 Tạo khuyến mãi mới
    createPromotion: async (data) => {
        return await http.post(
            `/QuanLyKhuyenMai/TaoKhuyenMai`,
            data
        );
    },

    // 👉 Cập nhật khuyến mãi
    updatePromotion: async (promotion_id, data) => {
        return await http.put(
            `/QuanLyKhuyenMai/CapNhatKhuyenMai/${promotion_id}`,
            data
        );
    },

    // 👉 Xóa khuyến mãi
    deletePromotion: async (promotion_id) => {
        return await http.delete(
            `/QuanLyKhuyenMai/XoaKhuyenMai/${promotion_id}`
        );
    },

    // 👉 Toggle trạng thái khuyến mãi
    togglePromotionStatus: async (promotion_id) => {
        return await http.put(
            `/QuanLyKhuyenMai/CapNhatTrangThaiKhuyenMai/${promotion_id}`
        );
    },






};
