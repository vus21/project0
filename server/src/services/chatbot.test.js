import { jest } from '@jest/globals';

// 1. Khởi tạo sẵn các hàm mock (để kiểm tra kết quả sau này)
const mockGenerateContent = jest.fn();
const mockFind = jest.fn();

// 2. BẮT BUỘC: Mock các thư viện BẰNG unstable_mockModule TRƯỚC khi import service
jest.unstable_mockModule('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: { generateContent: mockGenerateContent }
    }))
}));

jest.unstable_mockModule('../models/Product.js', () => ({
    default: { find: mockFind }
}));

// 3. Import động service (Đợi mock xong mới cho phép nạp chatbotService.js)
const { generateChatResponse } = await import('./chatbotService.js');

describe('Kiểm thử tự động Chatbot Service (OLDMAN)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mô phỏng dữ liệu DB trả về
    const mockDBProducts = [
        { name: 'Áo Sơ Mi Nam', slug: 'ao-so-mi', basePrice: 500, variants: [{ color: 'Trắng', size: 'M', stock: 10, isActive: true }] },
        { name: 'Quần Âu', slug: 'quan-au', basePrice: 600, variants: [{ color: 'Đen', size: 'L', stock: 0, isActive: true }] } // Hết hàng
    ];

    test('TC_01: Sinh câu trả lời thành công khi có sản phẩm', async () => {
        mockFind.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([mockDBProducts[0]])
        });
        mockGenerateContent.mockResolvedValue({ text: 'Đây là mẫu [Áo Sơ Mi Nam](/products/ao-so-mi) phù hợp với bạn.' });

        const result = await generateChatResponse('Tôi muốn mua áo sơ mi');
        expect(result).toContain('[Áo Sơ Mi Nam]');
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    test('TC_02: Loại bỏ sản phẩm "Hết hàng" trước khi gửi cho AI', async () => {
        mockFind.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockDBProducts)
        });
        mockGenerateContent.mockResolvedValue({ text: 'Xin lỗi, quần âu đã hết.' });

        await generateChatResponse('Tìm quần âu');
        
        // Kiểm tra xem Prompt gửi đi có bị loại bỏ quần âu (stock = 0) không
        const callArgs = mockGenerateContent.mock.calls[0][0];
        const systemInstruction = callArgs.contents[0].parts[0].text;
        expect(systemInstruction).not.toContain('Quần Âu'); 
    });

    test('TC_03: Trả về link sản phẩm đúng chuẩn Markdown', async () => {
        mockFind.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([mockDBProducts[0]])
        });
        mockGenerateContent.mockResolvedValue({ text: '[Áo Sơ Mi Nam](/products/ao-so-mi)' });

        const result = await generateChatResponse('Cho xin link áo sơ mi');
        expect(result).toMatch(/\[.*\]\(\/products\/.*\)/); 
    });

    test('TC_04: Bắt lỗi khi mất kết nối Google Gemini API', async () => {
        mockFind.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([])
        });
        mockGenerateContent.mockRejectedValue(new Error('Network Error'));

        await expect(generateChatResponse('Xin chào'))
            .rejects
            .toThrow('Không thể kết nối với AI.');
    });

    test('TC_05: Xử lý mượt mà khi Database rỗng (Không có sản phẩm nào)', async () => {
        mockFind.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]) 
        });
        mockGenerateContent.mockResolvedValue({ text: 'Hiện tại cửa hàng đang cập nhật sản phẩm mới.' });

        const result = await generateChatResponse('Có đồ gì mới không?');
        expect(result).toBe('Hiện tại cửa hàng đang cập nhật sản phẩm mới.');
    });
});