import { GoogleGenAI } from '@google/genai';
import Product from '../models/Product.js';
import { PRODUCT_TAGS, MATERIALS, SEASONS } from '../constants/index.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash';

const AVAILABLE_TAGS = Object.values(PRODUCT_TAGS);
const AVAILABLE_MATERIALS = Object.values(MATERIALS);
const AVAILABLE_SEASONS = Object.values(SEASONS);

/**
 * Bước 1: Phân tích ý định người dùng và trích xuất filter
 * dựa trên các constant hiện có của hệ thống (tags, materials, seasons),
 * cùng với category và keyword tự do để hỗ trợ truy hồi linh hoạt.
 *
 * @param {string} userMessage - Câu hỏi/yêu cầu của khách hàng
 * @returns {Promise<{ filters: { tags: string[], materials: string[], seasons: string[], categories: string[], keywords: string[] }, usage: object, responseTime: number }>}
 */
const extractFilters = async (userMessage) => {
    const startTime = Date.now();

    const prompt = `
Bạn là bộ phân tích ý định (intent extractor) cho hệ thống thời trang nam OLDMAN.

Dựa vào yêu cầu của khách hàng, hãy trích xuất các tiêu chí lọc sản phẩm và trả về DUY NHẤT một object JSON
theo đúng cấu trúc sau, không thêm bất kỳ văn bản giải thích nào khác:

{
  "tags": [],
  "materials": [],
  "seasons": [],
  "categories": [],
  "keywords": []
}

QUY TẮC BẮT BUỘC:
- "tags" CHỈ được chọn từ danh sách sau: ${JSON.stringify(AVAILABLE_TAGS)}
- "materials" CHỈ được chọn từ danh sách sau: ${JSON.stringify(AVAILABLE_MATERIALS)}
- "seasons" CHỈ được chọn từ danh sách sau: ${JSON.stringify(AVAILABLE_SEASONS)}
- "categories" là tên nhóm sản phẩm bằng tiếng Việt thường gặp (ví dụ: "áo", "quần", "phụ kiện", "áo thun", "áo sơ mi"...), suy ra từ ngữ cảnh.
- "keywords" là các từ khóa mô tả phong cách/ngữ cảnh tự do (ví dụ: "đi biển", "thoải mái", "trẻ trung").
- Nếu không chắc chắn về một mục, trả về mảng rỗng [] cho mục đó.
- TUYỆT ĐỐI không tự tạo giá trị mới ngoài các danh sách tags/materials/seasons đã cho.
- Chỉ trả về JSON hợp lệ, không có markdown code block, không có chữ thừa.

Yêu cầu của khách hàng: "${userMessage}"
`;

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            // Tác vụ extract filter rất đơn giản -> tắt thinking để giảm latency & token
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: 'application/json',
        },
    });
    console.log(response.usageMetadata);
    console.log(response.text);
    const responseTime = Date.now() - startTime;
    const usage = response.usageMetadata || {};

    let filters = { tags: [], materials: [], seasons: [], categories: [], keywords: [] };

    try {
        const rawText = response.text.trim();
        // Loại bỏ markdown code block nếu Gemini vô tình thêm vào
        const cleanText = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        filters = {
            tags: Array.isArray(parsed.tags) ? parsed.tags.filter(t => AVAILABLE_TAGS.includes(t)) : [],
            materials: Array.isArray(parsed.materials) ? parsed.materials.filter(m => AVAILABLE_MATERIALS.includes(m)) : [],
            seasons: Array.isArray(parsed.seasons) ? parsed.seasons.filter(s => AVAILABLE_SEASONS.includes(s)) : [],
            categories: Array.isArray(parsed.categories) ? parsed.categories : [],
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        };
    } catch (err) {
        console.error('Lỗi parse JSON từ extractFilters:', err, 'Raw text:', response.text);
        // Giữ filters mặc định (rỗng) -> findRelevantProducts sẽ fallback
    }

    return {
        filters,
        usage: {
            promptTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
            thoughtsTokens: usage.thoughtsTokenCount || 0,
            cachedTokens: usage.cachedContentTokenCount || 0,
        },
        responseTime,
    };
};

/**
 * Bước 2: Truy vấn MongoDB động dựa trên filter đã trích xuất,
 * chỉ lấy sản phẩm active, còn hàng, giới hạn ~20 sản phẩm,
 * và làm mỏng dữ liệu trả về cho prompt.
 *
 * @param {{ tags: string[], materials: string[], seasons: string[], categories: string[], keywords: string[] }} filters
 * @returns {Promise<{ products: Array<object>, productsFound: number, contextSize: number, responseTime: number }>}
 */
