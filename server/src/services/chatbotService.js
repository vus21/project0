import { GoogleGenAI } from '@google/genai';
import Product from '../models/Product.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateChatResponse = async (userMessage) => {
    try {
        // 1. Query tối ưu: Chỉ lấy sản phẩm đang bán (isActive), lấy các trường cần thiết và map category name
        const rawProducts = await Product.find({ isActive: true })
            .populate('category_id', 'name')
            .select('name slug basePrice discountPrice tags season material variants')
            .lean();

        // 2. Ép kiểu và gọt giũa dữ liệu (Làm mỏng JSON)
        const optimizedContextData = rawProducts.map(p => {
            // Lọc các variant còn hàng và gộp thành 1 chuỗi string ngắn gọn (Vd: "Đen-M, Trắng-L")
            const availableStock = p.variants
                ?.filter(v => v.stock > 0 && v.isActive)
                .map(v => `${v.color}-${v.size}`)
                .join(', ');

            return {
                name: p.name,
                link: `/products/${p.slug}`, // Tạo sẵn format link để AI chỉ việc in ra
                price: p.discountPrice || p.basePrice, // Ưu tiên giá đã giảm
                category: p.category_id?.name || "Khác",
                material: p.material || "Chưa cập nhật",
                tags: p.tags?.join(', ') || "",
                season: p.season?.join(', ') || "",
                stock: availableStock || "Hết hàng" // Báo cho AI biết kho còn màu/size gì
            };
        });

        // Loại bỏ hoàn toàn những sản phẩm đã "Hết hàng" để đỡ rác Prompt và tiết kiệm Token
        const finalDataForAI = optimizedContextData.filter(p => p.stock !== "Hết hàng");

        // 3. Viết Prompt truyền Context (Cập nhật phong cách OLDMAN)
        const systemInstruction = `
      Bạn là trợ lý ảo tư vấn thời trang nam cao cấp của thương hiệu OLDMAN. 
      Dựa vào yêu cầu của khách hàng, hãy gợi ý sản phẩm phù hợp nhất từ danh sách sau:
      ${JSON.stringify(finalDataForAI)}

      YÊU CẦU BẮT BUỘC:
      - Trả lời bằng giọng điệu lịch sự, nam tính, tinh tế và chuyên nghiệp.
      - Chỉ gợi ý các sản phẩm CÓ SẴN trong danh sách trên. Không tự bịa sản phẩm.
      - Nếu gợi ý sản phẩm, BẮT BUỘC phải trả về link chuẩn Markdown theo cấu trúc: [Tên Sản Phẩm](/products/slug-san-pham). (Hãy copy y hệt trường "link" trong data).
      - Tư vấn tập trung vào chất liệu (material), mùa (season), và báo cho khách biết các màu sắc/size hiện còn (dựa vào trường stock).
      - Nếu khách hỏi sản phẩm không có hoặc đã hết hàng, hãy khéo léo xin lỗi và gợi ý sang một sản phẩm tương tự.
    `;

        // 4. Gọi Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                { role: 'user', parts: [{ text: userMessage }] }
            ]
        });

        return response.text;
    } catch (error) {
        console.error("Lỗi tại chatbotService:", error);
        throw new Error("Không thể kết nối với AI.");
    }
};