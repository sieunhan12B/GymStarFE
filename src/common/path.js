
export const path = {


    // ------------------ USER ------------------

  home: "/",
  // category:":category",
  category: "/danh-muc/:categoryId",
  product: ":category/:subcategory/:productId",
  cart:"gio-hang",
  checkout:"checkout",
  orderSuccess:"dat-hang-thanh-cong/:orderId",
  orderDetail:"chi-tiet-don-hang/:orderId",
  orderHistory:"lich-su-don-hang",



  signUp: "/dang-ki",
  logIn: "/dang-nhap",
  feedback: "/dong-gop-y-kien",
  // product:":category/:productId",
  forgotPassword: "/quen-mat-khau",
  resetPassword: "/dat-lai-mat-khau",
  verifyEmail: "/xac-thuc-email",
  account: "/tai-khoan",
  addressBook:"so-dia-chi",
  accountInfo:"thong-tin-tai-khoan",
  reviewFeedback:"dong-gop-y-kien-va-danh-gia",



  // ------------------ ADMIN ------------------
  dashboard: "dashboard",
  userManager: "quan-ly-nguoi-dung",
  productManager: "quan-ly-san-pham",
  orderManager: "quan-ly-don-hang",
  categoryManager: "quan-ly-danh-muc",
  feedbackManager: "quan-ly-gop-y",
  reviewManager: "quan-ly-danh-gia",

};