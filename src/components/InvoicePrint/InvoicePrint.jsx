// src/components/InvoicePrint.jsx
import React from "react";

const InvoicePrint = ({ orderData }) => {
  if (!orderData) return null;

  return (
    <div className="invoice-print  p-6 bg-white">
      <h2 className="text-xl font-bold mb-2">Hóa đơn mua hàng</h2>
      <p>Mã đơn: {orderData.order_id}</p>
      <p>Ngày đặt: {orderData.order_date}</p>
      <p>Người nhận: {orderData.receiver_name}</p>
      <p>Địa chỉ: {orderData.address_detail}</p>

      <table className="w-full border mt-4">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Sản phẩm</th>
            <th className="text-left p-2">Size / Màu</th>
            <th className="text-center p-2">SL</th>
            <th className="text-right p-2">Đơn giá</th>
            <th className="text-right p-2">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {orderData.items.map(item => (
            <tr key={item.order_detail_id} className="border-b">
              <td className="p-2">{item.product.name}</td>
              <td className="p-2">{item.variant.size} / {item.variant.color}</td>
              <td className="p-2 text-center">{item.quantity}</td>
              <td className="p-2 text-right">{item.price.toLocaleString('vi-VN')}đ</td>
              <td className="p-2 text-right">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 font-bold text-right">Tổng: {orderData.total.toLocaleString('vi-VN')}đ</p>
      <p>Phương thức thanh toán: {orderData.payments[0]?.method}</p>
      <p>Trạng thái: {orderData.status}</p>
    </div>
  );
};

export default InvoicePrint;
