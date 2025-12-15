import { http } from "./config";

export const addressService = {


    getAddressById: async () => {
        try {
            return await http.get("/QuanLyDiaChiGiaoHang/LayDanhSachDiaChi");
        } catch (error) {
            console.error("Lỗi lấy địa chỉ:", error);
            throw error;
        }
    },

    addAddress: async (data) => {
        try {
            return await http.post("/QuanLyDiaChiGiaoHang/ThemDiaChi", data);
        } catch (error) {
            console.error("Lỗi thêm địa chỉ:", error);
            throw error;
        }
    },

    deleteAddress: async (address_id) => {
    try {
      return await http.delete(`/QuanLyDiaChiGiaoHang/XoaDiaChi/${address_id}`);
    } catch (error) {
      console.error("Lỗi xóa địa chỉ:", error);
      throw error;
    }
  },

  updateAddress: async (address_id,data) => {
    try {
      return await http.put(`/QuanLyDiaChiGiaoHang/CapNhatDiaChi/${address_id}`,data);
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ:", error);
      throw error;
    }
  },
  chooseDefaultAddress:async (address_id) => {
    try {
      return await http.put(`/QuanLyDiaChiGiaoHang/ChonDiaChiMacDinh/${address_id}`);
    } catch (error) {
      console.error("Lỗi chọn mặc định địa chỉ:", error);
      throw error;
    }
  },


};