const findRelevantProducts = async (filters) => {
    const startTime = Date.now();

    const query = {
        isActive: true,
        'variants.stock': { $gt: 0 },
        'variants.isActive': true,
    };

    if (filters.tags?.length) {
        query.tags = { $in: filters.tags };
    }
    if (filters.materials?.length) {
        query.material = { $in: filters.materials };
    }
    if (filters.seasons?.length) {
        query.season = { $in: filters.seasons };
    }

    // Category là tên tiếng Việt tự do -> match gần đúng (regex) trên category_id.name qua $lookup
    // Vì populate không hỗ trợ filter trực tiếp, dùng aggregate khi có categories.
    let rawProducts;

    if (filters.categories?.length) {
        const categoryRegexes = filters.categories.map(
            c => new RegExp(c.trim(), 'i')
        );

        rawProducts = await Product.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_id',
                },
            },
            { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    'category_id.name': { $in: categoryRegexes },
                },
            },
            { $limit: 10 },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    basePrice: 1,
                    discountPrice: 1,
                    'category_id.name': 1,
                    material: 1,
                    tags: 1,
                    season: 1,
                    variants: 1,
                },
            },
        ]);

        // Fallback: nếu lọc theo category quá chặt không ra kết quả, bỏ filter category
        if (!rawProducts.length) {
            rawProducts = await Product.find(query)
                .populate('category_id', 'name')
                .select('name slug basePrice discountPrice tags season material variants')
                .limit(10)
                .lean();
        }
    } else {
        rawProducts = await Product.find(query)
            .populate('category_id', 'name')
            .select('name slug basePrice discountPrice tags season material variants')
            .limit(10)
            .lean();
    }

    // Làm mỏng dữ liệu: chỉ giữ các trường cần thiết cho prompt
    const products = rawProducts.map(p => {
        const availableStock = p.variants
            ?.filter(v => v.stock > 0 && v.isActive)
            .map(v => `${v.color}-${v.size}`)
            .join(', ');

        return {
            name: p.name,
            slug: p.slug,
            price: p.discountPrice || p.basePrice,
            category: p.category_id?.name || 'Khác',
            material: p.material || 'Chưa cập nhật',
            tags: p.tags?.join(', ') || '',
            season: p.season?.join(', ') || '',
            stock: availableStock || 'Hết hàng',
        };
    });

    const responseTime = Date.now() - startTime;
    const contextSize = JSON.stringify(products).length;

    return {
        products,
        productsFound: products.length,
        contextSize,
        responseTime,
    };
};

/**
 * Bước 3: Sinh câu trả lời tư vấn cuối cùng dựa trên danh sách
 * sản phẩm đã được lọc sẵn (context tối ưu).
 *
 * @param {string} userMessage - Câu hỏi gốc của khách hàng
 * @param {Array<object>} products - Danh sách sản phẩm đã lọc (đã làm mỏng)
 * @returns {Promise<{ text: string, usage: object, responseTime: number }>}
 */
const generateFinalResponse = async (userMessage, products) => {
    const startTime = Date.now();

    const systemInstruction = `
Bạn là trợ lý ảo tư vấn thời trang nam cao cấp của thương hiệu OLDMAN.
Dưới đây là danh sách sản phẩm phù hợp đã được hệ thống lọc sẵn theo yêu cầu khách hàng:
${JSON.stringify(products)}

YÊU CẦU BẮT BUỘC:
- Trả lời bằng giọng điệu lịch sự, nam tính, tinh tế và chuyên nghiệp.
- Chỉ gợi ý các sản phẩm CÓ SẴN trong danh sách trên. Không tự bịa sản phẩm.
- Nếu gợi ý sản phẩm, BẮT BUỘC phải trả về link chuẩn Markdown theo cấu trúc: [Tên Sản Phẩm](/products/slug-san-pham). (Hãy ghép "slug" trong data vào đúng vị trí "slug-san-pham").
- Tư vấn tập trung vào chất liệu (material), mùa (season), và báo cho khách biết các màu sắc/size hiện còn (dựa vào trường stock).
- Có thể phối đồ giữa các sản phẩm trong danh sách và giải thích lý do lựa chọn.
- Nếu danh sách sản phẩm trống hoặc không có sản phẩm phù hợp, hãy khéo léo xin lỗi và hỏi thêm thông tin/khuyến khích khách xem các danh mục khác.
`;

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            { role: 'user', parts: [{ text: systemInstruction }] },
            { role: 'user', parts: [{ text: userMessage }] },
        ],
        config: {
            // Tư vấn dựa trên data đã lọc sẵn -> không cần thinking sâu, giảm latency đáng kể
            thinkingConfig: { thinkingBudget: 0 },
        },
    });
    console.log(response.usageMetadata);
    console.log(response.text);
    const responseTime = Date.now() - startTime;
    const usage = response.usageMetadata || {};

    return {
        text: response.text,
        usage: {
            promptTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
            thoughtsTokens: usage.thoughtsTokenCount || 0,
            cachedTokens: usage.cachedContentTokenCount || 0,
        },
        responseTime,
    };
};

