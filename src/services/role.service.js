import { http } from "./config";

/**
 * Service quản lý API liên quan đến role
 */
export const roleService = {
    // ================== ADMIN ==================

    /** Lấy danh sách tất cả role */
    getAllRoles: () => {
        return http.get("/QuanLyNguoiDung/LayDanhSachRole");
    },

    /** Tạo role mới */
    createRole: (data) => {
        return http.post("/QuanLyNguoiDung/TaoRole", data);
    },

    /** Xóa role */
    deleteRole: (role_id) => {
        return http.delete(`/QuanLyNguoiDung/XoaRole/${role_id}`);
    },

    /** Cập nhật role */
    updateRole: (role_id, data) => {
        return http.put(`/QuanLyNguoiDung/CapNhatRole/${role_id}`, data);
    },

};