import { http } from "./config";

export const roleService = {


    // ------------------ ADMIN ------------------


    // Lấy danh sách tất cả người dùng
    getAll: async () => {
        try {
            return await http.get(
                "/QuanLyNguoiDung/LayDanhSachRole"
            );
        } catch (error) {
            console.error("Lỗi trong roleService:", error);
            throw error;
        }
    },

    createRole: async (data) => {
        try {
            return await http.post("/QuanLyNguoiDung/TaoRole", data);
        } catch (error) {
            console.error("Lỗi cập bên roleService:", error);
            throw error;
        }
    },

    deleteRole: async (role_id) => {
        try {
            return await http.delete(`/QuanLyNguoiDung/XoaRole/${role_id}`);
        } catch (error) {
            console.error("Lỗi bên roleService:", error);
            throw error;
        }

    },
    updateRole: async (role_id, data) => {
        try {
            return await http.put(`/QuanLyNguoiDung/CapNhatRole/${role_id}`, data);
        } catch (error) {
            console.error("Lỗi cập nhật loại người dùng:", error);
            throw error;
        }
    },

};