import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { RightOutlined, LeftOutlined, ClockCircleOutlined, TagOutlined, WomanOutlined, ManOutlined, GiftOutlined, FireOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

import ProductCard from '@/components/ProductCard/ProductCard';
import { productService } from '@/services/product.service';
import Banner from '@/components/Banner/Banner';
import banner from '@/assets/images/banner.avif';
import banner3 from '@/assets/images/banner3.avif';
import womenCard from '@/assets/images/womenCard.avif';
import menCard from '@/assets/images/menCard.avif';
import accessoriesCard from '@/assets/images/accessoriesCard.avif';
import { path } from '@/common/path';



const Home = () => {
  const categoryIds = {
    nam: 1,
    nu: 2,
    phukien: 3,
  };

  const [newestProducts, setNewestProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [discounted, setDiscounted] = useState([]);

  // ===== EMBLA INSTANCES =====
  const [newRef, newEmbla] = useEmblaCarousel({ dragFree: true });
  const [womenRef, womenEmbla] = useEmblaCarousel({ dragFree: true });
  const [menRef, menEmbla] = useEmblaCarousel({ dragFree: true });
  const [accessoriesRef, accessoriesEmbla] = useEmblaCarousel({ dragFree: true });
  const [bestSellingRef, bestSellingEmbla] = useEmblaCarousel({ dragFree: true });
  const [saleRef, saleEmbla] = useEmblaCarousel({ dragFree: true });



  const filterSellingProducts = (products = []) => {
    return products.filter(
      (p) =>
        p?.status === "đang bán" &&
        p?.product_variants?.some(v => v.stock > 0)
    );
  };



  // ===== FETCH DATA =====
  useEffect(() => {
    Promise.all([
      productService.getBestSellingProducts(1, 10),
      productService.getDiscountedProducts(1, 10),
      productService.getNewestProducts(30, 1, 10),
      productService.getProductByCategoryId(categoryIds.nu, 1, 10),
      productService.getProductByCategoryId(categoryIds.nam, 1, 10),
      productService.getProductByCategoryId(categoryIds.phukien, 1, 10),
    ])
      .then(([bestRes, saleRes, newRes, nuRes, namRes, pkRes]) => {
        setBestSelling(bestRes.data.data);
        setDiscounted(saleRes.data.data);
        setNewestProducts(newRes.data.data);
        setWomenProducts(nuRes.data.data);
        setMenProducts(namRes.data.data);
        setAccessories(pkRes.data.data);
      })
      .catch(console.error);
  }, []);








  // ===== NEWEST =====

  const renderNewestProducts = () => {
    const sellingNewest = filterSellingProducts(newestProducts).slice(0, 10);
    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4">
            <h2 className="text-2xl font-bold space-x-2">
              <ClockCircleOutlined className="text-yellow-600" />
              <span className="">
                SẢN PHẨM MỚI
              </span>
            </h2>
            <Link to={path.newest} className="text-sm hover:underline flex items-center">
              Khám Phá Ngay
              <RightOutlined className="ml-1 text-xs" />
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => newEmbla?.scrollPrev()}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={() => newEmbla?.scrollNext()}
              className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        <div ref={newRef} className="overflow-hidden">
          <div className="flex gap-4">
            {(sellingNewest.length ? sellingNewest : Array(5).fill(null)).map(
              (item, idx) => (
                <div key={idx} className="w-72 flex-shrink-0">
                  <ProductCard product={item} hoverSize={
                    !!item?.product_variants?.some(v => v.size)
                  } badgeContext={["new", "sale"]} />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  };



  // ===== BEST SELLING + SALE =====
  const renderBestSellingProducts = () => {
    const sellingBestSeller = filterSellingProducts(bestSelling).slice(0, 10);

    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4 mb-2">
            <h2 className="text-2xl font-bold space-x-2">
              <FireOutlined className="text-red-500" />
              <span>HOT NHẤT</span>
            </h2>
            <Link to={path.bestSeller} className="text-sm hover:underline flex items-center">
              Xem Top Sản Phẩm
              <RightOutlined className="ml-1 text-xs" />
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => bestSellingEmbla?.scrollPrev()}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={() => bestSellingEmbla?.scrollNext()}
              className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        <div ref={bestSellingRef} className="overflow-hidden">
          <div className="flex gap-4">
            {(sellingBestSeller.length ? sellingBestSeller : Array(5).fill(null)).map(
              (item, idx) => (
                <div key={idx} className="w-72 flex-shrink-0">
                  <ProductCard product={item} hoverSize={
                    !!item?.product_variants?.some(v => v.size)
                  } badgeContext={["lowStock", "sale", "bestseller"]} />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  };

  // ===== SALE =====
  const renderSaleProducts = () => {


    const sellingSale = filterSellingProducts(discounted).slice(0, 10);


    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4 mb-2">
            <h2 className="text-2xl font-bold space-x-2">
              <TagOutlined className="text-red-500" />
              <span>GIẢM GIÁ HOT
              </span>
            </h2>
            <Link to={path.sale} className="text-sm hover:underline flex items-center">
              Khám Phá Ưu Đãi
              <RightOutlined className="ml-1 text-xs" />
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => saleEmbla?.scrollPrev()}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={() => saleEmbla?.scrollNext()}
              className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        <div ref={saleRef} className="overflow-hidden">
          <div className="flex gap-4">
            {(sellingSale.length ? sellingSale : Array(5).fill(null)).map((item) => (
              <div key={item?.product_id || Math.random()} className="w-72 flex-shrink-0">
                <ProductCard
                  product={item}
                  hoverSize={!!item?.product_variants?.some((v) => v.size)}
                  badgeContext={item?.discount > 0 ? ["sale"] : []}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };





  // ===== WOMEN =====
  const renderWomenProducts = () => {
    const sellingWomenProducts = filterSellingProducts(womenProducts);

    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4 mb-2">
            <h2 className="text-2xl font-bold space-x-2">
              <WomanOutlined className="text-pink-500" />
              <span>THỜI TRANG NỮ</span>
            </h2>
            <Link to="/danh-muc/nu-2" className="text-sm hover:underline flex items-center">
              Khám Phá Bộ Sưu Tập <RightOutlined className="ml-1 text-xs" />
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
            {(sellingWomenProducts.length ? sellingWomenProducts : Array(5).fill(null)).map(
              (item, idx) => (
                <div key={idx} className="w-72 flex-shrink-0">
                  <ProductCard product={item} badgeContext={["sale", "lowStock"]} />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  };



  // ===== MEN =====
  const renderMenProducts = () => {
    const sellingMenProducts = filterSellingProducts(menProducts);

    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4 mb-2">
            <h2 className="text-2xl font-bold space-x-2">
              <ManOutlined className="text-blue-600" />
              <span>THỜI TRANG NAM</span>
            </h2>
            <Link to="/danh-muc/nam-1" className="text-sm hover:underline flex items-center">
              Khám Phá Bộ Sưu Tập <RightOutlined className="ml-1 text-xs" />
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
            {(sellingMenProducts.length ? sellingMenProducts : Array(5).fill(null)).map(
              (item, idx) => (
                <div key={idx} className="w-72 flex-shrink-0">
                  <ProductCard product={item} badgeContext={["sale", "lowStock"]} />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  }



  // ===== ACCESSORIES =====
  const renderAccessoriesProducts = () => {
    const sellingAccessories = filterSellingProducts(accessories);

    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-4 mb-2">
            <h2 className="text-2xl font-bold space-x-2">
              <GiftOutlined className="text-purple-500" />
              <span>PHỤ KIỆN</span>
            </h2>
            <Link to="/danh-muc/phu-kien-3" className="text-sm hover:underline flex items-center">
              Khám Phá Ngay <RightOutlined className="ml-1 text-xs" />
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
            {(sellingAccessories.length ? accessories : Array(5).fill(null)).map(
              (item, idx) => (
                <div key={idx} className="w-72 flex-shrink-0">
                  <ProductCard product={item} hoverSize={false} badgeContext={["sale", "lowStock"]} />
                </div>
              )
            )}
          </div>
        </div>
      </section>

    );
  }


  const renderBanner1 = () => {
    return (
      <Banner
        imgSrc={banner}
        titleBanner={"KHÁM PHÁ SẢN PHẨM HOT"}
        desBanner={"Các mẫu quần áo và phụ kiện gym bán chạy nhất, cập nhật liên tục"}
      />
    );
  }

  const renderBanner2 = () => {
    return (
      <Banner
        imgSrc={banner3}
        titleBanner={"PHONG CÁCH CHO NAM & NỮ"}
        desBanner={"Khám phá bộ sưu tập quần áo thể thao và phụ kiện năng động"}
      />
    );
  }

  const renderCategoryGrid = () => {
    const categories = [
      {
        title: 'NỮ',
        image: womenCard,
        category: 'nu',
        category_id: 2
      },
      {
        title: 'NAM',
        image: menCard,
        category: 'nam',
        category_id: 1
      },
      {
        title: 'PHỤ KIỆN',
        image: accessoriesCard,
        category: 'phu-kien',
        category_id: 3
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

      {/* Newest Products */}
      {renderNewestProducts()}

      {/* Best Selling Products */}
      {renderBestSellingProducts()}

      {/* Sale Products */}
      {renderSaleProducts()}

      {/* Banner 2 */}
      {renderBanner2()}

      {/* Women section */}
      {renderWomenProducts()}

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
