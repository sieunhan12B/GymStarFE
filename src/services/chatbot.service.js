import { http } from "./config";

export const chatbotService = {
    /** Chatbot */
    chatbot: (data) => {
        return http.post("/ChatBot/chatbot", data);
    },
};
