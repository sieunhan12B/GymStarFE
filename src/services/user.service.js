import { http } from "./config";

/**
 * Service quản lý API liên quan đến người dùng
 */
export const userService = {
    // ================== ADMIN ==================

    /** Lấy danh sách tất cả người dùng (Admin) */
    getAllUsers: (page=1,limit=9999) => {
        return http.get(`/QuanLyNguoiDung/LayDanhSachNguoiDung?page=${page}&limit=${limit}`);
    },

    /** Cập nhật trạng thái người dùng (kích hoạt / vô hiệu hóa) */
    updateUserStatus: (userId) => {
        return http.put(`/QuanLyNguoiDung/CapNhatTrangThai/${userId}`);
    },

    /** Cập nhật loại người dùng (Role) */
    updateUserRole: (userId, data) => {
        return http.put(`/QuanLyNguoiDung/PhanQuyenRole/${userId}`, data);
    },

    // ================== USER ==================

    /** Lấy thông tin người dùng hiện tại */
    getCurrentUser: () => {
        return http.get("/QuanLyNguoiDung/LayThongTinNguoiDung");
    },

    /** Cập nhật thông tin người dùng */
    updateUserProfile: (data) => {
        return http.put("/QuanLyNguoiDung/CapNhatThongTin", data);
    },

    /** Đổi mật khẩu người dùng */
    changePassword: (data) => {
        return http.put("/QuanLyNguoiDung/DoiMatKhau", data);
    },
};
