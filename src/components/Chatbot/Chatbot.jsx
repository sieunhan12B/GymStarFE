import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react";
import {
    SendOutlined,
    CloseOutlined,
    CommentOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { chatbotService } from "@/services/chatbot.service";
import { useSelector } from "react-redux";
import chatbot from '@/assets/images/chatbot.jpg';

const QUICK_REPLIES = [
    "Hiện có khuyến mãi nào không?",
    "Sản phẩm bán chạy nhất là gì?",
    "Bao lâu thì tôi nhận được hàng?",
    "Phí vận chuyển bao nhiêu?",
    "Kiểm tra đơn hàng của tôi",
    "Có áo màu đỏ không?",
    "Có áo nào size M không?",
    "Sản phẩm còn hàng không?",
    "Quy định đổi trả",
    "Tôi muốn hủy đơn hàng thì thế nào?",
];

const SYSTEM_GREETING = {
    type: "bot",
    text: "Xin chào 👋\nMình có thể giúp bạn về size, giá, khuyến mãi, đơn hàng hoặc chính sách đổi trả.",
    isPolicy: false,
};

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const user = useSelector((state) => state.userSlice.user);

    /* Auto scroll */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    /* Auto grow textarea */
    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
            textareaRef.current.scrollHeight + "px";
    }, [input]);

    /* Gửi tin nhắn */
    const handleSend = useCallback(
        async (text) => {
            if (!text.trim() || loading) return;

            setMessages((prev) => [...prev, { type: "user", text }]);
            setInput("");
            setLoading(true);

            try {
                const res = await chatbotService.chatbot({
                    message: text,
                    user_id: user?.user_id || null,
                });

                setMessages((prev) => [
                    ...prev,
                    {
                        type: "bot",
                        text:
                            res.data.answer ||
                            "Mình chưa hiểu rõ câu hỏi này.",
                        products: res.data.products || [],
                        isPolicy: res.data.products?.length === 0,
                    },
                ]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "bot",
                        text:
                            "Xin lỗi 😥 có lỗi xảy ra. Bạn thử hỏi lại hoặc chọn câu gợi ý nhé.",
                        isPolicy: true,
                    },
                ]);
            } finally {
                setLoading(false);
            }
        },
        [loading, user]
    );

    /* Khi mở chatbot lần đầu */
    const handleOpen = () => {
        setOpen(true);
        if (messages.length === 0) {
            setMessages([SYSTEM_GREETING]);
        }
    };

    return (
        <>
            {!open && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all z-50"
                >
                    <CommentOutlined style={{ fontSize: 26 }} />
                </button>
            )}

            {open && (
                <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white rounded-3xl shadow-2xl border-2 border-black flex flex-col overflow-hidden z-50">
                    {/* Header */}
                    <div className="bg-black text-white p-5 flex justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
                                <img
                                    src={chatbot}
                                    alt="Chatbot"
                                    className="w-10 h-10 rounded-full object-cover"
                                />


                            </div>
                            <div>
                                <div className="font-bold text-lg">
                                    Chatbot GymStar
                                </div>
                                <div className="text-xs text-gray-400 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Online
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="hover:bg-white/10 p-2 rounded-lg"
                        >
                            <CloseOutlined />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.type === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div className="max-w-[80%] space-y-2">
                                    {msg.isPolicy && (
                                        <div className="flex items-center text-xs text-gray-500 space-x-1">
                                            <InfoCircleOutlined />
                                            <span>Chính sách cửa hàng</span>
                                        </div>
                                    )}

                                    <div
                                        className={`px-5 py-3 text-sm whitespace-pre-wrap ${msg.type === "user"
                                            ? "bg-black text-white rounded-3xl rounded-br-md"
                                            : "bg-gray-100 border rounded-3xl rounded-bl-md"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {msg.products?.length > 0 && (
                                        <div className="space-y-2">
                                            {msg.products.map((p) => (
                                                <div
                                                    key={p.product_id}
                                                    className="bg-white hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-black rounded-2xl p-3"
                                                >
                                                    <div className="flex space-x-3">
                                                        <img
                                                            src={p.thumbnail}
                                                            alt={p.name}
                                                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
                                                        />

                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm line-clamp-2 mb-1">
                                                                {p.name}
                                                            </div>

                                                            {p.price && (
                                                                <div className="text-sm font-bold mb-2">
                                                                    {p.price.toLocaleString()}đ
                                                                </div>
                                                            )}

                                                            <a
                                                                href={p.link}
                                                                className="text-xs font-semibold hover:underline"
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

                        {loading && (
                            <div className="flex">
                                <div className="bg-gray-100 border px-5 py-3 rounded-3xl">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.4s" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick replies */}
                    <div className="p-4 bg-gray-50 border-t">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                            GỢI Ý
                        </p>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {QUICK_REPLIES.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="whitespace-nowrap text-xs px-4 py-2 border rounded-full hover:bg-black hover:text-white"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex items-end space-x-2">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                disabled={loading}
                                rows={1}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(input);
                                    }
                                }}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="flex-1 resize-none border rounded-2xl px-4 py-2 focus:outline-none"
                            />

                            <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || loading}
                                className={`w-11 h-11 rounded-full flex items-center justify-center ${input.trim() && !loading
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-400"
                                    }`}
                            >
                                <SendOutlined />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;