import axios from "axios";

export const http = axios.create({
  baseURL: "https://gymstarbe.onrender.com",
  timeout: 80000,
});

// 🟦 Interceptor request (gắn token nếu có)
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟥 Interceptor response (log lỗi + throw)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔥 API Error:", error.response?.data || error.message);
    return Promise.reject(error); // IMPORTANT: throw lỗi ra ngoài
  }
);
