import { http } from "./config";

/**
 * Service quản lý API liên quan đến đơn hàng
 */
export const orderService = {
    // ================== ORDER ==================

    /** Lấy tất cả đơn hàng (admin) */
    getAllOrder: (page = 1, limit = 999) => {
        return http.get(
            `/QuanLyDonHang/LayDanhSachTatCaDonHang?page=${page}&limit=${limit}`
        );
    },

    /** Cập nhật trạng thái đơn hàng */
    updateStatusOrder: (order_id, data) => {
        return http.put(
            `/QuanLyDonHang/CapNhatTrangThaiDonHang/${order_id}`,
            data
        );
    },

    /** Đặt hàng từ giỏ hàng */
    createOrder: (data) => {
        return http.post("/QuanLyDonHang/DatHangTuGioHang", data);
    },

    /** Đặt hàng ngay */
    orderNow: (data) => {
        return http.post("/QuanLyDonHang/DatHangNgay", data);
    },

    /** Lấy chi tiết đơn hàng */
    getDetailOrder: (order_id) => {
        return http.get(`/QuanLyDonHang/LayChiTietDonHang/${order_id}`);
    },

    /** Hủy đơn hàng */
    deleteOrder: (order_id, data) => {
        return http.post(`/QuanLyDonHang/HuyDonHang/${order_id}`, data);
    },

    /** Lấy danh sách đơn hàng của user */
    getOrderByUser: (page = 1, limit = 999) => {
        return http.get(
            `/QuanLyDonHang/LayDanhSachDonHangUser?page=${page}&limit=${limit}`
        );
    },

    /** Mua lại đơn hàng */
    buyAgain: (order_detail_id) => {
        return http.post(`/QuanLyDonHang/MuaLai/${order_detail_id}`);
    },

};
