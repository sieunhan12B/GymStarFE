import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header/Header'
import Footer from '../../components/Footer/Footer'
import Chatbot from '../../components/Chatbot/Chatbot'

const HomeTemplate = () => {
  const { pathname } = useLocation()

  // Ẩn header cho tất cả trang đặt hàng thành công
  const hideHeader = pathname.startsWith()

  // Footer vẫn hiện
  const hideFooter = false


  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // hoặc 'auto'
    });
  }, [pathname]);

  return (
    <>
      {!hideHeader && <Header />}
      <Outlet />
      {!hideFooter && <Footer />}
      <Chatbot/>
    </>
  )
}

export default HomeTemplate
