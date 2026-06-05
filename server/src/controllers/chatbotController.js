import * as chatbotService from '../services/chatbotService.js';

export const handleChatMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Tin nhắn không được để trống" });
        }

        const reply = await chatbotService.generateChatResponse(message);

        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ error: "Lỗi hệ thống khi xử lý chatbot" });
    }
};