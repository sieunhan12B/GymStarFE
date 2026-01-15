# GymStarFE

Frontend cho hệ thống GymStar – nền tảng thương mại điện tử bán quần áo và phụ kiện thể thao gym

---

## 🚀 Công nghệ sử dụng

* **React 19**
* **Vite**
* **React Router DOM v7**
* **Redux Toolkit**
* **Ant Design**
* **Tailwind CSS**
* **Axios**
* **React Toastify**
* **DayJS**
* **Recharts**
* **@react-pdf/renderer** (xuất PDF)
* **js-cookie** (quản lý token)

---

## 🏗 Kiến trúc hệ thống

Dự án được xây dựng theo mô hình SPA (Single Page Application) với React.

- UI: React + Ant Design + Tailwind
- Routing: React Router DOM
- State management: Redux Toolkit
- API communication: Axios
- Authentication: JWT + Cookie
- Build tool: Vite

## 📁 Cấu trúc thư mục (gợi ý)

```
src/
│
├── components/        # Component dùng chung
├── pages/             # Các trang chính
│   ├── auth/          # Đăng nhập, đăng ký...
│   ├── user/          # Người dùng đã đăng nhập
│   └── admin/         # Trang quản trị
│
├── layouts/           # Layout (Sidebar, Header,...)
├── routes/            # Cấu hình router
├── redux/             # Store, slices
├── services/          # Gọi API
├── common/            # Hằng số, path, utils
├── assets/            # Ảnh, icon
├── templates/         # Template admin, user
├── utils/             # chức năng chung
└── App.jsx
```

---

## ⚙️ Cài đặt & chạy project

### 1️⃣ Cài dependency

```bash
npm install
```

### 2️⃣ Chạy môi trường dev

```bash
npm run dev
```

Mặc định chạy tại:

```
http://localhost:5173
```

---

## 🏗 Build production

```bash
npm run build
```

Preview bản build:

```bash
npm run preview
```

---

## 🔐 Authentication

* Sử dụng JWT Token
* Token được lưu trong cookie (`js-cookie`)
* Tự động logout khi token hết hạn

---

## 🛒 Chức năng chính

### Người dùng (User)

* Đăng ký / Đăng nhập / Quên mật khẩu
* Xem danh sách sản phẩm
* Xem chi tiết sản phẩm
* Xem khuyến mãi
* Thêm vào giỏ hàng
* Đặt hàng
* Theo dõi đơn hàng
* Quản lý tài khoản
* Xuất hóa đơn PDF
* Thanh toán Momo
* Đánh giá sản phẩm
* Góp ý website
* Chatbot

### Quản trị viên (Admin)

* Dashboard
* Quản lý người dùng
* Quản lý sản phẩm
* Quản lý danh mục
* Quản lý đơn hàng
* Quản lý khuyến mãi
* Quản lý đánh giá
* Quản lý góp ý
* Quản lý thanh toán
* Quản lý địa chỉ


---

## 📄 Xuất PDF

Sử dụng `@react-pdf/renderer` để tạo PDF trực tiếp từ React component.

---

## 🔔 Thông báo

Sử dụng `react-toastify` để hiển thị notification.

---

## 📌 Lưu ý

* Khuyến nghị sử dụng **Node.js 18 hoặc 20 LTS**
* Không khuyến nghị Node 22 do một số thư viện chưa tương thích hoàn toàn

---

## 👨‍💻 Tác giả

* Tên sinh viên: *Đặng Gia Bảo/ Hà Trần Hoàng Anh*
* Đề tài: *Luận văn tốt nghiệp website bán quần áo thể thao*
* Năm: 2026

---

## 📜 License

Dự án phục vụ mục đích học tập và nghiên cứu.
