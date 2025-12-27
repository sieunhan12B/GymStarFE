import { http } from "./config";
import Cookies from "js-cookie";

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
            const response = await http.post("/QuanLyNguoiDung/DangNhap", data);
            Cookies.set("access_token", response.data.access_token, {
                expires: 15,
                secure: true,
                sameSite: "Strict"
            });
            return response; // trả về user info


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

    resetPassword: async (data, resetToken) => {
        try {
            return await http.put(
                "/QuanLyNguoiDung/DatLaiMatKhau",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${resetToken}`
                    }
                }
            );
        } catch (error) {
            console.error("Lỗi đặt lại mật khẩu:", error);
            throw error;
        }
    },



};
