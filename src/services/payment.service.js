import { http } from "./config";

/**
 * Service quản lý API liên quan đến thanh toán
 */
export const paymentService = {
    // ================== PAYMENT ==================

    /** Lấy danh sách tất cả giao dịch thanh toán (admin) */
    getAllPaymentsUser: (page = 1, limit = 999) => {
        return http.get(
            `/QuanLyThanhToan/LayDanhSachTatCaThanhToan?page=${page}&limit=${limit}`
        );
    },

    /** Thanh toán lại (retry) */
    reTryPayment: (data) => {
        return http.post("/MoMo/retry-checkout", data);
    },
};
