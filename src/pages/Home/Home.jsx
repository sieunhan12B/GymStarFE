import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

import ProductCard from '../../components/ProductCard/ProductCard';
import { generateSlug } from '../../utils/generateSlug ';
import { productService } from '../../services/product.service';

const Home = () => {
  const categoryIds = {
    nam: 1,
    nu: 2,
    phukien: 3,
  };

  const [womenProducts, setWomenProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);

  // ===== EMBLA INSTANCES =====
  const [womenRef, womenEmbla] = useEmblaCarousel({ dragFree: true });
  const [menRef, menEmbla] = useEmblaCarousel({ dragFree: true });
  const [accessoriesRef, accessoriesEmbla] = useEmblaCarousel({ dragFree: true });

  // ===== FETCH DATA =====
  useEffect(() => {
    Promise.all([
      productService.getProductsByCategoryId(categoryIds.nu),
      productService.getProductsByCategoryId(categoryIds.nam),
      productService.getProductsByCategoryId(categoryIds.phukien),
    ])
      .then(([nuRes, namRes, pkRes]) => {
        setWomenProducts(nuRes.data.data);
        setMenProducts(namRes.data.data);
        setAccessories(pkRes.data.data);
      })
      .catch(console.error);
  }, []);

  // ===== WOMEN =====
  const renderWomenProducts = () => (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-end gap-4">
          <h2 className="text-2xl font-bold">NỮ</h2>
          <Link to="/nu" className="text-sm hover:underline flex items-center">
            Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
          </Link>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<LeftOutlined />}
            onClick={() => womenEmbla?.scrollPrev()}
          />
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => womenEmbla?.scrollNext()}
          />
        </div>
      </div>

      <div ref={womenRef} className="overflow-hidden">
        <div className="flex gap-4">
          {(womenProducts.length ? womenProducts : Array(5).fill(null)).map(
            (item, idx) => (
              <div key={idx} className="w-72 flex-shrink-0">
                <ProductCard product={item} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );

  // ===== MEN =====
  const renderMenProducts = () => (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-end gap-4">
          <h2 className="text-2xl font-bold">NAM</h2>
          <Link to="/nam" className="text-sm hover:underline flex items-center">
            Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
          </Link>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<LeftOutlined />}
            onClick={() => menEmbla?.scrollPrev()}
          />
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => menEmbla?.scrollNext()}
          />
        </div>
      </div>

      <div ref={menRef} className="overflow-hidden">
        <div className="flex gap-4">
          {(menProducts.length ? menProducts : Array(5).fill(null)).map(
            (item, idx) => (
              <div key={idx} className="w-72 flex-shrink-0">
                <ProductCard product={item} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );

  // ===== ACCESSORIES =====
  const renderAccessoriesProducts = () => (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-end gap-4">
          <h2 className="text-2xl font-bold">PHỤ KIỆN</h2>
          <Link to="/phu-kien" className="text-sm hover:underline flex items-center">
            Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
          </Link>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<LeftOutlined />}
            onClick={() => accessoriesEmbla?.scrollPrev()}
          />
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => accessoriesEmbla?.scrollNext()}
          />
        </div>
      </div>

      <div ref={accessoriesRef} className="overflow-hidden">
        <div className="flex gap-4">
          {(accessories.length ? accessories : Array(5).fill(null)).map(
            (item, idx) => (
              <div key={idx} className="w-72 flex-shrink-0">
                <ProductCard product={item} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Banner 1 */}
      {/* <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative h-96 md:h-[600px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=800"
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-8 right-8 text-right">
              <p className="text-black text-xs">COMING SOON</p>
              <h2 className="text-black text-2xl font-bold">VITAL<br />SEAMLESS 4.0</h2>
            </div>
          </div>

          <div className="relative h-96 md:h-[600px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section> */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="https://www.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fwl6q2in9o7k3%2F1iQMycVHZ7R39B83cOpofM%2F3a8eeeaee2e338a3067892dc6c1f842d%2FHeadless_Desktop_-_25171493.jpeg&w=1920&q=85"
          alt="Gym Banner"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content bottom-left */}
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            PHONG CÁCH GYM NĂNG ĐỘNG
          </h2>
          <p className="text-sm md:text-base mb-4 text-gray-200">
            Quần áo & phụ kiện thể thao dành cho người tập luyện nghiêm túc
          </p>
          <Button
            size="middle"
            className="bg-white text-black border-0 hover:bg-gray-100 px-6"
          >
            MUA NGAY
          </Button>
        </div>
      </section>

      {renderWomenProducts()}
      {/* Banner 2 */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600"
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
      {renderMenProducts()}
      {renderAccessoriesProducts()}

      {/* CATEGORY GRID */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Row gutter={[16, 16]}>
          {['WOMENS', 'MENS', 'ACCESSORIES'].map((title, i) => (
            <Col key={i} xs={24} md={8}>
              <Link to={`/${generateSlug(title)}`}>
                <div className="relative h-96 overflow-hidden group cursor-pointer">
                  <img
                    src="https://source.unsplash.com/800x800/?fashion"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    alt=""
                  />
                  <div className="absolute bottom-6 left-6 text-white text-xl font-bold">
                    {title}
                  </div>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

export default Home;
