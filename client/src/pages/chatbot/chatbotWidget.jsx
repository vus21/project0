import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatbotApi } from '../../api/chatbotApi';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Chào quý khách, tôi là trợ lý thời trang của OLDMAN. Quý khách đang tìm trang phục cho dịp nào hay có yêu cầu đặc biệt về chất liệu không?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatbotApi.sendMessage(userMsg);
            const botReplyText = response?.reply || response?.data?.reply || "Xin lỗi, hiện tại tôi không thể kết nối đến hệ thống.";
            setMessages(prev => [...prev, { sender: 'bot', text: botReplyText }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, hệ thống đang bận. Quý khách vui lòng thử lại sau.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-serif selection:bg-[#b8935f]/20">
            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="w-[340px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(184,147,95,0.15)] flex flex-col mb-5 overflow-hidden border border-[#e7dccb]">

                    {/* Header - Phong cách sang trọng */}
                    <div className="bg-[#1f1a14] text-[#f8f5ef] px-5 py-4 flex justify-between items-center border-b border-[#b8935f]/30">
                        <div className="flex items-center gap-2">
                            {/* Chấm xanh online nhỏ */}
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-sans text-xs tracking-widest uppercase font-semibold text-[#b8935f]">
                                Stylist Trực Tuyến
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-[#7b6753] hover:text-[#b8935f] transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body chứa tin nhắn - Nền màu kem đặc trưng của OLDMAN */}
                    <div className="flex-1 p-5 overflow-y-auto bg-[#f8f5ef] flex flex-col space-y-4 scrollbar-thin scrollbar-thumb-[#e7dccb]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] px-4 py-2.5 text-[14px] font-sans leading-relaxed ${msg.sender === 'user'
                                            // Tin nhắn của khách: Nền xám đen, chữ trắng ngà
                                            ? 'bg-[#1f1a14] text-[#f8f5ef] rounded-2xl rounded-tr-sm shadow-sm'
                                            // Tin nhắn của Bot: Nền trắng, viền be, chữ nâu
                                            : 'bg-white text-[#5e4a36] shadow-sm border border-[#e7dccb] rounded-2xl rounded-tl-sm'
                                        }`}
                                >
                                    {/* Markdown render links màu vàng Gold */}
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a {...props} className="text-[#b8935f] font-semibold hover:text-[#a57f4c] underline decoration-1 underline-offset-2 transition-colors" />
                                            )
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-[#7b6753] px-4 py-3 rounded-2xl rounded-tl-sm text-xs font-sans border border-[#e7dccb] shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-[#b8935f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-[#b8935f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-[#b8935f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input - Dùng form viền bo góc hiện đại nhưng màu cổ điển */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#e7dccb] flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            placeholder="Nhập yêu cầu của quý khách..."
                            className="flex-1 bg-[#f8f5ef] text-[#1f1a14] font-sans text-sm rounded-xl px-4 py-3 border border-[#e7dccb] focus:outline-none focus:border-[#b8935f] focus:ring-1 focus:ring-[#b8935f] placeholder-[#7b6753] transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-[#1f1a14] text-[#f8f5ef] w-11 h-11 rounded-xl flex justify-center items-center hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:bg-[#e7dccb] disabled:cursor-not-allowed cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Nút Chat Icon (Góc dưới phải) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex justify-center items-center transition-all float-right border cursor-pointer hover:-translate-y-1 ${isOpen
                        ? 'bg-[#f8f5ef] text-[#1f1a14] border-[#e7dccb] hover:border-[#b8935f]'
                        : 'bg-[#1f1a14] text-[#b8935f] border-[#b8935f] hover:bg-[#b8935f] hover:text-white hover:shadow-[0_8px_20px_rgba(184,147,95,0.3)]'
                    }`}
            >
                {isOpen ? (
                    <span className="text-xl">✕</span>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default ChatbotWidget;