import React, { useState } from 'react';
import { Button, Rate, Tabs, Progress, Radio, InputNumber } from 'antd';
import { HeartOutlined, HeartFilled, ShareAltOutlined, StarFilled } from '@ant-design/icons';

const Product = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Navy');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Product data
  const product = {
    name: 'Arrival Long Sleeve T-Shirt',
    price: 28.50,
    originalPrice: null,
    rating: 4.3,
    reviews: 127,
    description: 'Premium quality long sleeve t-shirt perfect for your workout sessions.',
    sku: 'GYM-ARRIVAL-001',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
    ],
    colors: [
      { name: 'Navy', hex: '#001f3f', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100' },
      { name: 'Black', hex: '#000000', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100' },
      { name: 'White', hex: '#FFFFFF', image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=100' },
      { name: 'Gray', hex: '#808080', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    features: [
      'Moisture-wicking fabric',
      'Four-way stretch',
      'Anti-odor technology',
      'Flatlock seams',
    ],
  };

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

  return (
    <div className="min-h-screen bg-white">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
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
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Men's Activewear</p>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Rate disabled defaultValue={product.rating} allowHalf className="text-sm" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                )}
              </div>
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
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedColor === color.name
                        ? 'border-black scale-105'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold uppercase">Size</label>
                <button className="text-sm text-blue-600 hover:underline">Size Guide</button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-medium border rounded-lg transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">⚡ Low stock items are selling fast</p>
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
              <Button
                type="primary"
                size="large"
                block
                className="bg-black hover:bg-gray-800 border-0 h-12 font-bold text-base"
              >
                Add to Bag
              </Button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-full h-12 border-2 border-black rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors"
              >
                {isFavorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                {isFavorite ? 'Added to Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                  <ShareAltOutlined /> Share
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold uppercase mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery & Returns */}
            <div className="pt-6 border-t border-gray-200">
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-sm font-bold uppercase">Delivery & Returns</span>
                <span>+</span>
              </button>
            </div>
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