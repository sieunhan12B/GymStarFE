import { http } from "./config";

/**
 * Service quản lý API liên quan đến khuyến mãi
 */
export const promotionService = {
    // ================== ADMIN ==================

    /** Lấy danh sách tất cả khuyến mãi (admin) */
    getAllPromotionAdmin: (page = 1, limit = 9999) => {
        return http.get(
            `/QuanLyKhuyenMai/LayDanhSachKhuyenMaiAdmin?page=${page}&limit=${limit}`
        );
    },

    /** Tạo khuyến mãi mới */
    createPromotion: (data) => {
        return http.post("/QuanLyKhuyenMai/TaoKhuyenMai", data);
    },

    /** Cập nhật khuyến mãi */
    updatePromotion: (promotion_id, data) => {
        return http.put(
            `/QuanLyKhuyenMai/CapNhatKhuyenMai/${promotion_id}`,
            data
        );
    },

    /** Xóa khuyến mãi */
    deletePromotion: (promotion_id) => {
        return http.delete(
            `/QuanLyKhuyenMai/XoaKhuyenMai/${promotion_id}`
        );
    },

    /** Toggle trạng thái khuyến mãi */
    changePromotionStatus: (promotion_id) => {
        return http.put(
            `/QuanLyKhuyenMai/CapNhatTrangThaiKhuyenMai/${promotion_id}`
        );
    },

    // ================== USER ==================

    /** Lấy danh sách khuyến mãi của user */
    getUserPromotions: () => {
        return http.get("/QuanLyKhuyenMai/LayDanhSachKhuyenMaiUser");
    },
};
