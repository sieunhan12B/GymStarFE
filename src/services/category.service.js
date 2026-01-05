import { http } from "./config";

/**
 * Service quản lý API liên quan đến danh mục
 */
export const danhMucService = {
  // ================== LẤY DANH MỤC ==================

  /** Lấy tất cả danh mục */
  getAllCategory: () => http.get("/QuanLyDanhMuc/LayDanhSachDanhMuc?page=1&limit=0"),

  /** Lấy danh mục cấp 3 theo category_id */
  getLvl3Category: (category_id) =>
    http.get(`/QuanLyDanhMuc/LayDanhMucCap3LocCap1/${category_id}`),

  // ================== QUẢN LÝ DANH MỤC ==================

  /** Thêm mới danh mục */
  addCategory: (data) => http.post("/QuanLyDanhMuc/TaoDanhMuc", data),

  /** Cập nhật danh mục theo category_id */
  updateCategory: (category_id, data) =>
    http.put(`/QuanLyDanhMuc/CapNhatDanhMuc/${category_id}`, data),

  /** Xóa danh mục theo category_id */
  deleteCategory: (category_id) =>
    http.delete(`/QuanLyDanhMuc/XoaDanhMuc/${category_id}`),
};
