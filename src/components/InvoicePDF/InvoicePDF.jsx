// src/utils/InvoicePDF.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Đăng ký font hỗ trợ tiếng Việt
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSans-VariableFont_wdth,wght.ttf', fontWeight: 'normal' },
    { src: '/fonts/NotoSans-VariableFont_wdth,wght.ttf', fontWeight: 'bold' },
    { src: '/fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf', fontStyle: 'italic' }
  ]
});

// Styles
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'NotoSans', fontSize: 12, backgroundColor: '#fff' },

  // Header với background nhạt
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  logo: { width: 120, height: 40 },
  title: { fontSize: 20, fontWeight: 'bold' },

  // 2 cột cho thông tin
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  column: { flex: 1 },
  bold: { fontWeight: 'bold' },
  sectionText: { marginBottom: 3 },

  table: { display: 'flex', flexDirection: 'column', borderWidth: 1, borderColor: '#000', marginTop: 10 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },

  tableColHeader: { flex: 1, padding: 5, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#000', backgroundColor: '#eee' },
  tableCol: { flex: 1, padding: 5, borderRightWidth: 1, borderRightColor: '#000' },

  totalSection: { marginTop: 15, textAlign: 'right' },

  footer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  totalWrapper: {
    marginTop: 15,
    alignSelf: 'flex-end',   // 👉 đẩy cả khối sang phải
    width: '45%',            // 👉 kiểm soát độ gọn
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginVertical: 6,
  },
  noteSection: {
    marginTop: 10,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },

  noteTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },



});

const InvoicePDF = ({ orderData }) => {

  const calculateDiscountPercent = (original, price) => {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  };

  const totalOriginal = orderData.items.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const voucherDiscount = orderData.discount_amount || 0;
  const totalFinal = orderData.total;
  const productDiscount = orderData.items.reduce(
    (sum, item) =>
      sum + (item.original_price - item.price) * item.quantity,
    0
  );



  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/assets/images/logo.png" style={{ width: 90, height: 'auto', objectFit: 'contain' }} />
          <Text style={styles.title}>HÓA ĐƠN ĐƠN HÀNG</Text>
        </View>

        {/* Thông tin khách hàng & đơn hàng (2 cột) */}
        <View style={styles.infoSection}>
          {/* Cột trái: Khách hàng */}
          <View style={styles.column}>
            <Text style={styles.sectionText}><Text style={styles.bold}>Người nhận:</Text> {orderData.receiver_name}</Text>
            <Text style={styles.sectionText}><Text style={styles.bold}>SĐT:</Text> {orderData.phone}</Text>
            {orderData.user?.email && <Text style={styles.sectionText}><Text style={styles.bold}>Email:</Text> {orderData.user.email}</Text>}
            <Text style={styles.sectionText}><Text style={styles.bold}>Địa chỉ:</Text> {orderData.address_detail}</Text>
          </View>

          {/* Cột phải: Đơn hàng & thanh toán */}
          <View style={[styles.column, { marginLeft: 10 }]}>
            <Text style={styles.sectionText}><Text style={styles.bold}>Mã đơn:</Text> {orderData.order_id}</Text>
            <Text style={styles.sectionText}><Text style={styles.bold}>Ngày đặt:</Text> {dayjs(orderData.order_date, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')}</Text>
            {orderData.received_date && <Text style={styles.sectionText}><Text style={styles.bold}>Ngày nhận hàng:</Text> {dayjs(orderData.received_date, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')}</Text>}
            {orderData.payments[0]?.payment_date && <Text style={styles.sectionText}><Text style={styles.bold}>Ngày thanh toán:</Text> {dayjs(orderData.payments[0].payment_date, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')}</Text>}
            <Text style={styles.sectionText}><Text style={styles.bold}>Phương thức TT:</Text> {orderData.payments[0]?.method}</Text>
            <Text style={styles.sectionText}><Text style={styles.bold}>Trạng thái TT:</Text> {orderData.payments[0]?.status}</Text>
            <Text style={styles.sectionText}><Text style={styles.bold}>Trạng thái đơn:</Text> {orderData.status}</Text>
          </View>

        </View>
        {orderData.note && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Ghi chú của khách hàng</Text>
            <Text>{orderData.note}</Text>
          </View>
        )}



        {/* Table sản phẩm */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, { flex: 0.5 }]}>STT</Text>
            <Text style={styles.tableColHeader}>Sản phẩm</Text>
            <Text style={styles.tableColHeader}>Size/Color</Text>
            <Text style={styles.tableColHeader}>Số lượng</Text>
            <Text style={styles.tableColHeader}>Giá gốc</Text>
            <Text style={styles.tableColHeader}>% Giảm</Text>
            <Text style={styles.tableColHeader}>Thành tiền</Text>
          </View>

          {orderData.items.map((item, index) => {
            const discountPercent = calculateDiscountPercent(item.original_price, item.price);
            const totalItemPrice = item.price * item.quantity;
            return (
              <View style={styles.tableRow} key={item.order_detail_id}>
                <Text style={[styles.tableCol, { flex: 0.5 }]}>
                  {index + 1}
                </Text>

                <Text style={styles.tableCol}>{item.product.name}</Text>
                <Text style={styles.tableCol}>
                  {item.variant.size} / {item.variant.color}
                  {"\n"}SKU: {item.variant.sku}
                </Text>

                <Text style={styles.tableCol}>{item.quantity}</Text>
                <Text style={styles.tableCol}>{item.original_price.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.tableCol}>{discountPercent}%</Text>
                <Text style={styles.tableCol}>{totalItemPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            );
          })}
        </View>

        {/* Tổng tiền */}
        <View style={styles.totalWrapper}>
          <View style={styles.totalRow}>
            <Text>Tạm tính</Text>
            <Text>{totalOriginal.toLocaleString('vi-VN')}đ</Text>
          </View>

          {productDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text>Giảm giá sản phẩm</Text>
              <Text>-{productDiscount.toLocaleString('vi-VN')}đ</Text>
            </View>
          )}

          {voucherDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text>Voucher</Text>
              <Text>-{voucherDiscount.toLocaleString('vi-VN')}đ</Text>
            </View>
          )}

          <View style={styles.totalDivider} />

          <View style={[styles.totalRow, styles.bold]}>
            <Text>Tổng thanh toán</Text>
            <Text>{totalFinal.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>




        {/* Footer / lời cảm ơn */}
        <View style={styles.footer}>
          <Text>Cảm ơn quý khách đã mua hàng!</Text>
        </View>
      </Page>
    </Document >
  );
};

export default InvoicePDF;
