import { http } from "./config";

export const productService = {
    // Lấy tất cả sản phẩm
    getAllForAdmin: async () => {
        try {
            return await http.get("/QuanLySanPham/LayTatCaSanPhamAdmin?page=1&limit=9999");
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

    createProduct: async (data) => {
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

    // Lấy tất cả sản phẩm cho user
    getAllForUser: async () => {
        try {
            return await http.get("/QuanLySanPham/LayTatCaSanPhamUser?page=1&limit=9999");
        } catch (error) {
            console.error("Lỗi trong productService:", error);
            throw error;
        }
    },

    // Lấy chi tiết sản phẩm theo id sản phẩm
    getProductById: async (product_id) => {
        try {
            return await http.get(`/QuanLySanPham/LayChiTietSanPham/${product_id}`);
        } catch (error) {
            console.error("Lỗi lấy chi tiết sản phẩm theo id:", error);
            throw error;
        }
    },

    // Lấy tất cả sản phẩm theo id danh mục  cấp 1
    getProductByLevel1Category: async (category_id, page, limit) => {
        try {
            return await http.get(`/QuanLySanPham/LaySanPhamTheoDanhMucCap1/${category_id}?page=${page}&limit=${limit}`);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm theo danh mục:", error);
            throw error;
        }
    },

    // Lấy tất cả sản phẩm theo id danh mục  cấp 3
    getProductByLevel3Category: async (category_id, page = 1, limit = 999) => {
        try {
            return await http.get(
                `/QuanLySanPham/LaySanPhamTheoDanhMucCap3/${category_id}?page=${page}&limit=${limit}`
            );
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm theo danh mục:", error);
            throw error;
        }
    },

    getProductByCategoryId: async (category_id, page = 1, limit = 999) => {
        try {
            return await http.get(
                `/QuanLySanPham/LaySanPhamTheoDanhMuc/${category_id}?page=${page}&limit=${limit}`
            );
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm theo danh mục:", error);
            throw error;
        }
    },

    // Lấy danh sách sản phẩm mới nhất (2 ngày gần đây)
    getNewestProducts: async (page = 1, limit = 999) => {
        try {
            return await http.get(
                `/QuanLySanPham/LayTatCaSanPhamMoiTao2Ngay?page=${page}&limit=${limit}`
            );
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm mới nhất:", error);
            throw error;
        }
    },



    // Lấy tất cả sản phẩm cho user
    getAllForUserWithKeyWord: async (keyword, page = 1, limit = 9999) => {
        try {
            return await http.get(
                `/QuanLySanPham/LayDanhSachSanPhamTheoTuKhoaUser?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`
            );
        } catch (error) {
            console.error("Lỗi trong productService:", error);
            throw error;
        }
    },

    //Thêm size cho biến thể
    addSizeToVariant: async (product_id, color, sizeData) => {
        try {
            return await http.post(`/QuanLySanPham/ThemSize/${product_id}/${encodeURIComponent(color)}`, sizeData);
        } catch (error) {
            console.error("Lỗi thêm size mới:", error);
            throw error;
        }
    },

    // Xóa size (theo product_variant_id)
    deleteSize: async (product_variant_id) => {
        try {
            return await http.delete(`/QuanLySanPham/XoaSize/${product_variant_id}`);
        } catch (error) {
            console.error("Lỗi xóa size:", error);
            throw error;
        }
    },


    // Thêm biến thể cho sản phẩm
    addProductVariant: async (product_id, formData) => {
        try {
            return await http.post(
                `/QuanLySanPham/ThemBienThe/${product_id}`,
                formData
            );
        } catch (error) {
            console.error("Lỗi thêm biến thể:", error);
            throw error;
        }
    },


    // Xóa biến thể theo màu
    deleteVariantByColor: async (product_id, color) => {
        try {
            return await http.delete(
                `/QuanLySanPham/XoaBienThe/${product_id}/${encodeURIComponent(color)}`
            );
        } catch (error) {
            console.error("Lỗi xóa biến thể:", error);
            throw error;
        }
    },



};


