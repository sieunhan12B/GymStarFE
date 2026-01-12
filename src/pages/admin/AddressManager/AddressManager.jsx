// React
import { useState, useEffect, useMemo, useContext } from "react";

// UI
import { Table, Tag, Select, Input } from "antd";

// Services
import { addressService } from "@/services/address.service";

// Context
import { NotificationContext } from "@/App";

// Components
import DataTable from "@/components/DataTable/DataTable";
import Header from "@/templates/AdminTemplate/Header";
import { removeVietnameseTones } from "../../../utils/removeVietnameseTones";
import { normalizeText } from "../../../utils/normalizeText";

const { Option } = Select;

const AddressManager = () => {
    const { showNotification } = useContext(NotificationContext);

    const [loading, setLoading] = useState(true);
    const [usersWithAddresses, setUsersWithAddresses] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [defaultFilter, setDefaultFilter] = useState("");


    // Fetch dữ liệu
    const fetchAddress = async () => {
        setLoading(true);
        try {
            const res = await addressService.getAllAddressUser(0, 10);
            setUsersWithAddresses(res.data.data || []);
        } catch {
            showNotification("Tải danh sách địa chỉ thất bại", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddress();
    }, []);

    // Flatten dữ liệu cho table
    const filterAddress = useMemo(() => {
        let data = [];
        usersWithAddresses.forEach(({ user, addresses }) => {
            addresses.forEach((addr) => {
                data.push({ ...addr, user });
            });
        });

        // Filter search
        if (searchText) {
            const keyword = removeVietnameseTones(normalizeText(searchText));
            data = data.filter(
                (a) =>
                    removeVietnameseTones(a.receiver_name || "").toLowerCase().includes(keyword) ||
                    (a.phone || "").includes(keyword) ||
                    removeVietnameseTones(a.address_detail || "").toLowerCase().includes(keyword) ||
                    removeVietnameseTones(a.user.full_name || "").toLowerCase().includes(keyword) ||
                    (a.user.email || "").toLowerCase().includes(keyword)
            );
        }

        // Filter status
        if (statusFilter) {
            data = data.filter(
                (a) => a.user.status === statusFilter
            );
        }

        // Filter mặc định
        if (defaultFilter) {
            data = data.filter(
                (a) =>
                    (defaultFilter === "default" && a.is_default) ||
                    (defaultFilter === "not_default" && !a.is_default)
            );
        }

        return data;
    }, [usersWithAddresses, searchText, statusFilter, defaultFilter]);

    // Table columns
    const columns = [
        {
            title: "Người dùng",
            dataIndex: "user",
            render: (user) => (
                <div>
                    <div>{user.full_name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
            ),
            filters: usersWithAddresses.map(u => ({ text: u.user.full_name, value: u.user.user_id })),
            onFilter: (value, record) => record.user.user_id === value,
        },
        {
            title: "Người nhận",
            dataIndex: "receiver_name",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
        },
        {
            title: "Địa chỉ",
            dataIndex: "address_detail",
        },
        {
            title: "Mặc định",
            dataIndex: "is_default",
            filters: [
                { text: "Mặc định", value: "default" },
                { text: "Không mặc định", value: "not_default" },
            ],
            onFilter: (value, record) =>
                (value === "default" && record.is_default) ||
                (value === "not_default" && !record.is_default),
            render: (is_default) => (is_default ? <Tag color="green">Mặc định</Tag> : "—"),
        },

    ];

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <Header
                itemName="địa chỉ"

                searchText={searchText}
                setSearchText={setSearchText}

                showCategoryFilter={false}
                showAddButton={false}
                showReload={true}

                onReload={fetchAddress}
                reloading={loading}
            />


            <DataTable
                columns={columns}
                dataSource={filterAddress}
                loading={loading}
                totalText="địa chỉ"

            />
        </div>
    );
};

export default AddressManager;
