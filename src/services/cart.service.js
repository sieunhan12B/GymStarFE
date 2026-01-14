import { http } from "./config";

/**
 * Service quản lý API liên quan đến giỏ hàng
 */
export const cartService = {
    // ================== CART ==================

    /** Xem giỏ hàng của người dùng */
    getCart: () => {
        return http.get("/QuanLyGioHang/XemGioHang/");
    },

    /** Thêm sản phẩm vào giỏ hàng */
    addToCart: (data) => {
        return http.post("/QuanLyGioHang/ThemSanPhamVaoGioHang", data);
    },

    /** Cập nhật số lượng sản phẩm trong giỏ hàng, data=product_variant_id */
    updateCart: (data) => {
        return http.put("/QuanLyGioHang/CapNhatSoLuongGioHang2/", data);
    },

    /** Xóa một sản phẩm khỏi giỏ hàng */
    deleteCartItem: (data) => {
        return http.delete("/QuanLyGioHang/XoaSanPhamKhoiGioHang/", {
            data
        });
    },

    /** Xóa nhiều sản phẩm khỏi giỏ hàng */
    deleteCartItems: (data) => {
        return http.delete("/QuanLyGioHang/XoaNhieuSanPhamKhoiGioHang/", {
            data
        });
    },






};


