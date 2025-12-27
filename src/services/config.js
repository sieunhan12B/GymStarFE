import axios from "axios";
import { store } from "@/redux/configStore";
import Cookies from "js-cookie";


export const http = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 80000,
});

// 🟦 Interceptor request (gắn token nếu có)
http.interceptors.request.use((config) => {
  if (config.url?.includes("dat-lai-mat-khau")) {
    return config; // bỏ qua interceptor
  }

  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// 🟥 Interceptor response (log lỗi + throw)  
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔥 API Error:", error.response?.data || error.message);
    return Promise.reject(error); // IMPORTANT: throw lỗi ra ngoài
  }
);
