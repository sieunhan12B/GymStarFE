import { http } from "./config";

export const authService = {

    signUp: async (data) => {
        try {
            return await http.post("/QuanLyNguoiDung/DangKy", data);
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    },

    logIn: async (data) => {
        try {
            return await http.post("/QuanLyNguoiDung/DangNhap", data);
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    },

    forgotPassword: async (data) => {
        try {
            return await http.post("/QuanLyNguoiDung/QuenMatKhau", data);
        } catch (error) {
            console.error("Lỗi quên mật khẩu:", error);
            throw error;
        }
    },

    verifyOtp: async (data) => {
        try {
            return await http.post("/QuanLyNguoiDung/verify-otp", data);
        } catch (error) {
            console.error("Lỗi xác thực OTP:", error);
            throw error;
        }
    },

    resetPassword: async (data) => {
        try {
            return await http.put("/QuanLyNguoiDung/DatLaiMatKhau", data);
        } catch (error) {
            console.error("Lỗi đặt lại mật khẩu:", error);
            throw error;
        }
    },

    getAll: async () => {
        try {
            return await http.get(
                "/QuanLyDanhMuc/LayDanhSachDanhMuc?page=1&limit=0"
            );
        } catch (error) {
            // Log kỹ thuật (optional)
            console.error("Lỗi trong danhMucService:", error);
            throw error; // quan trọng: đẩy lỗi ra ngoài để UI xử lý
        }
    },


    add: async (data) => {
        try {
            return await http.post("/QuanLyDanhMuc/ThemDanhMuc", data);
        } catch (error) {
            console.error("Lỗi thêm danh mục:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            return await http.put(`/QuanLyDanhMuc/CapNhatDanhMuc/${id}`, data);
        } catch (error) {
            console.error("Lỗi cập nhật danh mục:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            return await http.delete(`/QuanLyDanhMuc/XoaDanhMuc/${id}`);
        } catch (error) {
            console.error("Lỗi xóa danh mục:", error);
            throw error;
        }
    },
};
