import './App.css'
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { router } from '@/routes/index.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from './redux/userSlice';
import { userService } from './services/user.service';
import Cookies from "js-cookie";

export const NotificationContext = React.createContext();

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.userSlice.user);

  const showNotification = (content, type, duration = 5000) => {
    toast[type](content, {
      position: "top-right",
      autoClose: duration,
      transition: Bounce,
    });
  };

  useEffect(() => {
    const token = Cookies.get("access_token");

    if (!token || user) return;

    const getInfo = async () => {
      try {
        const res = await userService.getInfoUser();
        const u = res.data.data;

        dispatch(setUser(u));



      } catch (error) {
        dispatch(logout());
        Cookies.remove("access_token");
      }
    };



    getInfo();
  }, [user, dispatch]);



  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <RouterProvider router={router} />

      <ToastContainer />
    </NotificationContext.Provider>
  );
}

export default App;
