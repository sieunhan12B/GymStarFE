const ROLE_COLOR_MAP = {
    1: "green",
    2: "gold",
    3: "purple",
    4: "blue",
    5: "cyan",
};

const STATUS_COLOR_MAP = {
    "đang hoạt động": "green",
    "bị cấm": "red",
    "chưa xác nhận": "orange",
};

const ROLE_OPTIONS = [
    { id: 1, name: "Khách hàng" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Quản lý sản phẩm" },
    { id: 4, name: "Quản lý đơn hàng" },
    { id: 5, name: "Quản lý phản hồi" },
];

const ROLE_FILTERS = [
    { text: "Quản trị viên", value: "quản trị viên" },
    { text: "Khách hàng", value: "khách hàng" },
    { text: "Quản lý sản phẩm", value: "quản lý sản phẩm" },
    { text: "Quản lý đơn hàng", value: "quản lý đơn hàng" },
    { text: "Quản lý phản hồi", value: "quản lý phản hồi" },
];

const STATUS_FILTERS = [
    { text: "Đang hoạt động", value: "đang hoạt động" },
    { text: "Bị cấm", value: "bị cấm" },
    { text: "Chưa xác nhận", value: "chưa xác nhận" },
];

const GENDER_FILTERS = [
    { text: "Nam", value: "nam" },
    { text: "Nữ", value: "nữ" },
    { text: "Chưa cập nhật", value: "null" },
];

const BIRTHDAY_FILTERS = [
    { text: "Có ngày sinh", value: "has_birthday" },
    { text: "Chưa có ngày sinh", value: "no_birthday" },
];


export {
    ROLE_COLOR_MAP,
    STATUS_COLOR_MAP,
    ROLE_OPTIONS,
    ROLE_FILTERS,
    STATUS_FILTERS,
    GENDER_FILTERS,
    BIRTHDAY_FILTERS,
};