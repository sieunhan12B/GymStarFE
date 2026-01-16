
import { path } from "@/common/path";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { Navigate } from "react-router-dom";

// ------------------ AUTH ------------------
import Login from "../pages/auth/Login/Login";
import Signup from "../pages/auth/Signup/Signup";
import VerifyEmail from "../pages/auth/VerifyEmail/VerifyEmail";
import ResetPassword from "../pages/auth/ResetPassword/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword";

// ------------------ ADMIN ------------------
import AdminTemplate from "../templates/AdminTemplate/AdminTemplate";

import Dashboard from "../pages/admin/Dashboard/Dashboard";
import UserManager from "../pages/admin/UserManager/UserManager";
import ProductManager from "../pages/admin/ProductManager/ProductManager";
import CategoryManager from "../pages/admin/CategoryManager/CategoryManager";
import OrderManager from "../pages/admin/OrderManager/OrderManager";
import ReviewManager from "../pages/admin/ReviewManager/ReviewManager";
import FeedbackManager from "../pages/admin/FeedbackManager/FeedbackManager";
import PaymentManager from "../pages/admin/PaymentManager/PaymentManager";
import RoleManager from "../pages/admin/RoleManager/RoleManager";
import PromotionManager from "../pages/admin/PromotionManager/PromotionManager";
import AddressManager from "../pages/admin/AddressManager/AddressManager";

// ------------------ USER ------------------
import ManagerAccount from "../layouts/ManagerAccount/ManagerAccount";
import HomeTemplate from "../templates/HomeTemplate/HomeTemplate";

import Home from "../pages/user/Home/Home";
import Error from "../pages/user/Error/Error";
import Account from "../pages/user/Account/Account";
import Product from "../pages/user/Product/Product";
import Category from "../pages/user/Category/Category";
import Cart from "../pages/user/Cart/Cart";
import OrderSuccess from "../pages/user/OrderSuccess/OrderSuccess";
import OrderDetail from "../pages/user/OrderDetail/OrderDetail";
import OrderHistory from "../pages/user/OrderHistory/OrderHistory";
import ReviewsFeedback from "../pages/user/ReviewsFeedback/ReviewsFeedback";
import Checkout from "../pages/user/Checkout/Checkout";
import Voucher from "../pages/user/Voucher/Voucher";
import Addresses from "../pages/user/Addresses/Addresses";

export const AppRouter = [
    // ------------------ AUTH ------------------
    {
        path: path.signUp,
        element: <Signup />,
    },
    {
        path: path.logIn,
        element: <Login />,
    },
    {
        path: path.forgotPassword,
        element: <ForgotPassword />,
    },
    {
        path: path.resetPassword,
        element: <ResetPassword />,
    },
    {
        path: path.verifyEmail,
        element: <VerifyEmail />,
    },


    // ------------------ USER ------------------
    {
        path: path.home,
        element: <HomeTemplate />,
        children: [
            {
                element: <Home />,
                index: true,
            },
            {
                path: path.category,
                element: <Category />,
            },
            {
                path: path.searchPage,
                element: <Category />
            },
            {
                path: path.newest,
                element: <Category />
            },

            {
                path: path.bestSeller,
                element: <Category />
            },
            {
                path: path.sale,
                element: <Category />
            },
            {
                path: path.product,
                element: <Product />,
            },

            {
                path: path.cart,
                element: <Cart />,

            },
            {
                path: path.checkout,
                element: <Checkout />
            },
            {
                path: path.orderStatus,
                element: <OrderSuccess />,
            },
            {
                path: path.orderDetail,
                element: <OrderDetail />,
            },

            {
                path: path.account,
                element: <ManagerAccount />,
                children: [
                    {
                        element: <Account />,
                        path: path.accountInfo,

                    },
                    {
                        path: path.orderHistory,
                        element: <OrderHistory />,
                    },
                    {
                        path: path.voucher,
                        element: <Voucher />,
                    },
                    {
                        path: path.addresses,
                        element: <Addresses />,
                    },
                    {
                        path: path.reviewFeedback,
                        element: <ReviewsFeedback />
                    },
                ]
            },
        ],
    },


    // ------------------ ADMIN ------------------
    {
        path: "/admin",
        element: (
            <ProtectedRoute allowedRoles={[
                "Quản trị viên",
                "Quản lý sản phẩm",
                "Quản lý đơn hàng",
                "Quản lý phản hồi"
            ]}>
                <AdminTemplate />
            </ProtectedRoute>
        ),
        children: [
            { path: "", element: <Navigate to="dashboard" replace /> },

            {
                path: path.dashboard,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.userManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                        <UserManager />
                    </ProtectedRoute>
                ),
            },

            {
                path: path.productManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý sản phẩm"]}>
                        <ProductManager />
                    </ProtectedRoute>
                ),
            },

            {
                path: path.categoryManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý sản phẩm"]}>
                        <CategoryManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.orderManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý đơn hàng"]}>
                        <OrderManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.feedbackManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý phản hồi"]}>
                        <FeedbackManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.reviewManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý phản hồi"]}>
                        <ReviewManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.paymentManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý đơn hàng"]}>
                        <PaymentManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.roleManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                        <RoleManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.promotionManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                        <PromotionManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: path.addressManager,
                element: (
                    <ProtectedRoute allowedRoles={["Quản trị viên", "Quản lý đơn hàng"]}>
                        <AddressManager />
                    </ProtectedRoute>
                ),
            },
        ],
    },

    // ------------------ Sai đường dẫn ------------------
    { path: "*", element: <Error /> },
];