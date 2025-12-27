import { http } from "./config";

export const feedbackService = {




    addFeedback: async (data) => {
        try {
            return await http.post(
                "/QuanLyGopY/VietGopY", data
            );
        } catch (error) {
            console.error("Lỗi trong feedbackService:", error);
            throw error;
        }
    },

    getAll: async () => {
        try {
            return await http.get(
                "/QuanLyGopY/LayDanhSachTatCaGopY?page=1&limit=9999"
            );
        } catch (error) {
            console.error("Lỗi trong feedbackService:", error);
            throw error;
        }
    },
    reply:async (data,feedback_id) => {
        try {
            return await http.post(
                `/QuanLyGopY/TraLoiGopY/${feedback_id}`,data
            );
        } catch (error) {
            console.error("Lỗi trong feedbackService:", error);
            throw error;
        }
    },
    deleteFeedback:async (feedback_id) => {
        try {
            return await http.delete(
                `/QuanLyGopY/XoaGopY/${feedback_id}`
            );
        } catch (error) {
            console.error("Lỗi trong feedbackService:", error);
            throw error;
        }
    },

    getFeedbackUser:async () => {
        try {
            return await http.get(
                "/QuanLyGopY/LayDanhSachGopYUser?page=1&limit=9999"
            );
        } catch (error) {
            console.error("Lỗi trong feedbackService:", error);
            throw error;
        }
    },




};