/**
 * Ghi log thống kê chi tiết cho từng bước và tổng thể của 1 request chatbot.
 *
 * @param {object} stats - Thống kê tổng hợp của toàn bộ pipeline
 * @param {object} stats.extractFiltersResult - Kết quả từ extractFilters (chứa usage, responseTime)
 * @param {object} stats.findRelevantProductsResult - Kết quả từ findRelevantProducts (chứa productsFound, contextSize, responseTime)
 * @param {object} stats.generateFinalResponseResult - Kết quả từ generateFinalResponse (chứa usage, responseTime)
 * @param {number} stats.totalResponseTime - Tổng thời gian xử lý toàn bộ request
 * @returns {void}
 */
const logUsageMetadata = ({
    extractFiltersResult,
    findRelevantProductsResult,
    generateFinalResponseResult,
    totalResponseTime,
}) => {
    // Log riêng từng bước
    console.log(JSON.stringify({
        step: 'extractFilters',
        responseTime: extractFiltersResult.responseTime,
        promptTokens: extractFiltersResult.usage.promptTokens,
        outputTokens: extractFiltersResult.usage.outputTokens,
        totalTokens: extractFiltersResult.usage.totalTokens,
        thoughtsTokens: extractFiltersResult.usage.thoughtsTokens,
        cachedTokens: extractFiltersResult.usage.cachedTokens,
    }));

    console.log(JSON.stringify({
        step: 'mongoQuery',
        responseTime: findRelevantProductsResult.responseTime,
        productsFound: findRelevantProductsResult.productsFound,
        contextSize: findRelevantProductsResult.contextSize,
    }));

    console.log(JSON.stringify({
        step: 'generateResponse',
        responseTime: generateFinalResponseResult.responseTime,
        promptTokens: generateFinalResponseResult.usage.promptTokens,
        outputTokens: generateFinalResponseResult.usage.outputTokens,
        totalTokens: generateFinalResponseResult.usage.totalTokens,
        thoughtsTokens: generateFinalResponseResult.usage.thoughtsTokens,
        cachedTokens: generateFinalResponseResult.usage.cachedTokens,
    }));

    // Log tổng thể
    const totalPromptTokens = extractFiltersResult.usage.promptTokens + generateFinalResponseResult.usage.promptTokens;
    const totalOutputTokens = extractFiltersResult.usage.outputTokens + generateFinalResponseResult.usage.outputTokens;

    console.log(JSON.stringify({
        totalResponseTime,
        extractFilterTime: extractFiltersResult.responseTime,
        mongoQueryTime: findRelevantProductsResult.responseTime,
        generateResponseTime: generateFinalResponseResult.responseTime,

        productsFound: findRelevantProductsResult.productsFound,

        extractPromptTokens: extractFiltersResult.usage.promptTokens,
        extractOutputTokens: extractFiltersResult.usage.outputTokens,

        answerPromptTokens: generateFinalResponseResult.usage.promptTokens,
        answerOutputTokens: generateFinalResponseResult.usage.outputTokens,

        totalPromptTokens,
        totalOutputTokens,
        totalTokens: totalPromptTokens + totalOutputTokens,

        contextSize: findRelevantProductsResult.contextSize,
    }));
};

/**
 * Sinh câu trả lời chatbot dựa trên kiến trúc AI Retrieval:
 * 1. Trích xuất filter từ câu hỏi người dùng (Gemini call #1)
 * 2. Truy vấn MongoDB theo filter để lấy danh sách sản phẩm liên quan (~20 sản phẩm)
 * 3. Sinh câu trả lời tư vấn cuối cùng dựa trên danh sách đã lọc (Gemini call #2)
 *
 * @param {string} userMessage - Câu hỏi/yêu cầu của khách hàng
 * @returns {Promise<string>} Câu trả lời dạng markdown từ AI
 */
export const generateChatResponse = async (userMessage) => {
    const totalStartTime = Date.now();

    try {
        // Bước 1: Extract filters
        const extractFiltersResult = await extractFilters(userMessage);

        // Bước 2: Mongo query theo filter
        const findRelevantProductsResult = await findRelevantProducts(extractFiltersResult.filters);

        // Bước 3: Generate câu trả lời cuối cùng
        const generateFinalResponseResult = await generateFinalResponse(
            userMessage,
            findRelevantProductsResult.products
        );

        const totalResponseTime = Date.now() - totalStartTime;

        // Logging thống kê
        logUsageMetadata({
            extractFiltersResult,
            findRelevantProductsResult,
            generateFinalResponseResult,
            totalResponseTime,
        });

        return generateFinalResponseResult.text;
    } catch (error) {
        console.error('Lỗi tại chatbotService:', error);
        throw new Error('Không thể kết nối với AI.');
    }
};