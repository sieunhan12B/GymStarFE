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

  getCategoryLvl1: async () => {
  try {
    return await http.get("/QuanLyDanhMuc/LayDanhMucCap1");
  } catch (error) {
    console.error("Lỗi lấy danh mục cấp 1:", error);
    throw error;
  }
},


  

  add: async (data) => {
    try {
      return await http.post("/QuanLyDanhMuc/TaoDanhMuc", data);
    } catch (error) {
      console.error("Lỗi thêm danh mục:", error);
      throw error;
    }
  },

  update: async (category_id, data) => {
    try {
      return await http.put(`/QuanLyDanhMuc/CapNhatDanhMuc/${category_id}`, data);
    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
      throw error;
    }
  },

  delete: async (category_id) => {
    try {
      return await http.delete(`/QuanLyDanhMuc/XoaDanhMuc/${category_id}`);
    } catch (error) {
      console.error("Lỗi xóa danh mục:", error);
      throw error;
    }
  },
};
