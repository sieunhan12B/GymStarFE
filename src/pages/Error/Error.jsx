import React from 'react';
import { Button } from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';

const Error = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Số 404 lớn */}
        <div className="relative mb-8">
          <h1 className="text-[200px] font-bold text-gray-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">
              😕
            </div>
          </div>
        </div>

        {/* Tiêu đề và mô tả */}
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Trang không tìm thấy
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
          Hãy kiểm tra lại URL hoặc quay về trang chủ.
        </p>

        {/* Các nút hành động */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            type="primary" 
            size="large"
            icon={<HomeOutlined />}
            className="bg-black hover:bg-gray-800 border-black px-8 h-12 text-base font-medium"
            onClick={() => window.location.href = '/'}
          >
            Về trang chủ
          </Button>
          
          <Button 
            size="large"
            icon={<SearchOutlined />}
            className="px-8 h-12 text-base font-medium"
            onClick={() => window.history.back()}
          >
            Quay lại
          </Button>
        </div>

        {/* Gợi ý liên kết */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Hoặc bạn có thể thử:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Trang chủ
            </a>
            <span className="text-gray-300">•</span>
            <a href="/products" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Sản phẩm
            </a>
            <span className="text-gray-300">•</span>
            <a href="/contact" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Liên hệ
            </a>
            <span className="text-gray-300">•</span>
            <a href="/help" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Trợ giúp
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">
          🔍
        </div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-pulse delay-300">
          📍
        </div>
      </div>
    </div>
  );
};

export default Error;