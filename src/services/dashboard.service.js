import { http } from "./config";

/**
 * Service quản lý API liên quan đến dashboard
 */
export const dashboardService = {
  // ================== DASHBOARD ==================

  /** Thống kê báo cáo theo ngày */
  getDashboardDay: () => {
    return http.get("/ThongKeBaoCao/ThongKeBaoCaoTheoNgay");
  },

  /** Lấy top sản phẩm bán chạy trong tháng */
  getTopProductMonth: () => {
    return http.get("/ThongKeBaoCao/ThongKeSanPhamBanChay");
  },

  /** Thống kê tổng doanh thu theo khoảng thời gian */
  getRevenueOrder: (from, to) => {
    return http.get("/ThongKeBaoCao/ThongKeTongDoanhThuTheoThang", {
      params: {
        from,
        to,
      },
    });
  },
};
