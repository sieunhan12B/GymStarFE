import React, { useState } from 'react';
import { ShoppingOutlined, DeleteOutlined, PlusOutlined, MinusOutlined, CloseOutlined } from '@ant-design/icons';
import { Badge } from 'antd';

// Component CartDropdown
const CartDropdown = ({ cartItems = [], cartCount = 0, onClose, onUpdateQuantity, onRemoveItem, onViewCart, onCheckout }) => {
  // Tính tổng tiền
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product_variant.product.final_price) * item.quantity);
  }, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="w-96 bg-white rounded-lg shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Giỏ hàng</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseOutlined className="text-lg" />
          </button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingOutlined className="text-4xl text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Giỏ hàng trống</h4>
          <p className="text-sm text-gray-500 text-center">
            Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white rounded-lg shadow-2xl border border-gray-100 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">Giỏ hàng</h3>
          <span className="bg-black text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {cartCount}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <CloseOutlined className="text-lg" />
        </button>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {cartItems.map((item) => (
          <div 
            key={item.cart_id} 
            className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
          >
            {/* Product Image Placeholder */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingOutlined className="text-2xl" />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                {item.product_variant.product.name}
              </h4>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">
                  Màu: <span className="font-medium text-gray-700">{item.product_variant.color}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500">
                  Size: <span className="font-medium text-gray-700">{item.product_variant.size}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => onUpdateQuantity(item.cart_id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-l-lg"
                  >
                    <MinusOutlined className="text-xs" />
                  </button>
                  <span className="w-8 h-7 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.cart_id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-r-lg"
                  >
                    <PlusOutlined className="text-xs" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(item.product_variant.product.final_price)}
                  </p>
                  {item.product_variant.product.discount > 0 && (
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(item.product_variant.product.price)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onRemoveItem(item.cart_id)}
              className="text-gray-400 hover:text-red-500 transition-colors self-start"
            >
              <DeleteOutlined className="text-base" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer - Fixed */}
      <div className="border-t border-gray-100 px-5 py-4 space-y-3 flex-shrink-0">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tạm tính</span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(totalAmount)}
          </span>
        </div>

        {/* Shipping Notice */}
        <p className="text-xs text-gray-500 text-center">
          Phí vận chuyển sẽ được tính ở bước thanh toán
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onCheckout}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Thanh toán
          </button>
          <button
            onClick={onViewCart}
            className="w-full border-2 border-black text-black py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Xem giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Component
// const CartDropdownDemo = () => {
//   const [isOpen, setIsOpen] = useState(false);
  
//   // Mock data giống API của bạn
//   const mockCartItems = [
//     {
//       cart_id: 1,
//       quantity: 2,
//       product_variant: {
//         product_variant_id: 1,
//         color: "Đỏ",
//         size: "M",
//         product: {
//           product_id: 1,
//           name: "Áo thun Apex Seamless",
//           price: 350000,
//           discount: 15,
//           final_price: "297500.00"
//         }
//       }
//     },
//     {
//       cart_id: 2,
//       quantity: 1,
//       product_variant: {
//         product_variant_id: 2,
//         color: "Xanh Navy",
//         size: "L",
//         product: {
//           product_id: 2,
//           name: "Quần short thể thao Pro",
//           price: 280000,
//           discount: 0,
//           final_price: "280000.00"
//         }
//       }
//     }
//   ];

//   const handleUpdateQuantity = (cartId, newQuantity) => {
//     console.log('Update quantity:', cartId, newQuantity);
//     // Call API to update quantity
//   };

//   const handleRemoveItem = (cartId) => {
//     console.log('Remove item:', cartId);
//     // Call API to remove item
//   };

//   const handleViewCart = () => {
//     console.log('View cart');
//     setIsOpen(false);
//     // Navigate to cart page
//   };

//   const handleCheckout = () => {
//     console.log('Checkout');
//     setIsOpen(false);
//     // Navigate to checkout page
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Cart Dropdown Demo</h1>
        
//         {/* Demo Button */}
//         <div className="relative inline-block">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="relative"
//           >
//             <Badge count={mockCartItems.length} size="small" offset={[-2, 2]}>
//               <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
//                 <ShoppingOutlined className="text-xl text-gray-700" />
//               </div>
//             </Badge>
//           </button>

//           {/* Dropdown */}
//           {isOpen && (
//             <>
//               <div 
//                 className="fixed inset-0 z-40" 
//                 onClick={() => setIsOpen(false)}
//               />
//               <div className="absolute right-0 top-14 z-50">
//                 <CartDropdown
//                   cartItems={mockCartItems}
//                   cartCount={mockCartItems.reduce((sum, item) => sum + item.quantity, 0)}
//                   onClose={() => setIsOpen(false)}
//                   onUpdateQuantity={handleUpdateQuantity}
//                   onRemoveItem={handleRemoveItem}
//                   onViewCart={handleViewCart}
//                   onCheckout={handleCheckout}
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {/* Feature List */}
//         <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-xl font-bold mb-4">Tính năng UX/UI:</h2>
//           <ul className="space-y-2 text-sm text-gray-700">
//             <li>✅ Hiển thị số lượng sản phẩm trên badge</li>
//             <li>✅ Danh sách sản phẩm có scroll khi nhiều items</li>
//             <li>✅ Tăng/giảm số lượng trực tiếp trong dropdown</li>
//             <li>✅ Xóa sản phẩm với icon rõ ràng</li>
//             <li>✅ Hiển thị giá gốc + giá khuyến mãi (nếu có)</li>
//             <li>✅ Tính tổng tiền tự động</li>
//             <li>✅ Empty state khi giỏ hàng trống</li>
//             <li>✅ Nút "Xem giỏ hàng" và "Thanh toán"</li>
//             <li>✅ Responsive và smooth animations</li>
//             <li>✅ Click overlay để đóng dropdown</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

export default CartDropdown;