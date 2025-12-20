import { http } from "./config";

export const productService = {
    // Lấy tất cả sản phẩm
    getAll: async () => {
        try {
            return await http.get("/QuanLySanPham/LayTatCaSanPhamAdmin?page=1&limit=9999");
        } catch (error) {
            console.error("Lỗi trong productService:", error);
            throw error;
        }
    },
    // Lấy tất cả sản phẩm cho user
    getAllForUser: async () => {
        try {
            return await http.get("/QuanLySanPham/LayTatCaSanPhamUser?page=1&limit=9999");
        } catch (error) {
            console.error("Lỗi trong productService:", error);
            throw error;
        }
    },

    // Lấy tất cả sản phẩm cho user
    getAllForUserWithKeyWord: async (keyword) => {
        try {
            return await http.get(
                `/QuanLySanPham/LayDanhSachSanPhamTheoTuKhoaUser?keyword=${encodeURIComponent(keyword)}&page=1&limit=9999`
            );
        } catch (error) {
            console.error("Lỗi trong productService:", error);
            throw error;
        }
    },


    // Cập nhật thông tin sản phẩm theo product_id
    updateInfo: async (product_id, data) => {
        try {
            return await http.put(`/QuanLySanPham/CapNhatSanPham/${product_id}`, data);
        } catch (error) {
            console.error("Lỗi cập nhật thông tin sản phẩm:", error);
            throw error;
        }
    },

    // Cập nhật thông tin biến thể theo product_id
    updateVariantInfo: async (product_variant_id, data) => {
        try {
            return await http.put(`/QuanLySanPham/CapNhatBienThe/${product_variant_id}`, data);
        } catch (error) {
            console.error("Lỗi cập nhật thông tin sản phẩm:", error);
            throw error;
        }
    },

    add: async (data) => {
        try {
            return await http.post("/QuanLySanPham/TaoSanPhamFull", data);
        } catch (error) {
            console.error("Lỗi thêm sản phẩm:", error);
            throw error;
        }
    },

    del: async (product_id) => {
        try {
            return await http.delete(`/QuanLySanPham/XoaSanPham/${product_id}`);
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
            throw error;
        }
    },


    // Cập nhật trạng thái sản phẩm theo product_id
    updateStatus: async (product_id) => {
        try {
            return await http.put(`/QuanLySanPham/CapNhatTrangThaiSanPham/${product_id}`);
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
            throw error;
        }
    },


    // ------------------ USER ------------------

    // Lấy tất cả sản phẩm theo id danh mục
    getProductsByCategoryId: async (category_id) => {
        try {
            return await http.get(`/QuanLySanPham/LaySanPhamTheoDanhMucCap1/${category_id}?page=1&limit=100`);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm theo danh mục:", error);
            throw error;
        }
    },

    getProductById: async (product_id) => {
        try {
            return await http.get(`/QuanLySanPham/LayChiTietSanPham/${product_id}`);
        } catch (error) {
            console.error("Lỗi lấy chi tiết sản phẩm theo id:", error);
            throw error;
        }
    },
    getProductByLevel1Category: async (category_id) => {
        try {
            return await http.get(`/QuanLySanPham/LaySanPhamTheoDanhMucCap1/${category_id}?page=1&limit=100`);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm theo danh mục:", error);
            throw error;
        }
    },

      getProductByLevel3Category: async (category_id) => {
        try {
            return await http.get(`/QuanLySanPham/LaySanPhamTheoDanhMucCap3/${category_id}?page=1&limit=100`);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm theo danh mục:", error);
            throw error;
        }
    },


};


