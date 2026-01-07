import { http } from "./config";

/**
 * Service quản lý API liên quan đến địa chỉ giao hàng
 */
export const addressService = {
  // ================== GET ==================

  /** Lấy danh sách tất cả địa chỉ của tất cả người dùng */
  getAllAddressUser: (page = 1, limit = 9999) => {
    return http.get(`/QuanLyDiaChiGiaoHang/LayDanhSachTatCaDiaChi?page=${page}&limit=${limit}`);
  },

  /** Lấy danh sách tất cả địa chỉ */
  getAddressById: () => {
    return http.get("/QuanLyDiaChiGiaoHang/LayDanhSachDiaChi");
  },

  // ================== ADD ==================

  /** Thêm địa chỉ mới */
  addAddress: (data) => {
    return http.post("/QuanLyDiaChiGiaoHang/ThemDiaChi", data);
  },

  // ================== DELETE ==================

  /** Xóa địa chỉ theo ID */
  deleteAddress: (address_id) => {
    return http.delete(`/QuanLyDiaChiGiaoHang/XoaDiaChi/${address_id}`);
  },

  // ================== UPDATE ==================

  /** Cập nhật thông tin địa chỉ theo ID */
  updateAddress: (address_id, data) => {
    return http.put(`/QuanLyDiaChiGiaoHang/CapNhatDiaChi/${address_id}`, data);
  },

  // ================== DEFAULT ==================

  /** Chọn địa chỉ mặc định */
  chooseDefaultAddress: (address_id) => {
    return http.put(`/QuanLyDiaChiGiaoHang/ChonDiaChiMacDinh/${address_id}`);
  },

};
