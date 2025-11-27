import React, { useRef, useState } from 'react';
import { Input, Badge, Dropdown, Card, Row, Col, Button, Image } from 'antd';
import { SearchOutlined, HeartOutlined, UserOutlined, ShoppingOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import ProductCard from '../../components/ProductCard/ProductCard';
import { accessories, menProducts, womenProducts } from '@/data/productData';
import { Link } from 'react-router-dom';
import { generateSlug } from '../../utils/generateSlug ';

const Home = () => {
  const womanScrollRef = useRef(null);
  const menScrollRef = useRef(null);
  const accessoriesScrollRef = useRef(null);


  const scrollProducts = (ref, direction) => {
    if (!ref.current) return;

    const scrollAmount = 300; // số px muốn trượt

    if (direction === 'left') {
      ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Banner 1 */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="relative h-96 md:h-[600px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=800"
              alt="Hero 1"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-8 left-8">
              <p className="text-white text-sm mb-2">SHOP THE OXBLOOD EDIT</p>
              <Button type="primary" className="bg-white text-black border-0 hover:bg-gray-100">
                SHOP NOW
              </Button>
            </div>
          </div>
          <div className="relative h-96 md:h-[600px] overflow-hidden group bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
              alt="Hero 2"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-8 right-8 text-right">
              <p className="text-black text-xs mb-1">COMING SOON</p>
              <h2 className="text-black text-2xl font-bold">VITAL<br />SEAMLESS 4.0</h2>
            </div>
          </div>
          <div className="relative h-96 md:h-[600px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800"
              alt="Hero 3"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Women Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold -mt-1">NỮ</h2>
            </div>

            <Link
              to={"nu"}
              className="text-sm font-medium flex items-center hover:underline pb-[2px]"
            >
              Xem Tất Cả
              <RightOutlined className="ml-1 text-xs" />
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollProducts(womanScrollRef, 'left')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Scroll left"
            >
              <LeftOutlined className="text-sm" />
            </button>
            <button
              onClick={() => scrollProducts(womanScrollRef, 'right')}
              className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition-colors"
              aria-label="Scroll right"
            >
              <RightOutlined className="text-sm" />
            </button>
          </div>
        </div>

        <div
          ref={womanScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {womenProducts.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Banner 2 */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600"
          alt="Workshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">FUEL INSPIRED WORKWEAR</h2>
            <p className="text-lg mb-6">Discover the Workshop Collection</p>
            <Button size="large" className="bg-white text-black border-0 hover:bg-gray-100 px-8">
              SHOP WORKSHOP
            </Button>
          </div>
        </div>
      </section>

      {/* Men Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold -mt-1">NAM</h2>
            </div>

            <Link
              to={"nam"}
              className="text-sm font-medium flex items-center hover:underline pb-[2px]"
            >
              Xem Tất Cả
              <RightOutlined className="ml-1 text-xs" />
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollProducts(menScrollRef, 'left')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Scroll left"
            >
              <LeftOutlined className="text-sm" />
            </button>
            <button
              onClick={() => scrollProducts(menScrollRef, 'right')}
              className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition-colors"
              aria-label="Scroll right"
            >
              <RightOutlined className="text-sm" />
            </button>
          </div>
        </div>

        <div
          ref={menScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {menProducts.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Accessories Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold -mt-1">PHỤ KIỆN</h2>
            </div>

            <Link
              to={"phu-kien"}
              className="text-sm font-medium flex items-center hover:underline pb-[2px]"
            >
              Xem Tất Cả
              <RightOutlined className="ml-1 text-xs" />
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollProducts(accessoriesScrollRef, 'left')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Scroll left"
            >
              <LeftOutlined className="text-sm" />
            </button>
            <button
              onClick={() => scrollProducts(accessoriesScrollRef, 'right')}
              className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition-colors"
              aria-label="Scroll right"
            >
              <RightOutlined className="text-sm" />
            </button>
          </div>
        </div>

        <div
          ref={accessoriesScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {accessories.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0">
              <ProductCard hoverSize={false} product={product} />
            </div>
          ))}
        </div>
      </section>


      {/* Category Options */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Row gutter={[16, 16]}>
          {[
            { title: 'WOMENS', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800' },
            { title: 'MENS', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800' },
            { title: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800' }
          ].map((item, index) => {
            const linkPath = `/${generateSlug(item.title)}`; // tạo đường dẫn theo title

            return (
              <Col key={index} xs={24} sm={24} md={8} lg={8}>
                <div className="relative h-96 overflow-hidden group cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                    <Link
                      to={linkPath}
                      className="bg-white text-black border-0 hover:bg-gray-100 px-4 py-2 rounded inline-block"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </section>


    </div>
  );
};

export default Home;