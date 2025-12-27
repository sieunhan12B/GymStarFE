import { http } from "./config";

export const dashboardService = {


    getDashboardDay: async () => {
        try {
            return await http.get("/ThongKeBaoCao/ThongKeBaoCaoTheoNgay");
        } catch (error) {
            console.error("Lỗi lấy thống kê báo cáo :", error);
            throw error;
        }
    },

    getTopProductMonth: async () => {
        try {
            return await http.get("/ThongKeBaoCao/ThongKeSanPhamBanChay");
        } catch (error) {
            console.error("Lỗi lấy top sản phẩm bán chạy :", error);
            throw error;
        }
    },


    getRevenueOrder:async (from, to) => {
    try {
      return await http.get(
        "/ThongKeBaoCao/ThongKeTongDoanhThuTheoThang",
        {
          params: {
            from,
            to
          }
        }
      );
    } catch (error) {
      console.error("Lỗi lấy thống kê theo ngày:", error);
      throw error;
    }
  },

};
