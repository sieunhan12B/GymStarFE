import { http } from "./config";

/**
 * Service quản lý API liên quan đến sản phẩm
 */
export const productService = {
    // ================== ADMIN ==================

    /** Lấy tất cả sản phẩm (Admin) */
    getAllForAdmin: (page = 1, limit = 9999) =>
        http.get(`/QuanLySanPham/LayTatCaSanPhamAdmin?page=${page}&limit=${limit}`),

    /** Tạo sản phẩm đầy đủ */
    createProduct: (data) =>
        http.post("/QuanLySanPham/TaoSanPhamFull", data),

    /** Cập nhật thông tin sản phẩm */
    updateProductInfo: (product_id, data) =>
        http.put(`/QuanLySanPham/CapNhatSanPham/${product_id}`, data),

    /** Xóa sản phẩm */
    deleteProduct: (product_id) =>
        http.delete(`/QuanLySanPham/XoaSanPham/${product_id}`),

    /** Cập nhật trạng thái sản phẩm */
    updateProductStatus: (product_id) =>
        http.put(`/QuanLySanPham/CapNhatTrangThaiSanPham/${product_id}`),

    // ================== BIẾN THỂ ==================

    /** Thêm biến thể cho sản phẩm */
    addProductVariant: (product_id, formData) =>
        http.post(`/QuanLySanPham/ThemBienThe/${product_id}`, formData),

    /** Xóa biến thể theo màu */
    deleteVariantByColor: (product_id, color) =>
        http.delete(
            `/QuanLySanPham/XoaBienThe/${product_id}/${encodeURIComponent(color)}`
        ),

    /** Thêm size cho biến thể theo màu */
    addSizeToVariant: (product_id, color, sizeData) =>
        http.post(
            `/QuanLySanPham/ThemSize/${product_id}/${encodeURIComponent(color)}`,
            sizeData
        ),

    /** Xóa size theo product_variant_id */
    deleteSize: (product_variant_id) =>
        http.delete(`/QuanLySanPham/XoaSize/${product_variant_id}`),

    // ================== USER ==================


    /** Lấy sản phẩm bán chạy */
    getBestSellingProducts: (page = 1, limit = 10) =>
        http.get(`/QuanLySanPham/LayDanhSachSanPhamBanChay?page=${page}&limit=${limit}`),

    /** Lấy sản phẩm đang giảm giá */
    getDiscountedProducts: (page = 1, limit = 10) =>
        http.get(`/QuanLySanPham/LayDanhSachSanPhamDangGiamGia?page=${page}&limit=${limit}`),


    /** Lấy chi tiết sản phẩm theo product_id */
    getProductById: (product_id) =>
        http.get(`/QuanLySanPham/LayChiTietSanPham/${product_id}`),

    /** Lấy sản phẩm theo danh mục (tổng quát) */
    getProductByCategoryId: (category_id, page = 1, limit = 999) =>
        http.get(
            `/QuanLySanPham/LaySanPhamTheoDanhMuc/${category_id}?page=${page}&limit=${limit}`
        ),



    /** Lấy sản phẩm mới nhất (x ngày gần đây) */
    getNewestProducts: (day = 30, page = 1, limit = 9999) =>
        http.get(
            `/QuanLySanPham/LayTatCaSanPhamMoiTao?day=${day}&page=${page}&limit=${limit}`
        ),

    /** Tìm sản phẩm theo từ khóa (User) */
    getAllForUserWithKeyWord: (keyword, page = 1, limit = 9999) =>
        http.get(
            `/QuanLySanPham/LayDanhSachSanPhamTheoTuKhoaUser?keyword=${encodeURIComponent(
                keyword
            )}&page=${page}&limit=${limit}`
        ),



};


