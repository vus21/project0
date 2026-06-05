import { axiosInstance } from './axiosInstance';

export const chatbotApi = {
    sendMessage: (message) => axiosInstance.post('/chatbot/message', { message }),
};