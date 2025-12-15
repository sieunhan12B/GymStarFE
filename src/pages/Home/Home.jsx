import React, { useEffect, useRef, useState } from 'react';
import { Input, Badge, Dropdown, Card, Row, Col, Button, Image } from 'antd';
import { SearchOutlined, HeartOutlined, UserOutlined, ShoppingOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Link } from 'react-router-dom';
import { generateSlug } from '../../utils/generateSlug ';
import { productService } from '../../services/product.service';
import ProductSection from '../../components/ProductSection/ProductSection';

const Home = () => {

  const categoryIds = {
    nam: 1,
    nu: 2,
    phukien: 3,
  };

  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);


  const menRef = useRef(null);
  const womenRef = useRef(null);
  const accessoriesRef = useRef(null);



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
      .catch((err) => console.error("Lỗi khi load sản phẩm:", err));
  }, []);




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
      </section>

      {/* Women */}
      <ProductSection
        title="NỮ"
        link="nu"
        data={womenProducts}
        scrollRef={womenRef}
        scrollProducts={scrollProducts}
      />

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

      {/* Men */}
      <ProductSection
        title="NAM"
        link="nam"
        data={menProducts}
        scrollRef={menRef}
        scrollProducts={scrollProducts}
      />

      {/* Accessories */}
      <ProductSection
        title="PHỤ KIỆN"
        link="phu-kien"
        data={accessories}
        scrollRef={accessoriesRef}
        scrollProducts={scrollProducts}
      />

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Row gutter={[16, 16]}>
          {[
            { title: "WOMENS", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800" },
            { title: "MENS", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800" },
            { title: "ACCESSORIES", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" },
          ].map((item, i) => (
            <Col key={i} xs={24} sm={24} md={8}>
              <div className="relative h-96 overflow-hidden group cursor-pointer">
                <img
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                  <Link
                    to={`/${generateSlug(item.title)}`}
                    className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 inline-block"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

    </div>
  );
};

export default Home;