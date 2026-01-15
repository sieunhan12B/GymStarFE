import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import Chatbot from '@/components/Chatbot/Chatbot'

const HomeTemplate = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // hoặc 'auto'
    });
  }, [pathname]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <Chatbot />
    </>
  )
}

export default HomeTemplate
