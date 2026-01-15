import "./App.css";
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

// Router
import { router } from "@/routes";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser } from "@/redux/userSlice";
import { setCart } from "@/redux/cartSlice";

// Services
import { userService } from "@/services/user.service";
import { cartService } from "@/services/cart.service";

export const NotificationContext = React.createContext();

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userSlice.user);

  /* ================= NOTIFICATION ================= */
  const showNotification = (content, type, duration = 5000) => {
    toast[type](content, {
      position: "top-right",
      autoClose: duration,
      transition: Bounce,
    });
  };

  /* ================= FETCH FUNCTION ================= */
  const getInfoUser = async () => {
    try {
      const res = await userService.getCurrentUser();
      dispatch(setUser(res.data.data));
    } catch (error) {
      dispatch(logout());
      Cookies.remove("access_token");
    }
  };
  
  const fetchCart = async () => {
    try {
      const res = await cartService.getCart();
      dispatch(setCart(res.data.data));
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      dispatch(logout());
      return;
    }
    if (user) return;
    getInfoUser();
  }, [user, dispatch]);


  /* ================= CART FETCH ================= */
  useEffect(() => {
    if (!user?.user_id) return;
    fetchCart();
  }, [user, dispatch]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <RouterProvider router={router} />
      <ToastContainer />
    </NotificationContext.Provider>
  );
}

export default App;
