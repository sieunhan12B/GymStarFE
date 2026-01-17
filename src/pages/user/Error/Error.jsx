import React from 'react';
import { Link } from 'react-router-dom';
import errorBanner from '@/assets/images/errorBanner.avif';
import logo from "@/assets/images/logo.svg";
import { Image } from 'antd';

const Error = () => {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src={errorBanner}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center text-white px-5 max-w-3xl">
        {/* Logo */}
        {/* <div className="text-3xl md:text-4xl font-bold tracking-wider mb-10 uppercase">
          GYMSHARK
        </div> */}
        <div className=" absolute left-0 right-0 -top-72">
          <Link to={"/"}>
            <Image preview={false} width={400} src={logo} alt="Gymshark Logo" />
          </Link>
        </div>


        {/* Error Code */}
        <div className="text-7xl sm:text-8xl md:text-9xl font-black leading-none mb-5 drop-shadow-2xl">
          404
        </div>

        {/* Error Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide mb-5 drop-shadow-lg">
          Không tìm thấy trang
        </h1>

        {/* Error Message */}
        <p className="text-base sm:text-lg md:text-xl mb-10 leading-relaxed drop-shadow-md px-4">
          Không chắc chuyện gì đã xảy ra. Có lẽ bạn nên lấy một bộ trang phục mới và sau đó chúng ta có thể đi tập?
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link
            to="/danh-muc/nu-2"
            className="w-full sm:w-auto px-12 py-4 text-base font-semibold uppercase tracking-wider bg-white text-gray-800 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-gray-100 no-underline"
          >
            Mua sắm nữ
          </Link>

          <Link
            to="/danh-muc/nam-1"
            className="w-full sm:w-auto px-12 py-4 text-base font-semibold uppercase tracking-wider bg-transparent text-white border-2 border-white rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-white hover:text-gray-800 no-underline"
          >
            Mua sắm nam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
