import { http } from "./config";

export const orderService = {

    getAll: async () => {
        try {
            return await http.get("/QuanLyDonHang/LayDanhSachTatCaDonHang?page=1&limit=100");
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    },

    updateStatus: async (order_id,data) => {
        try {
            return await http.post(`/QuanLyDonHang/CapNhatTrangThaiDonHang/${order_id}`,data);
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    },

    
    createOrder: async (data) => {
        try {
            return await http.post("/QuanLyDonHang/DatHangTuGioHang/", data);
        } catch (error) {
            console.error("Lỗi Order Services", error);
            throw error;
        }
    },

   
};
