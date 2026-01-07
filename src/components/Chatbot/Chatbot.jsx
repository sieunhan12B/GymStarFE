import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Spin } from "antd";
import { SendOutlined, CloseOutlined, CommentOutlined } from "@ant-design/icons";
import { chatbotService } from "../../services/chatbot.service";
import { useSelector } from "react-redux";

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);
    const user = useSelector((state) => state.userSlice.user)

    const quickReplies = [
        "Hiện có khuyến mãi nào không?",
        "Kiểm tra đơn hàng của tôi",
        "Sản phẩm giá dưới 500.000",
        "Có áo màu đỏ không?",
        "Sản phẩm còn hàng màu xanh lá",
        "Có áo nào size M không?",
        "Quy định đổi trả",
        "Tôi muốn hủy đơn hàng thì thế nào?",
        "Đổi trả sản phẩm có được không?"
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = async (text) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { type: "user", text }]);
        setInput("");
        setLoading(true);

        try {
            const data = {
                message: text,
                user_id: user.user_id,
            }
            const res = await chatbotService.chatbot(data);
            const { answer, products } = res.data;
            setMessages(prev => [...prev, { type: "bot", text: answer, products }]);
        } catch (err) {
            setMessages(prev => [...prev, { type: "bot", text: "Xin lỗi, có lỗi xảy ra." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button - Minimalist Black */}
            {!open && (
                <button
                    className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl hover:shadow-black/40 hover:scale-105 transition-all duration-300 z-50 border-2 border-gray-900"
                    onClick={() => setOpen(true)}
                >
                    <CommentOutlined style={{ fontSize: 26 }} />
                </button>
            )}

            {/* Chat Window - Black & White Theme */}
            {open && (
                <div className="fixed bottom-6 right-6 w-[420px] max-w-full h-[600px] bg-white shadow-2xl rounded-3xl flex flex-col overflow-hidden z-50 border-2 border-black">
                    {/* Header - Solid Black */}
                    <div className="bg-black text-white p-5 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
                                <CommentOutlined style={{ fontSize: 22, color: '#000' }} />
                            </div>
                            <div>
                                <div className="font-bold text-lg tracking-tight">Chatbot GymStar</div>
                                <div className="text-xs text-gray-400 flex items-center mt-0.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                        >
                            <CloseOutlined style={{ fontSize: 18 }} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-24">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CommentOutlined style={{ fontSize: 32, color: '#9ca3af' }} />
                                </div>
                                <p className="text-sm font-medium">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                                <p className="text-xs text-gray-400 mt-2">Gửi tin nhắn hoặc chọn câu hỏi gợi ý</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%]`}>
                                    <div className={`inline-block px-5 py-3 ${msg.type === "user"
                                            ? "bg-black text-white rounded-3xl rounded-br-md"
                                            : "bg-gray-100 text-gray-900 rounded-3xl rounded-bl-md border border-gray-200"
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    </div>

                                    {/* Product Cards - Minimal Design */}
                                    {msg.type === "bot" && msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 space-y-2.5">
                                            {msg.products.map(p => (
                                                <div
                                                    key={p.product_id}
                                                    className="bg-white hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-black rounded-2xl p-3"
                                                >
                                                    <div className="flex space-x-3">
                                                        <img
                                                            src={p.thumbnail}
                                                            alt={p.name}
                                                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{p.name}</div>
                                                            {p.variants ? (
                                                                <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                                    {p.variants.map(v => `${v.color}, ${v.size}: ${v.price.toLocaleString()}đ`).join(" | ")}
                                                                </div>
                                                            ) : (
                                                                <div className="text-base font-bold text-black mb-2">
                                                                    {p.price?.toLocaleString()}đ
                                                                </div>
                                                            )}
                                                            <a
                                                                href={p.link}
                                                                className="text-xs font-semibold text-black hover:underline inline-flex items-center"
                                                            >
                                                                Xem chi tiết →
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 border border-gray-200 px-5 py-3 rounded-3xl rounded-bl-md">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                    </div>

                    {/* Quick Replies - Minimal Pills */}
                    {quickReplies.length > 0 && messages.length === 0 && (
                        <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                            <p className="text-xs text-gray-600 mb-3 font-semibold uppercase tracking-wide">Câu hỏi thường gặp</p>
                            <div className="flex flex-wrap gap-2">
                                {quickReplies.slice(0, 4).map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(q)}
                                        className="text-xs px-4 py-2 bg-white text-gray-900 rounded-full hover:bg-black hover:text-white transition-all duration-200 border-2 border-gray-200 hover:border-black font-medium"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area - Clean Design */}
                    <div className="p-4 border-t-2 border-gray-200 bg-white">
                        <div className="flex space-x-2 items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="flex-1 border-2 border-gray-200 focus:border-black rounded-full px-5 py-2.5 focus:outline-none text-sm transition-all duration-200"
                            />
                            <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim()}
                                className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-200 ${input.trim()
                                        ? 'bg-black text-white hover:scale-105 hover:shadow-lg'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <SendOutlined style={{ fontSize: 16 }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;