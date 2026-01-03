import axios from "axios";
import Cookies from "js-cookie";

/**
 * Axios instance dùng chung cho toàn bộ app
 */
export const http = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 80000,
});

/* ================= REQUEST INTERCEPTOR ================= */
/**
 * Tự động gắn access_token vào header
 */
http.interceptors.request.use(
  (config) => {
    // Bỏ qua interceptor cho endpoint reset password (nếu cần)
    if (config.url?.includes("dat-lai-mat-khau")) {
      return config;
    }

    const accessToken = Cookies.get("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
/**
 * Xử lý response & lỗi tập trung
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";

    console.error("🔥 API Error:", errorMessage);

    return Promise.reject(error);
  }
);
