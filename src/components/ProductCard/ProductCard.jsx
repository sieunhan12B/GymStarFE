import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { generateSlug } from '../../utils/generateSlug ';

const ProductCard = ({ product ,hoverSize=true}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      const newInProducts = [
    { id: 2, name: 'Oversized Hoodie', price: '₫1,790,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', color: 'Oxblood', category : 'Nam' ,subCategory: 'Đồ thể thao nam' },

  ];

    return (
        <Link
            // to={`${generateSlug(product.danhMuc)}/${product.id}`} 
            to={`/${generateSlug(product.parent)}/${product.id}`}
            className="relative group cursor-point  er"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-100 h-80 sm:h-96">

                {/* Ảnh chính */}
                <img 
                    alt={product.name} 
                    src={product.image} 
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0 : 1 }}
                />

                {/* Ảnh hover */}
                <img 
                    alt={product.name} 
                    src={newInProducts[0].image} 
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                />

                {/* Size Selector */}
                {hoverSize &&
                <div
                    className={`absolute inset-x-0 bottom-0 bg-white bg-opacity-95 p-4 transition-all duration-300
                        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}
                    `}
                >
                    <div className="grid grid-cols-5 gap-2 mb-2">
                        {sizes.slice(0, 5).map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`py-2 text-xs font-medium border transition-colors ${
                                    selectedSize === size 
                                        ? 'bg-black text-white border-black' 
                                        : 'bg-white text-black border-gray-300 hover:border-black'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {sizes.slice(5).map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`py-2 text-xs font-medium border transition-colors ${
                                    selectedSize === size 
                                        ? 'bg-black text-white border-black' 
                                        : 'bg-white text-black border-gray-300 hover:border-black'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
                }
            </div>

            {/* Product Info */}
            <div className="pt-3 pb-2">
                <h3 className="text-sm font-medium mb-1 text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{product.color}</p>
                <p className="text-sm font-semibold text-gray-900">{product.price}</p>
            </div>
        </Link>
    );
};

export default ProductCard;
