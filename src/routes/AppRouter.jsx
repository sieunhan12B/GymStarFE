
import { path } from "@/common/path";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { ROLES } from "@/constants/role";
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
import Error from "../pages/Error/Error";
import OrderManager from "../pages/admin/OrderManager/OrderManager";
import ReviewManager from "../pages/admin/ReviewManager/ReviewManager";
import FeedbackManager from "../pages/admin/FeedbackManager/FeedbackManager";


// ------------------ USER ------------------
import Home from "../pages/Home/Home";
import Account from "../pages/user/Account/Account";
import Product from "../pages/user/Product/Product";
import ManagerAccount from "../layouts/ManagerAccount/ManagerAccount";
import HomeTemplate from "../templates/HomeTemplate/HomeTemplate";
import Category from "../pages/user/Category/Category";
import Cart from "../pages/user/Cart/Cart";
import OrderSuccess from "../pages/user/OrderSuccess/OrderSuccess";
import OrderDetail from "../pages/user/OrderDetail/OrderDetail";
import OrderHistory from "../pages/user/OrderHistory/OrderHistory";
import AddressBook from "../pages/user/AddressBook/AddressBook";
import ReviewsFeedback from "../pages/user/ReviewsFeedback/ReviewsFeedback";
import Checkout from "../pages/user/Checkout/Checkout";








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
                path:path.searchPage,
                element:<Category/>
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
                path:path.checkout,
                element:<Checkout/>
            },
            {
                path: path.orderSuccess,
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
                        path:path.accountInfo,
                   
                    },
                    {
                        path:path.orderHistory,
                        element:<OrderHistory/>,
                    },
                    {
                        path:path.addressBook,
                        element:<AddressBook/>,
                    },
                    {
                        path:path.reviewFeedback,
                        element:<ReviewsFeedback/>
                    }

                ]
            },
          


        ],
    },


    // ------------------ ADMIN ------------------

    {
        path: "/admin",
        element: (
            <ProtectedRoute allowedRoles={[
                ROLES.ADMIN,
                ROLES.PRODUCT_MANAGER,
                ROLES.ORDER_MANAGER,
                ROLES.FEEDBACK_MANAGER
            ]}>
                <AdminTemplate />
            </ProtectedRoute>
        ),
        children: [
            { path: "", element: <Navigate to="dashboard" replace /> },

            {
                path: path.dashboard,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },

            {
                path: path.userManager,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <UserManager />
                    </ProtectedRoute>
                ),
            },

            {
                path: path.productManager,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRODUCT_MANAGER]}>
                        <ProductManager />
                    </ProtectedRoute>
                ),
            },

            {
                path: path.categoryManager,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PRODUCT_MANAGER]}>
                        <CategoryManager />
                    </ProtectedRoute>
                ),
            },

            // Order Manager
            {
                path: path.orderManager,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ORDER_MANAGER]}>
                        <OrderManager />
                    </ProtectedRoute>
                ),
            },

            // Feedback Manager
            {
                path: path.feedbackManager,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FEEDBACK_MANAGER]}>
                        <FeedbackManager/>
                    </ProtectedRoute>
                ),
            },
            {
                path: path.reviewManager,
                element: (
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FEEDBACK_MANAGER]}>
                        <ReviewManager />
                    </ProtectedRoute>
                ),
            }


        ],
    },

    // ------------------ USER hoặc global sai đường dẫn ------------------
    { path: "*", element: <Error /> },


];