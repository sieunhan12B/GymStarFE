import { http } from "./config";

export const cartService = {



    //xem giỏ hàng
    getCart: async () => {
        try {
            return await http.get("/QuanLyGioHang/XemGioHang/");
        } catch (error) {
            console.error("Lỗi trong cartService:", error);
            throw error;
        }
    },



    // Thêm vào giỏ hàng
    addToCart: async (data) => {
        try {
            return await http.post("/QuanLyGioHang/ThemSanPhamVaoGioHang/", data);
        } catch (error) {
            console.error("Lỗi trong cartService:", error);
            throw error;
        }
    },

    //Cập nhật số lượng 
    updateCart: async (data) => {
        try {
            return await http.put("/QuanLyGioHang/CapNhatSoLuongGioHang2/", data);
        } catch (error) {
            console.error("Lỗi trong cartService:", error);
            throw error;
        }
    },

    //Xóa một sản phẩm 
    deleteCartItem: async (data) => {
        try {
            return await http.delete("/QuanLyGioHang/XoaSanPhamKhoiGioHang/", {
                data: data  // ⚡ phải bọc trong "data"
            });
        } catch (error) {
            console.error("Lỗi trong cartService:", error);
            throw error;
        }
    },


    //Xóa nhiều sản phẩm
    deleteCartItems: async (data) => {
        try {
            return await http.delete("/QuanLyGioHang/XoaNhieuSanPhamKhoiGioHang/", data);
        } catch (error) {
            console.error("Lỗi trong cartService:", error);
            throw error;
        }
    },







};


