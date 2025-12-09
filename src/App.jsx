import './App.css'
import {  RouterProvider } from 'react-router-dom';
import React from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {router} from '@/routes/index.jsx';

export const NotificationContext = React.createContext();
function App() {
 

  const showNotification = (content, type, duration = 5000) => {
    toast[type](content, {
      position: "top-right",
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };


  return (
    <>
      <NotificationContext.Provider
        value={{
          showNotification: showNotification,
        }}
      >
        <ToastContainer />
        <RouterProvider router={router} />
      </NotificationContext.Provider>
    </>

  )
}

export default App
