import React, { useState, useEffect, useContext } from "react";
import { Spin, Empty, Tag, message } from "antd";
import { GiftOutlined, CalendarOutlined, ShoppingOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { promotionService } from "../../../services/promotion.service";

const Voucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, available, used


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

    // Copy voucher code
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        message.success("Đã sao chép mã voucher!");
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(value);
    };

    // Get discount display
    const getDiscountDisplay = (voucher) => {
        if (voucher.discount_type === "percent") {
            return `${voucher.value}%`;
        }
        return formatCurrency(voucher.value);
    };

    // Check if voucher is expired
    const isExpired = (endDate) => {
        return dayjs(endDate, "DD/MM/YYYY").isBefore(dayjs());
    };

    // Check if voucher is available
    const isAvailable = (voucher) => {
        return voucher.remaining_usage > 0 && !isExpired(voucher.end_date);
    };

    // Filter vouchers
    const filteredVouchers = vouchers.filter((voucher) => {
        if (filter === "available") return isAvailable(voucher);
        if (filter === "used") return voucher.remaining_usage === 0;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spin size="large" />
            </div>
        );
    }

    return (
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
                    onClick={() => setFilter("used")}
                    className={`pb-3 px-2 font-medium transition-all ${filter === "used"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Đã sử dụng ({vouchers.filter((v) => v.remaining_usage === 0).length})
                </button>
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
                                            className={`w-32 flex flex-col items-center justify-center ${available
                                                ? "bg-gradient-to-br from-red-500 to-pink-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            <GiftOutlined className="text-3xl mb-2" />
                                            <span className="text-2xl font-bold">
                                                {getDiscountDisplay(voucher)}
                                            </span>
                                            {voucher.discount_type === "fixed" && (
                                                <span className="text-xs">GIẢM</span>
                                            )}
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
                                                        Đơn tối thiểu: {formatCurrency(voucher.min_order_value)}
                                                    </span>
                                                </div>
                                                {voucher.max_discount && (
                                                    <div className="flex items-center gap-2">
                                                        <span>Giảm tối đa: {formatCurrency(voucher.max_discount)}</span>
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
    );
};

export default Voucher;