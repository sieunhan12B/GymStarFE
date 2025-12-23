import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

import ProductCard from '../../components/ProductCard/ProductCard';
import { buildCategoryUrl, generateSlug } from '../../utils/generateSlug';
import { productService } from '../../services/product.service';
import Banner from '../../components/Banner/Banner';
import banner from '@/assets/images/banner.avif';
import banner2 from '@/assets/images/banner2.avif';
import womenCard from '@/assets/images/womenCard.avif';
import menCard from '@/assets/images/menCard.avif';
import accessoriesCard from '@/assets/images/accessoriesCard.avif';



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
      productService.getProductByCategoryId(categoryIds.nu),
      productService.getProductByCategoryId(categoryIds.nam),
      productService.getProductByCategoryId(categoryIds.phukien),
    ])
      .then(([nuRes, namRes, pkRes]) => {
        setWomenProducts(nuRes.data.data);
        setMenProducts(namRes.data.data);
        setAccessories(pkRes.data.data);
      })
      .catch(console.error);
  }, []);
  console.log(womenProducts);

  // ===== WOMEN =====
  const renderWomenProducts = () => (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-end gap-4">
          <h2 className="text-2xl font-bold">NỮ</h2>
          <Link to={"danh-muc/nu-2"} className="text-sm hover:underline flex items-center">
            Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
          </Link>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => womenEmbla?.scrollPrev()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <LeftOutlined />
          </button>
          <button
            onClick={() => womenEmbla?.scrollNext()}
            className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
          >
            <RightOutlined />
          </button>
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
          <Link to="danh-muc/nam-1" className="text-sm hover:underline flex items-center">
            Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
          </Link>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => menEmbla?.scrollPrev()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <LeftOutlined />
          </button>
          <button
            onClick={() => menEmbla?.scrollNext()}
            className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
          >
            <RightOutlined />
          </button>
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
          <Link to="danh-muc/phu-kien-3" className="text-sm hover:underline flex items-center">
            Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
          </Link>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => accessoriesEmbla?.scrollPrev()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <LeftOutlined />
          </button>
          <button
            onClick={() => accessoriesEmbla?.scrollNext()}
            className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <div ref={accessoriesRef} className="overflow-hidden">
        <div className="flex gap-4">
          {(accessories.length ? accessories : Array(5).fill(null)).map(
            (item, idx) => (
              <div key={idx} className="w-72 flex-shrink-0">
                <ProductCard product={item} hoverSize={false} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );

  const renderBanner1 = () => {
    return (
      <Banner
        imgSrc={banner}
        titleBanner={"PHONG CÁCH GYM NĂNG ĐỘNG"}
        desBanner={"Quần áo & phụ kiện thể thao dành cho người tập luyện nghiêm túc"}
      />
    );
  }

  const renderBanner2 = () => {
    return (
      <Banner
        imgSrc={banner2}
        titleBanner={"PHONG CÁCH GYM NĂNG ĐỘNG"}
        desBanner={"Quần áo & phụ kiện thể thao dành cho người tập luyện nghiêm túc"}
      />
    );
  }

  const renderCategoryGrid = () => {
    const categories = [
      {
        title: 'NỮ',
        image: womenCard,
        category: 'nu',
        category_id:2
      },
      {
        title: 'NAM',
        image: menCard,
        category: 'nam',
        category_id:1
      },
      {
        title: 'PHỤ KIỆN',
        image: accessoriesCard,
        category: 'phu-kien',
        category_id:3
      },
    ];


    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Row gutter={[16, 16]}>
          {categories.map((item, i) => {
            return (
              <Col key={i} xs={24} md={8}>
                <Link to={`/danh-muc/${item.category}-${item.category_id}`}>
                  <div className="relative h-96 overflow-hidden group cursor-pointer rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Text */}
                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-white text-2xl font-bold mb-2">
                        {item.title}
                      </h3>

                    </div>
                  </div>
                </Link>
              </Col>
            )
          })}
        </Row>
      </section>
    );
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Banner 1 */}
      {renderBanner1()}

      {/* Women section */}
      {renderWomenProducts()}

      {/* Banner 2 */}
      {renderBanner2()}

      {/* Men section */}
      {renderMenProducts()}

      {/* Accesories section */}
      {renderAccessoriesProducts()}

      {/* CATEGORY GRID */}
      {renderCategoryGrid()}
    </div>
  );
};

export default Home;
