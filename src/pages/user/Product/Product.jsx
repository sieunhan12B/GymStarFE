import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Rate, Tabs, Progress, InputNumber, Skeleton, Select, Pagination, Image, Input, Upload, message } from 'antd';
import { HeartOutlined, ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { productService } from '@/services/product.service';
import { reviewService } from '@/services/review.service';
import { formatPrice } from '@/utils/utils';
import { setCart } from '@/redux/cartSlice';
import AddedToCartToast from '@/components/AddedToCartToast/AddedToCartToast';
import { NotificationContext } from '@/App';
import { path } from '@/common/path';
import { cartService } from '../../../services/cart.service';
import ProductSection from '../../../components/ProductSection/ProductSection';

dayjs.extend(relativeTime);

const Product = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relativeProducts, setRelativeProducts] = useState(null);


  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3); // số review mỗi trang
  const [filterStar, setFilterStar] = useState(0); // 0 = all
  const [newReview, setNewReview] = useState({
    rating: 0,
    content: '',
    images: []
  });


  const relativeRef = useRef(null);

  // Upload props
  const uploadProps = {
    beforeUpload: file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
      }
      return isImage || Upload.LIST_IGNORE;
    },
    onChange: info => {
      const files = info.fileList.map(file => file.originFileObj || file);
      setNewReview(prev => ({ ...prev, images: files }));
    },
    listType: 'picture-card',
    multiple: true,
  };







  const user = useSelector(state => state.userSlice.user);
  console.log(user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);


  //=================XỬ LÝ THÊM SẢN PHẨM VÀO GIỎ HÀNG======================
  const handleAddToCart = async () => {
    if (!user?.user_id) return showNotification('Bạn cần đăng nhập trước!', 'error');
    if (!selectedColor || !selectedSize) return showNotification('Vui lòng chọn màu và kích thước!', 'warning');
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
      showNotification(<AddedToCartToast product={product} color={selectedVariant.color} size={selectedVariant.size} message={res.data.message} />, 'success');
    } catch (error) {
      showNotification(error.response.data.message, 'error');
      console.error('ADD CART ERROR:', error);
    }
  };
  //=================XỬ LÝ MUA NGAY ======================
  const handleBuyNow = (selectedVariant, quantity, product) => {
    navigate('/gio-hang', {
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
  const scrollProducts = (ref, direction) => {
    if (!ref.current) return;

    const scrollAmount = 300; // số px muốn trượt

    if (direction === 'left') {
      ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };


  // Submit handler
  const handleSubmitReview = async () => {
    if (!user?.user_id) return showNotification('Bạn cần đăng nhập trước!', 'error');
    if (newReview.rating === 0 || !newReview.content) {
      return showNotification('Vui lòng điền đầy đủ thông tin đánh giá', 'warning');
    }

    try {
      // TODO: Gọi API submit review, kèm file images nếu có
      // await reviewService.submitReview(productId, newReview);

      showNotification('Đánh giá thành công!', 'success');
      setNewReview({ rating: 0, content: '', images: [] });
      // Optionally: fetch lại reviews
    } catch (error) {
      console.error(error);
      showNotification('Có lỗi xảy ra khi gửi đánh giá', 'error');
    }
  };
    useEffect(() => {
    const fetchRelativeProducts = async () => {
      try {
        const res = await productService.getProductByLevel3Category(17);
        console.log(res)
        const data = res.data.data;
        setRelativeProducts(data);
   
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      }
    };
    fetchRelativeProducts();
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductById(productId);
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
    const fetchReview = async () => {
      try {
        const res = await reviewService.getReviewVariant(2);
        console.log(res);

      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      }
    };
    fetchReview();
  }, []);

  if (!product) return <div className="text-center py-20">Đang tải sản phẩm...</div>;


  const selectedVariant = product
    ? product.product_variants.find(v => v.color === selectedColor && v.size === selectedSize)
    : null;
  console.log(selectedVariant);


  const sku = selectedVariant ? selectedVariant.sku : 'Chưa chọn';
  const colorImages = product.colors.find(c => c.color === selectedColor)?.images || [];
  const toggleExpand = (id) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Dummy data
  const relatedProducts = [
    { id: 1, name: 'Training Short - White', price: 24.5, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 2, name: 'Training Short - Navy', price: 24.5, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 3, name: 'Training Short - Black', price: 24.5, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 4, name: 'Long Sleeve Tee - Navy', price: 28.5, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300' },
  ];

  const youMightLike = [
    { id: 5, name: 'Performance Shorts', price: 32, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300' },
    { id: 6, name: 'Crew Neck Sweater', price: 45, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300' },
    { id: 7, name: 'Casual Shirt', price: 38, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300' },
    { id: 8, name: 'Basic Tee White', price: 22, image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=300' },
  ];

  // Dummy reviews với phản hồi từ shop
  // Dummy reviews với phản hồi từ shop và ảnh từ user
  const reviews = [
    {
      id: 1,
      author: 'johndoe123',
      date: '2 tháng trước',
      rating: 5,
      title: 'Rất thoải mái và chất lượng tốt!',
      content: 'Chiếc áo này vượt quá mong đợi của tôi, chất liệu mềm mại và thoáng khí. Màu sắc giữ được lâu, đường may chắc chắn, mặc cực kỳ thoải mái. Tôi hoàn toàn hài lòng với sản phẩm này và chắc chắn sẽ mua thêm cho gia đình',
      verified: true,
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=100'], // ảnh từ user
      shop_response: {
        text: 'Cảm ơn bạn đã đánh giá! Chúng tôi rất vui khi bạn hài lòng với sản phẩm.'
      }
    },
    {
      id: 2,
      author: 'fitnessguru',
      date: '1 tháng trước',
      rating: 4,
      title: 'Cảm giác rất tuyệt',
      content: 'Rất thoải mái khi tập luyện, màu sắc giữ được lâu...',
      verified: true,
      images: [],
      shop_response: null
    },
    {
      id: 3,
      author: 'stylequeen',
      date: '3 tuần trước',
      rating: 5,
      title: 'Hoàn hảo cho mùa hè',
      content: 'Nhẹ nhàng, thoáng mát và rất dễ chịu...',
      verified: false,
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100'], // ảnh từ user
      shop_response: {
        text: 'Cảm ơn bạn đã mua hàng! Hãy ghé lại cửa hàng chúng tôi để nhận ưu đãi nhé.'
      }
    },
    {
      id: 4,
      author: 'fitnessguru',
      date: '1 tháng trước',
      rating: 4,
      title: 'Cảm giác rất tuyệt',
      content: 'Rất thoải mái khi tập luyện, màu sắc giữ được lâu...',
      verified: true,
      images: [],
      shop_response: null
    },
    {
      id: 5,
      author: 'stylequeen',
      date: '3 tuần trước',
      rating: 5,
      title: 'Hoàn hảo cho mùa hè',
      content: 'Nhẹ nhàng, thoáng mát và rất dễ chịu...',
      verified: false,
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100'], // ảnh từ user
      shop_response: {
        text: 'Cảm ơn bạn đã mua hàng! Hãy ghé lại cửa hàng chúng tôi để nhận ưu đãi nhé.'
      }
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
    ]
  };


  const filteredReviews = filterStar > 0
    ? reviews.filter(r => Math.floor(r.rating) === filterStar)
    : reviews;

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + pageSize);

  const handleFilter = (star) => {
    setFilterStar(star);
    setCurrentPage(1); // Reset page khi filter thay đổi
  };


  const renderProductDetail = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* Left - Images */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img src={colorImages[selectedImage] || product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {colorImages.map((img, idx) => (
            <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}>
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
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
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.discount && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(parseFloat(product.price) / (1 - parseFloat(product.discount) / 100))}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">{product.description}</p>
        </div>

        {/* Color Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold uppercase">Màu</label>
            <span className="text-sm text-gray-600">{selectedColor}</span>
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
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold uppercase">Size</label>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {product.product_variants.filter(v => v.color === selectedColor && v.stock > 0).map(variant => (
              <button key={variant.product_variant_id} onClick={() => setSelectedSize(variant.size)} className={`py-3 text-sm font-medium border rounded-lg transition-all ${selectedSize === variant.size ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}>{variant.size}</button>
            ))}
          </div>
        </div>

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

  const renderRelatedProducts = () => (
    <ProductSection
      title="Sản phẩm liên quan"
      link="nu"
      data={relativeProducts}
      scrollRef={relativeRef}
      scrollProducts={scrollProducts}
    />
  );
  const renderReview = () => (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-4">ĐÁNH GIÁ SẢN PHẨM</h2>

      {/* Summary */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold mb-2">{reviewStats.average}</div>
        <Rate disabled value={reviewStats.average} allowHalf style={{ color: '#facc15' }} />
        <p className="text-sm text-gray-600">{reviewStats.total} đánh giá</p>
      </div>

      {/* Distribution */}
      <div className="space-y-2 mb-6">
        {reviewStats.distribution.map(dist => (
          <div key={dist.stars} className="flex items-center gap-3">
            <span className="text-sm w-8">{dist.stars} ★</span>
            <Progress
              percent={dist.percentage}
              showInfo
              strokeColor="#facc15"
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-12">{dist.count}</span>
          </div>
        ))}
      </div>

      {/* Filter sao */}
      <div className="flex items-center mb-6 gap-2 flex-wrap">
        <button
          onClick={() => handleFilter(0)}
          className={`px-3 py-1 rounded-md border ${filterStar === 0 ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} transition-colors duration-300`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map(star => (
          <button
            key={star}
            onClick={() => handleFilter(star)}
            className={`px-3 py-1 rounded-md border transition-all duration-300
    ${filterStar === star
                ? 'bg-black/90 text-white border-yellow-400 shadow-md'
                : 'bg-white text-black border-gray-300 hover:bg-black hover:text-white hover:border-yellow-400'
              }`}

          >
            {star} ★
          </button>
        ))}
      </div>

      {/* Write a Review */}
      <div className="border border-gray-200 rounded-lg p-4 mb-8 space-y-3">
        <Rate
          value={newReview.rating}
          onChange={value => setNewReview(prev => ({ ...prev, rating: value }))}
          style={{ color: '#facc15' }}
        />
        <textarea
          placeholder="Viết đánh giá của bạn..."
          rows={4}
          value={newReview.content}
          onChange={e => setNewReview(prev => ({ ...prev, content: e.target.value }))}
          className="w-full border border-gray-300 rounded-md p-2"
        />
        <Upload {...uploadProps}>
          {newReview.images.length >= 5 ? null : (
            <div className="flex flex-col items-center justify-center cursor-pointer borderrounded-md p-3 hover:bg-gray-100">
              <PlusOutlined />
              <span className="mt-1 text-xs">Upload</span>
            </div>
          )}
        </Upload>
        <button
          onClick={handleSubmitReview}
          className="px-4 py-2 border border-black bg-white text-black rounded-md hover:bg-black hover:text-white transition-colors duration-300"
        >
          Gửi đánh giá
        </button>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {paginatedReviews.map(review => {
          const isExpanded = expandedReviews[review.id];
          return (
            <div key={review.id} className="border-b border-gray-200 pb-6 mb-6">

              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.author}</span>
                    {review.verified && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircleOutlined />
                        Verified
                      </span>
                    )}
                  </div>
                  <Rate disabled defaultValue={review.rating} className="text-sm" style={{ color: '#facc15' }} />
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>

              {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}

              <p className="text-sm text-gray-700 mb-2">
                {review.content.length > 200 ? (
                  <>
                    {isExpanded ? review.content : review.content.slice(0, 200) + '...'}
                    <button
                      className="ml-1 text-blue-600 underline hover:text-blue-800"
                      onClick={() => toggleExpand(review.id)}
                    >
                      {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                  </>
                ) : review.content}
              </p>

              {/* Images */}
              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {review.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`user upload ${idx}`}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </div>
              )}

              {/* Shop response */}
              {review.shop_response && (
                <div className="ml-4 border-l-2 border-gray-300 pl-4 mt-2 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-800">Phản hồi từ cửa hàng:</p>
                  <p className="text-sm text-gray-700">{review.shop_response.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredReviews.length}
          onChange={setCurrentPage}
        />
      </div>
    </section>
  );


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Main Section */}
        {renderProductDetail()}

        {/* You Might Like Section */}
        {renderRelatedProducts()}

        {/* Reviews Section */}
        {renderReview()}


      </div>
    </div>
  );
};

export default Product;
