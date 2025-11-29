
import { path } from "@/common/path";
import Signup from "@/pages/Signup/Signup";

import Home from "../pages/Home/Home";
import HomeTemplate from "../templates/HomeTemplate/HomeTemplate";
import Login from "../pages/Login/Login";
import Category from "../pages/Category/Category";
import Product from "../pages/Product/Product";
import ResetPassword from "@/pages/ResetPassword/ResetPassword";
import ForgotPassword from "@/pages/ForgotPassword/ForgotPassword";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import ManagerAccount from "../layouts/ManagerAccount/ManagerAccount";
import Account from "../pages/Account/Account";

import { Navigate } from "react-router-dom";

// ------------------ ADMIN ------------------
import AdminTemplate from "../templates/AdminTemplate/AdminTemplate";
import Dashboard from "../pages/admin/Dashboard/Dashboard";
import UserManager from "../pages/admin/UserManager/UserManager";
import ProductManager from "../pages/admin/ProductManager/ProductManager";
import CategoryManager from "../pages/admin/CategoryManager/CategoryManager";
export const AppRouter = [

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
                path: path.product,
                element: <Product />,
            },
            {
                path: path.account,
                element: <ManagerAccount />,
                children: [
                    {
                        element: <Account />,
                        index: true,
                    },

                ]
            }

        ],
    },
    {
        path: "/manager",
        element: <ManagerAccount />
    },



    // ------------------ ADMIN ------------------
    {
        path: "/admin",
        element: (
            // <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTemplate />
            // </ProtectedRoute>
        ),
        children: [
            { path: "", element: <Navigate to="dashboard" replace /> },

            { path: path.dashboard, element: <Dashboard /> },
            { path: path.userManager, element: <UserManager /> },
            { path: path.productManager, element: <ProductManager /> },
            { path: path.categoryManager, element: <CategoryManager /> }


            



            // { path: "users", element: <User /> },
            // { path: "orders", element: <Order /> },
            // { path: "reviews", element: <Review /> },
            // { path: "feedbacks", element: <Feedback /> },
            // { path: "products", element: <Product /> },
            // { path: "categories", element: <Category /> },
        ],
    },

];