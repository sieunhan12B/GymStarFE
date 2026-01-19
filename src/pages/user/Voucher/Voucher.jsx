import React, { useState, useEffect } from "react";
import { Spin, Empty, Tag, message, Select } from "antd";
import { GiftOutlined, CalendarOutlined, ShoppingOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { promotionService } from "@/services/promotion.service";
import { formatPrice } from "@/utils/formatPrice";

const Voucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, available, used
    const [messageApi, contextHolder] = message.useMessage();
    const [sort, setSort] = useState("default");

    // Fetch vouchers
    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await promotionService.getUserPromotions();
            setVouchers(res.data.data);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải danh sách voucher");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    // Devired data
    const isPercent = (voucher) => voucher.discount_type === "percent";
    const isMoney = (voucher) => voucher.discount_type !== "percent";


    // Copy voucher code
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        messageApi.success("Đã sao chép mã voucher!");
    };

    // Get discount display
    const getDiscountDisplay = (voucher) => {
        if (voucher.discount_type === "percent") {
            return `${voucher.value}%`;
        }
        return formatPrice(voucher.value);
    };

    // Check if voucher is expired
    const isExpired = (endDate) => {
        return dayjs(endDate, "DD/MM/YYYY").isBefore(dayjs());
    };

    // Check if voucher is available
    const isAvailable = (voucher) => {
        return voucher.remaining_usage > 0 && !isExpired(voucher.end_date);
    };

    const getSortValue = (voucher) => {
        if (voucher.discount_type === "percent") {
            return voucher.value; // % giữ nguyên
        }
        return voucher.value; // tiền thì cũng lấy value
    };

    // Filter vouchers
    const filteredVouchers = vouchers
        .filter((voucher) => {
            if (filter === "available") return isAvailable(voucher);
            if (filter === "unavailable") return !isAvailable(voucher);
            return true;
        })
        .sort((a, b) => {
            switch (sort) {
                case "percent_desc":
                    if (isPercent(a) && isPercent(b)) return b.value - a.value;
                    if (isPercent(a)) return -1;
                    if (isPercent(b)) return 1;
                    return 0;

                case "percent_asc":
                    if (isPercent(a) && isPercent(b)) return a.value - b.value;
                    if (isPercent(a)) return -1;
                    if (isPercent(b)) return 1;
                    return 0;

                case "money_desc":
                    if (isMoney(a) && isMoney(b)) return b.value - a.value;
                    if (isMoney(a)) return -1;
                    if (isMoney(b)) return 1;
                    return 0;

                case "money_asc":
                    if (isMoney(a) && isMoney(b)) return a.value - b.value;
                    if (isMoney(a)) return -1;
                    if (isMoney(b)) return 1;
                    return 0;

                default:
                    return 0;
            }
        });



    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GiftOutlined className="text-red-500" />
                        Voucher của bạn
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý và sử dụng các voucher giảm giá
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-4 px-6 pt-6 border-b">
                    <button
                        onClick={() => setFilter("all")}
                        className={`pb-3 px-2 font-medium transition-all ${filter === "all"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Tất cả ({vouchers.length})
                    </button>
                    <button
                        onClick={() => setFilter("available")}
                        className={`pb-3 px-2 font-medium transition-all ${filter === "available"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Có thể dùng ({vouchers.filter(isAvailable).length})
                    </button>
                    <button
                        onClick={() => setFilter("unavailable")}
                        className={`pb-3 px-2 font-medium transition-all ${filter === "unavailable"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Không còn khả dụng ({vouchers.filter(v => !isAvailable(v)).length
                        })
                    </button>
                </div>

                <div className="flex gap-3 px-6 py-4 items-center">
                    <span className="text-sm text-gray-500">Sắp xếp:</span>
                    <Select
                        value={sort}
                        onChange={(value) => setSort(value)}
                        style={{ width: 220 }}
                        size="middle"
                        options={[
                            { value: "default", label: "Mặc định" },
                            { value: "percent_desc", label: "% Cao → Thấp" },
                            { value: "percent_asc", label: "% Thấp → Cao" },
                            { value: "money_desc", label: "Tiền Cao → Thấp" },
                            { value: "money_asc", label: "Tiền Thấp → Cao" },
                        ]}
                    />
                </div>

                {/* Voucher list */}
                <div className="p-6">
                    {filteredVouchers.length === 0 ? (
                        <Empty description="Không có voucher nào" />
                    ) : (
                        <div className="space-y-4">
                            {filteredVouchers.map((voucher) => {
                                const available = isAvailable(voucher);
                                const expired = isExpired(voucher.end_date);

                                return (
                                    <div
                                        key={voucher.promotion_id}
                                        className={`border-2 rounded-lg overflow-hidden transition-all ${available
                                            ? "border-black hover:shadow-lg"
                                            : "border-gray-200 opacity-60"
                                            }`}
                                    >
                                        <div className="flex">
                                            {/* Left side - Discount info */}
                                            <div
                                                className={`w-32 flex flex-col items-center justify-center text-white ${available
                                                    ? voucher.discount_type === "percent"
                                                        ? "bg-gradient-to-br from-red-500 to-pink-500"
                                                        : "bg-gradient-to-br from-blue-500 to-cyan-400"
                                                    : "bg-gray-200 text-gray-500"
                                                    }`}
                                            >
                                                <GiftOutlined className="text-3xl mb-2" />
                                                <span className="text-2xl font-bold">{getDiscountDisplay(voucher)}</span>

                                            </div>


                                            {/* Right side - Details */}
                                            <div className="flex-1 p-4 relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg">
                                                            {voucher.description}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Mã: <span className="font-semibold">{voucher.code}</span>
                                                        </p>
                                                    </div>
                                                    {expired && (
                                                        <Tag color="red">Đã hết hạn</Tag>
                                                    )}
                                                    {!expired && voucher.remaining_usage === 0 && (
                                                        <Tag color="orange">Đã dùng hết</Tag>
                                                    )}
                                                    {available && (
                                                        <Tag color="green">Có thể dùng</Tag>
                                                    )}
                                                </div>

                                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingOutlined />
                                                        <span>
                                                            Đơn tối thiểu: {formatPrice(voucher.min_order_value)}
                                                        </span>
                                                    </div>
                                                    {voucher.max_discount && (
                                                        <div className="flex items-center gap-2">
                                                            <span>Giảm tối đa: {formatPrice(voucher.max_discount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <CalendarOutlined />
                                                        <span>
                                                            HSD: {voucher.start_date} - {voucher.end_date}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span>
                                                            Còn lại: {voucher.remaining_usage}/{voucher.usage_per_user} lần
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleCopyCode(voucher.code)}
                                                    disabled={!available}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${available
                                                        ? "bg-black text-white hover:bg-gray-800"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                >
                                                    <CopyOutlined />
                                                    Sao chép mã
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Voucher;