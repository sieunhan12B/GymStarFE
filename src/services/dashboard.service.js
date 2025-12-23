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

    


};
