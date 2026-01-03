import { http } from "./config";
import Cookies from "js-cookie";

/**
 * Service xử lý API liên quan đến xác thực (Auth)
 */
export const authService = {
    /** Đăng ký tài khoản mới */
    signUp: (data) => {
        return http.post("/QuanLyNguoiDung/DangKy", data);
    },

    /** Đăng nhập và lưu token vào Cookie */
    logIn: async (data) => {
        const response = await http.post("/QuanLyNguoiDung/DangNhap", data);

        Cookies.set("access_token", response.data.access_token, {
            expires: 15,
            secure: true,
            sameSite: "Strict",
        });

        return response;
    },

    /** Quên mật khẩu */
    forgotPassword: (data) => {
        return http.post("/QuanLyNguoiDung/QuenMatKhau", data);
    },

    /** Xác thực OTP */
    verifyOtp: (data) => {
        return http.post("/QuanLyNguoiDung/verify-otp", data);
    },

    /** Đặt lại mật khẩu bằng token */
    resetPassword: (data, resetToken) => {
        return http.put(
            "/QuanLyNguoiDung/DatLaiMatKhau",
            data,
            {
                headers: {
                    Authorization: `Bearer ${resetToken}`,
                },
            }
        );
    },
};
