import { http } from "./config";

export const orderService = {

    getAll: async () => {
        try {
            return await http.get("/QuanLyDonHang/LayDanhSachTatCaDonHang?page=1&limit=999");
        } catch (error) {
            console.error("Lỗi Order Services:", error);
            throw error;
        }
    },

    updateStatus: async (order_id, data) => {
        try {
            return await http.put(`/QuanLyDonHang/CapNhatTrangThaiDonHang/${order_id}`, data);
        } catch (error) {
            console.error("Lỗi Order Services:", error);
            throw error;
        }
    },


    createOrder: async (data) => {
        try {
            return await http.post("/QuanLyDonHang/DatHangTuGioHang", data);
        } catch (error) {
            console.error("Lỗi Order Services", error);
            throw error;
        }
    },

    orderNow: async (data) => {
        try {
            return await http.post("/QuanLyDonHang/DatHangNgay", data);
        } catch (error) {
            console.error("Lỗi Order Services", error);
            throw error;
        }
    },

    getDetailOrder: async (order_id) => {
        try {
            return await http.get(`/QuanLyDonHang/LayChiTietDonHang/${order_id}`);
        } catch (error) {
            console.error("Lỗi Order Services:", error);
            throw error;
        }
    },

    deleteOrder: async (order_id, data) => {
        try {
            return await http.post(`/QuanLyDonHang/HuyDonHang/${order_id}`, data);
        } catch (error) {
            console.error("Lỗi Order Services:", error);
            throw error;
        }
    },
    getOrderByUser: async (page = 1, limit = 999) => {
        try {
            return await http.get(`/QuanLyDonHang/LayDanhSachDonHangUser?page=${page}&limit=${limit}`);
        } catch (error) {
            console.error("Lỗi Order Services:", error);
            throw error;
        }
    },

    buyAgain: async (order_detail_id) => {
        try {
            return await http.post(`/QuanLyDonHang/MuaLai/${order_detail_id}`);
        } catch (error) {
            console.error("Lỗi Order Services:", error);
            throw error;
        }
    },


};
