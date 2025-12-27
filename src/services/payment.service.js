import { http } from "./config";

export const paymentService = {


    // ------------------ ADMIN ------------------


    // Lấy danh sách tất cả người dùng
    getAll: async (page = 1, limit = 999) => {
        try {
            return await http.get(
                `/QuanLyThanhToan/LayDanhSachTatCaThanhToan?page=${page}&limit=${limit}`
            );

        } catch (error) {
            console.error("Lỗi trong paymentService:", error);
            throw error;
        }
    },

    reTryPayment: async (data) => {
        try {
            return await http.post("/MoMo/retry-checkout", data);
        } catch (error) {
            console.error("Lỗi trong paymentService:", error);
            throw error;
        }

    },
}