import React, { useContext, useEffect, useState } from 'react';
import { Button, Rate, Tabs, Progress, Radio, InputNumber } from 'antd';
import { HeartOutlined, HeartFilled, ShareAltOutlined, StarFilled, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/utils/utils';
import { useDispatch, useSelector } from "react-redux";
import { cartService } from "@/services/cart.service";

import { NotificationContext } from "@/App";
import { setCart } from '@/redux/cartSlice';
import AddedToCartToast from '../../../components/AddedToCartToast/AddedToCartToast';
import { path } from '../../../common/path';



const Product = () => {
  const { productId } = useParams(); // Lấy productId từ URL
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const user = useSelector((state) => state.userSlice.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { showNotification } = useContext(NotificationContext);




  const relatedProducts = [
    { id: 1, name: 'Training Short - White', price: 24.50, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 2, name: 'Training Short - Navy', price: 24.50, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 3, name: 'Training Short - Black', price: 24.50, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 4, name: 'Long Sleeve Tee - Navy', price: 28.50, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300' },
  ];

  const youMightLike = [
    { id: 5, name: 'Performance Shorts', price: 32.00, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 6, name: 'Crew Neck Sweater', price: 45.00, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300' },
    { id: 7, name: 'Casual Shirt', price: 38.00, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300' },
    { id: 8, name: 'Basic Tee White', price: 22.00, image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=300' },
  ];

  const reviews = [
    {
      id: 1,
      author: 'johndoe123',
      date: '2 months ago',
      rating: 5,
      title: 'Comfortable and good quality, love it!',
      content: 'This shirt exceeded my expectations. The fabric is soft and breathable, perfect for workouts. Fits true to size and looks great!',
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      author: 'fitnessguru',
      date: '1 month ago',
      rating: 4,
      title: 'Feeling great',
      content: 'Very comfortable. Good fit. Highly recommend!',
      helpful: 12,
      verified: true,
    },
  ];

  const reviewStats = {
    average: 4.3,
    total: 127,
    distribution: [
      { stars: 5, count: 85, percentage: 67 },
      { stars: 4, count: 30, percentage: 24 },
      { stars: 3, count: 8, percentage: 6 },
      { stars: 2, count: 3, percentage: 2 },
      { stars: 1, count: 1, percentage: 1 },
    ],
  };


  const handleAddToCart = async () => {
    if (!user?.user_id) {
      showNotification("Bạn cần đăng nhập trước!", "error");
      return;
    }

    if (!selectedColor || !selectedSize) {
      showNotification("Vui lòng chọn màu và kích thước!", "warning");
      return;
    }




    if (!selectedVariant) {
      showNotification("Không tìm thấy biến thể sản phẩm!", "error");
      return;
    }

    const data = {
      product_variant_id: selectedVariant.product_variant_id,
      quantity

    };
    console.log(product)

    try {

      const res = await cartService.addToCart(data);

      const cartRes = await cartService.getCart();

      dispatch(setCart(cartRes.data.data));
      showNotification(<AddedToCartToast product={product} color={selectedVariant.color} size={selectedVariant.size} message={res.data.message} />, "success");
    } catch (error) {
      showNotification("Thêm sản phẩm vào giỏ thất bại!", "error");
      console.error("ADD CART ERROR:", error);
    }
  };
  const handleBuyNow = (selectedVariant, quantity, product) => {
    navigate("/gio-hang", {
      state: {
        buyNowItem: {
          product_variant: selectedVariant,
          quantity,
          product_info: {
            thumbnail: product.thumbnail,
            name: product.name,
            price: product.price,
            discount: product.discount
          }
        }
      }
    });
  };





  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductById(productId);
        const data = res.data.data;
        setProduct(data);
        console.log(data)

        // Mặc định chọn màu và size đầu tiên nếu có
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0].color);
        if (data.product_variants && data.product_variants.length > 0) setSelectedSize(data.product_variants[0].size);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) return <div className="text-center py-20">Đang tải sản phẩm...</div>;
  const selectedVariant = product.product_variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  console.log(selectedVariant)

  const sku = selectedVariant ? selectedVariant.sku : "Chưa chọn";

  // Lấy ảnh theo màu được chọn
  const colorImages = product.colors.find(c => c.color === selectedColor)?.images || [];

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left - Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={colorImages[selectedImage] || product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {colorImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{product.category_name}</p>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.discount && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(
                      parseFloat(product.price) / (1 - parseFloat(product.discount) / 100)
                    )}

                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold uppercase">Color</label>
                <span className="text-sm text-gray-600">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.color}
                    onClick={() => {
                      setSelectedColor(color.color);
                      setSelectedImage(0);
                      const defaultVariant = product.product_variants.find(v => v.color === color.color);
                      if (defaultVariant) setSelectedSize(defaultVariant.size);
                    }}

                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedColor === color.color
                      ? 'border-black scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img src={color.images[0]} alt={color.color} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold uppercase">Size</label>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {product.product_variants
                  .filter(variant => variant.color === selectedColor) // chỉ lấy size theo màu hiện tại
                  .map((variant) => (
                    <button
                      key={variant.product_variant_id}
                      onClick={() => setSelectedSize(variant.size)}
                      className={`py-3 text-sm font-medium border rounded-lg transition-all ${selectedSize === variant.size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                    >
                      {variant.size}
                    </button>
                  ))}
              </div>
            </div>


            {/* Quantity */}
            <div>
              <label className="text-sm font-bold uppercase mb-3 block">Quantity</label>
              <InputNumber
                min={1}
                max={10}
                value={quantity}
                onChange={setQuantity}
                className="w-32"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Thêm vào giỏ hàng */}
              <button
                onClick={handleAddToCart}
                className="w-full h-12 bg-black text-white border-0 rounded-lg flex items-center justify-center gap-2 font-bold text-base hover:bg-gray-800 transition-colors"
              >
                <ShoppingCartOutlined className="text-white" />
                Thêm vào giỏ hàng
              </button>

              {/* Mua ngay */}
              <button
                onClick={() => handleBuyNow(selectedVariant, quantity, product)}
                className={"w-full h-12 border-2 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors hover:bg-green-100 hover:border-green-500 hover:text-green-600"}
              >
                <CreditCardOutlined className={"transition-colors text-black hover:text-green-600"} />
                Mua ngay
              </button>
            </div>

            {/* Product Details & Specifications */}
            <section className="mb-16 pt-8">
              <Tabs

                defaultActiveKey="1"
                size="large"
                items={[
                  {
                    key: '1',
                    label: <span className="font-bold text-base text-black">CHI TIẾT SẢN PHẨM</span>,
                    children: (
                      <div className="py-6 max-w-4xl">
                        <div className="prose max-w-none">

                          {/* Mô tả */}
                          <p className="text-gray-700 leading-relaxed mb-6 text-base">
                            {product.description}
                          </p>

                          {/* Thông số kỹ thuật */}
                          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-bold mb-4 text-black">Thông số kỹ thuật</h3>

                            <div className="space-y-3">

                              {/* SKU (lấy từ biến thể) */}
                              <div className="flex border-b border-gray-200 pb-3">
                                <span className="font-semibold text-gray-900 min-w-[180px]">SKU:</span>
                                <span className="text-gray-700 flex-1">{sku ? sku : ""}</span>
                              </div>

                              {/* Các thông số khác */}
                              {product.spec?.map((spec, index) => (
                                <div
                                  key={index}
                                  className="flex border-b border-gray-200 pb-3 last:border-0"
                                >
                                  <span className="font-semibold text-gray-900 min-w-[180px]">
                                    {spec.label}:
                                  </span>
                                  <span className="text-gray-700 flex-1">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </section>




          </div>
        </div>

        {/* Get The Look Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">GET THE LOOK</h2>
            <button className="text-sm font-medium hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <HeartOutlined />
                  </button>
                </div>
                <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                <p className="text-sm font-bold">${item.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* You Might Like Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">YOU MIGHT LIKE</h2>
            <button className="text-sm font-medium hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {youMightLike.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <HeartOutlined />
                  </button>
                </div>
                <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                <p className="text-sm font-bold">${item.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">REVIEWS</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Review Summary */}
            <div className="lg:col-span-1">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{reviewStats.average}</div>
                <Rate disabled defaultValue={reviewStats.average} allowHalf className="mb-2" />
                <p className="text-sm text-gray-600">{reviewStats.total} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {reviewStats.distribution.map((dist) => (
                  <div key={dist.stars} className="flex items-center gap-3">
                    <span className="text-sm w-8">{dist.stars} ★</span>
                    <Progress
                      percent={dist.percentage}
                      showInfo={false}
                      strokeColor="#000"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{dist.count}</span>
                  </div>
                ))}
              </div>

              <Button block className="mt-6 border-black text-black hover:bg-black hover:text-white h-10">
                Write a Review
              </Button>
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.author}</span>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <Rate disabled defaultValue={review.rating} className="text-sm" />
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <h4 className="font-medium mb-2">{review.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{review.content}</p>
                  <button className="text-sm text-gray-600 hover:text-black">
                    👍 Helpful ({review.helpful})
                  </button>
                </div>
              ))}

              <Button block className="border-black text-black hover:bg-black hover:text-white h-10">
                Load More Reviews
              </Button>
            </div>
          </div>
        </section>

        {/* Recently Viewed */}
        <section>
          <h2 className="text-2xl font-bold mb-6">RECENTLY VIEWED</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[...relatedProducts, ...youMightLike.slice(0, 3)].map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-xs font-bold">${item.price}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Product;