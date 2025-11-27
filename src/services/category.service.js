import { http } from "./config";

export const danhMucService = {
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
