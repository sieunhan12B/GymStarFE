import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Rate, Tabs, Progress, InputNumber, Skeleton, Select, Pagination, Image, Input, Upload, message } from 'antd';
import { HeartOutlined, ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined, PlusOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { productService } from '@/services/product.service';
import { reviewService } from '@/services/review.service';
import { formatPrice } from '@/utils/utils';
import { setCart } from '@/redux/cartSlice';
import AddedToCartToast from '@/components/AddedToCartToast/AddedToCartToast';
import { NotificationContext } from '@/App';
import { cartService } from '../../../services/cart.service';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { generateSlug } from '../../../utils/generateSlug';
import ProductReview from './ProductReview';
import SuggestionSize from './SuggestionSize';

dayjs.extend(relativeTime);

const Product = () => {
  const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];

  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relativeProducts, setRelativeProducts] = useState([]);

  const [relativeRef, relativeEmbla] = useEmblaCarousel({ dragFree: true });
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);


  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({
    rating: 0,
    content: '',
    images: []
  });
  const [reviews, setReviews] = useState([]);



  const user = useSelector(state => state.userSlice.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const hasSize = product?.product_variants?.some(v => v.size != null);
  console.log(hasSize)

  const isVideo = (url = "") =>
    url.match(/\.(mp4|webm|ogg)$/i);




  //=================XỬ LÝ THÊM SẢN PHẨM VÀO GIỎ HÀNG======================
  const handleAddToCart = async () => {
    if (!user?.user_id) return showNotification('Bạn cần đăng nhập trước!', 'error');
    if (!selectedColor) return showNotification('Vui lòng chọn màu!', 'warning');
    if (hasSize && !selectedSize) return showNotification('Vui lòng chọn kích thước!', 'warning');
    if (!selectedVariant) return showNotification('Không tìm thấy biến thể sản phẩm!', 'error');

    const data = {
      product_variant_id: selectedVariant.product_variant_id,
      quantity
    };
    console.log(data);

    try {
      const res = await cartService.addToCart(data);
      console.log(res);
      const cartRes = await cartService.getCart();
      dispatch(setCart(cartRes.data.data));
      showNotification(<AddedToCartToast product={product} quantity={quantity} product_variant={selectedVariant} message={res.data.message} />, 'success');
    } catch (error) {
      showNotification(error.response.data.message, 'error');
      console.error('ADD CART ERROR:', error);
    }
  };
  //=================XỬ LÝ MUA NGAY ======================
  const handleBuyNow = (selectedVariant, quantity, product) => {
    console.log(product);
    navigate('/dat-hang', {
      state: {
        buyNowItem: {
          product_variant: selectedVariant,
          quantity,
          product,
        }
      }
    });
  };





  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductById(productId);
        console.log(res)
        const data = res.data.data;
        setProduct(data);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0].color);
        if (data.product_variants?.length > 0) setSelectedSize(data.product_variants[0].size);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      }
    };
    fetchProduct();
  }, [productId]);


  useEffect(() => {
    const fetchRelativeProducts = async () => {
      try {
        const res = await productService.getProductByCategoryId(product?.category_id);
        console.log(res);
        const data = res.data.data;

        // Lọc bỏ sản phẩm hiện tại
        const filteredData = data.filter(p => p.product_id != productId);
        console.log(productId, data, filteredData)

        setRelativeProducts(filteredData);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm liên quan:', error);
      }
    };

    if (product)
      fetchRelativeProducts();
  }, [product]);

  const selectedVariant = product
    ? hasSize
      ? product.product_variants.find(v => v.color === selectedColor && v.size === selectedSize)
      : product.product_variants.find(v => v.color === selectedColor) // chỉ cần màu
    : null;


  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play();
  }, [selectedImage, selectedColor]);





  useEffect(() => {
    const fetchReview = async () => {
      if (!selectedVariant) return;


      try {
        const res = await reviewService.getReviewByProductId(productId);

        setReviews(res.data.data);

        // Tính thống kê

      } catch (error) {
        console.error('Lỗi khi lấy review:', error);
      }
    };

    fetchReview();
  }, [selectedVariant]);



  if (!product) return <div className="text-center py-20">Đang tải sản phẩm...</div>;



  const sku = selectedVariant ? selectedVariant.sku : 'Chưa chọn';
  const colorImages =
    product.colors
      .find(c => c.color === selectedColor)
      ?.images
      ?.sort((a, b) => isVideo(a) - isVideo(b)) || [];


  const renderProductDetail = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* Left - Images */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isVideo(colorImages[selectedImage]) ? (
              <video
                key={colorImages[selectedImage]} // ⭐ QUAN TRỌNG NHẤT
                src={colorImages[selectedImage]}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />

            ) : (
              <img
                src={colorImages[selectedImage] || product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

        </div>
        <div className="grid grid-cols-4 gap-4">
          {colorImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2
    ${selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'}
  `}
            >
              {isVideo(img) ? (
                <>
                  <video
                    src={img}
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                </>
              ) : (
                <img
                  src={img}
                  alt={`View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>

          ))}
        </div>
      </div>

      {/* Right - Product Info */}
      <div className="space-y-6">
        {/* Name, Category, Price, Description */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{product.category_name}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-baseline gap-2">
            {product.discount ? (
              <>
                <span className="text-3xl font-bold">
                  {formatPrice(selectedVariant.final_price)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(selectedVariant.price)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">{formatPrice(selectedVariant.final_price)}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-2">{product.description?.slice(0, 120)}...</p>
        </div>

        {/* Color Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold uppercase">Màu</label>

            <span className="
    text-sm font-bold
    text-white
    bg-black
    px-3 py-1
    rounded-full
    tracking-wide
  ">
              {selectedColor}
            </span>
          </div>


          <div className="flex gap-3">
            {product.colors.map(color => (
              <button key={color.color} onClick={() => { setSelectedColor(color.color); setSelectedImage(0); const defaultVariant = product.product_variants.find(v => v.color === color.color); if (defaultVariant) setSelectedSize(defaultVariant.size); }} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedColor === color.color ? 'border-black scale-105' : 'border-gray-200 hover:border-gray-400'}`}>
                <img src={color.images[0]} alt={color.color} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        {hasSize && (
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-bold uppercase mb-3 block">Size</label>

              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                📏 Hướng dẫn chọn size
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {product.product_variants
                .filter(v => v.color === selectedColor && v.stock > 0)
                .sort((a, b) => {
                  const indexA = SIZE_ORDER.indexOf(a.size);
                  const indexB = SIZE_ORDER.indexOf(b.size);

                  // Nếu size không nằm trong SIZE_ORDER
                  if (indexA === -1 && indexB === -1) return 0;
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;

                  return indexA - indexB;
                })
                .map(variant => (
                  <button
                    key={variant.product_variant_id}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`py-3 text-sm font-medium border rounded-lg transition-all
        ${selectedSize === variant.size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'}
      `}
                  >
                    {variant.size}
                  </button>
                ))
              }

            </div>
          </div>
        )}
        <SuggestionSize
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
        // sizeChart={product.sizeChart} // nếu có data từ backend
        />



        {/* Quantity */}
        <div>
          <label className="text-sm font-bold uppercase mb-3 block">Số lượng</label>
          <InputNumber min={1} max={10} value={quantity} onChange={setQuantity} className="w-32" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button onClick={handleAddToCart} className="w-full h-12 bg-black text-white border-0 rounded-lg flex items-center justify-center gap-2 font-bold text-base hover:bg-gray-800 transition-colors"><ShoppingCartOutlined />Thêm vào giỏ hàng</button>
          <button onClick={() => handleBuyNow(selectedVariant, quantity, product)} className="w-full h-12 border-2 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors hover:bg-green-100 hover:border-green-500 hover:text-green-600"><CreditCardOutlined className="transition-colors text-black hover:text-green-600" />Mua ngay</button>
        </div>

        {/* Product Details & Specifications */}
        <section className="mb-16 pt-8">
          <Tabs defaultActiveKey="1" size="large" items={[{
            key: '1', label: <span className="font-bold text-base text-black">CHI TIẾT SẢN PHẨM</span>, children: (
              <div className="py-6 max-w-4xl">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6 text-base">{product.description}</p>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-bold mb-4 text-black">Thông số kỹ thuật</h3>
                    <div className="space-y-3">
                      <div className="flex border-b border-gray-200 pb-3"><span className="font-semibold text-gray-900 min-w-[180px]">SKU:</span><span className="text-gray-700 flex-1">{sku}</span></div>
                      {product.spec?.map((spec, index) => (<div key={index} className="flex border-b border-gray-200 pb-3 last:border-0"><span className="font-semibold text-gray-900 min-w-[180px]">{spec.label}:</span><span className="text-gray-700 flex-1">{spec.value}</span></div>))}
                    </div>
                  </div>
                </div>
              </div>
            )
          }]} />
        </section>
      </div>
    </div>
  )

  const renderRelatedProducts = () => {
    console.log(relativeProducts)
    return (
      relativeProducts.length != 0 ? (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-4">
              <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
              <Link to={`/danh-muc/${generateSlug(product.category_name)}-${product.category_id}`} className="text-sm hover:underline flex items-center">
                Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
              </Link>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => relativeEmbla?.scrollPrev()}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <LeftOutlined />
              </button>
              <button
                onClick={() => relativeEmbla?.scrollNext()}
                className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
              >
                <RightOutlined />
              </button>
            </div>
          </div>

          <div ref={relativeRef} className="overflow-hidden">
            <div className="flex gap-4">
              {(relativeProducts?.length ? relativeProducts : Array(5).fill(null)).map(
                (item, idx) => {
                  console.log(item)
                  return (
                    <div key={idx} className="w-72 flex-shrink-0">
                      <ProductCard product={item} hoverSize={item?.product_variants[0].size == null ? false : true} />
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>
      ) : ("")
    );
  };



  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Main Section */}
        {renderProductDetail()}

        {/* You Might Like Section */}
        {renderRelatedProducts()}

        <ProductReview productId={productId} />


      </div>
    </div>
  );
};

export default Product;
