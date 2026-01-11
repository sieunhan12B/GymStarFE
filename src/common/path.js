
export const path = {

  // ------------------ AUTH ------------------
  signUp: "/dang-ki",
  logIn: "/dang-nhap",
  forgotPassword: "/quen-mat-khau",
  resetPassword: "/dat-lai-mat-khau",
  verifyEmail: "/xac-thuc-email",


  // ------------------ USER ------------------

  home: "/",

  category: "danh-muc/*",
  searchPage: "tim-kiem/:keyword",
  newest: "san-pham-moi",
  bestSeller: "san-pham-ban-chay",
  sale: "san-pham-giam-gia",

  product: "san-pham/:subcategory/:productId",
  cart: "gio-hang",
  orderStatus: "ket-qua-thanh-toan/:orderId",
  orderDetail: "chi-tiet-don-hang/:orderId",
  checkout: "dat-hang",

  account: "/tai-khoan",
  accountInfo: "thong-tin-tai-khoan",
  orderHistory: "lich-su-don-hang",
  voucher: "ma-giam-gia",
  addressBook: "so-dia-chi",
  reviewFeedback: "dong-gop-y-kien-va-danh-gia",



  // ------------------ ADMIN ------------------
  admin: "/admin",
  dashboard: "dashboard",
  userManager: "quan-ly-nguoi-dung",
  productManager: "quan-ly-san-pham",
  orderManager: "quan-ly-don-hang",
  categoryManager: "quan-ly-danh-muc",
  feedbackManager: "quan-ly-gop-y",
  reviewManager: "quan-ly-danh-gia",
  paymentManager: "quan-ly-thanh-toan",
  roleManager: "quan-ly-loai-nguoi-dung",
  promotionManager: "quan-ly-khuyen-mai",
  addressManager: "quan-ly-dia-chi",

};