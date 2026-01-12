import { useEffect, useState, useContext } from "react";
import { Tag } from "antd";
import dayjs from "dayjs";

import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";
import { paymentService } from "@/services/payment.service";
import { NotificationContext } from "@/App";
import { removeVietnameseTones } from "@/utils/removeVietnameseTones";

const PaymentManager = () => {
    // ===== STATE =====
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const { showNotification } = useContext(NotificationContext);

    // ===== FETCH PAYMENT LIST =====
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentService.getAll(1, 999);
            setData(res.data.data);
            showNotification(res.data.message, "success");
        } catch (error) {
            showNotification("Tải danh sách thanh toán thất bại!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // ===== FILTER SEARCH =====
    const filteredData = data.filter(item => {
        if (!searchText) return true;

        const keyword = searchText.toLowerCase();

        return (
            item.payment_id?.toString().includes(keyword) ||
            item.order_id?.toString().includes(keyword) ||
            removeVietnameseTones(item.method || "")
                .toLowerCase()
                .includes(keyword) ||
            removeVietnameseTones(item.status || "")
                .toLowerCase()
                .includes(keyword)
        );
    });

    // ===== COLUMNS =====
    const paymentColumns = [
        {
            title: "Mã thanh toán",
            dataIndex: "payment_id",
            key: "payment_id",
            width: 120,
        },

        {
            title: "Mã đơn hàng",
            dataIndex: "order_id",
            key: "order_id",
            width: 120,
        },

        {
            title: "Phương thức",
            dataIndex: "method",
            key: "method",
            width: 150,

            filters: [
                { text: "COD", value: "COD" },
                { text: "MOMO", value: "MOMO" },
            ],

            onFilter: (value, record) =>
                record.method?.toUpperCase() === value,

            render: method => (
                <Tag color={method === "MOMO" ? "magenta" : "blue"}>
                    {method}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 160,

            filters: [
                { text: "Thành công", value: "thành công" },
                { text: "Thất bại", value: "thất bại" },
                { text: "Đang chờ", value: "đang chờ" },
            ],

            onFilter: (value, record) =>
                record.status
                    ?.trim()
                    ?.normalize("NFC")
                    ?.toLowerCase() === value,

            render: statusRaw => {
                const status = statusRaw
                    ?.trim()
                    ?.normalize("NFC")
                    ?.toLowerCase();

                const colorMap = {
                    "thành công": "green",
                    "thất bại": "red",
                    "đang chờ": "orange",
                };

                return (
                    <Tag color={colorMap[status]} className="rounded-full px-3">
                        {statusRaw}
                    </Tag>
                );
            },
        },

        {
            title: "Tổng tiền",
            dataIndex: "total",
            key: "total",
            width: 160,
            sorter: (a, b) => Number(a.total || 0) - Number(b.total || 0),
            render: total =>
                total
                    ? total.toLocaleString("vi-VN") + " ₫"
                    : "—",
        },

        {
            title: "Ngày thanh toán",
            dataIndex: "payment_date",
            key: "payment_date",
            width: 160,
            render: date =>
                date && dayjs(date, "HH:mm:ss DD/MM/YYYY").isValid()
                    ? dayjs(date, "HH:mm:ss DD/MM/YYYY").format("DD/MM/YYYY")
                    : "—",
        },


    ];

    // ===== RENDER HEADER =====
    const renderHeader = () => (
        <Header
            itemName="thanh toán"
            onReload={fetchPayments}
            reloading={loading}
            showSearch={false}
            showCategoryFilter={false}
            showAddButton={false}
        />

    );

    // ===== RENDER TABLE =====
    const renderTable = () => (
        <DataTable
            columns={paymentColumns}
            dataSource={filteredData}
            loading={loading}
            totalText="thanh toán"
        />
    );

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {renderHeader()}
            {renderTable()}
        </div>
    );
};

export default PaymentManager;
