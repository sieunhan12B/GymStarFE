import { http } from "./config";

export const userService = {


    // ------------------ ADMIN ------------------
    getAll: async () => {
        try {
            return await http.get(
                "/QuanLyNguoiDung/LayDanhSachNguoiDung?page=0&limit=0"
            );
        } catch (error) {
            console.error("Lỗi trong userService:", error);
            throw error;
        }
    },













    updateProfile: async (user_id, data) => {
        try {
            return await http.put(`/QuanLyNguoiDung/CapNhatThongTin/${user_id}`, data);
        } catch (error) {
            console.error("Lỗi cập nhật thông tin người dùng:", error);
            throw error;
        }
    },
    getInfoUser: async (user_id) => {
        try {
            return await http.get(`/QuanLyNguoiDung/LayThongTinNguoiDung/${user_id}`);
        } catch (error) {
            console.error("Lỗi lấy thông tin người dùng:", error);
            throw error;
        }
    },
    changePassword: async (user_id, data) => {
        try {
            return await http.put(`/QuanLyNguoiDung/DoiMatKhau/${user_id}`, data);
        } catch (error) {
            console.error("Lỗi cập nhật mật khẩu:", error);
            throw error;
        }
    },

};
