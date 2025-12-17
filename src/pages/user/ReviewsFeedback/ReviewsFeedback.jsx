import { useState } from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';

const ReviewsFeedback = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([
    {
      id: 1,
      productName: 'Áo thun basic cotton',
      productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
      rating: 5,
      date: '15/12/2024',
      comment: 'Sản phẩm chất lượng tốt, vải mềm mại, thoải mái. Giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng với lần mua hàng này!',
      hasReply: true,
      reply: 'Cảm ơn bạn đã tin tưởng và ủng hộ shop! Chúc bạn có những trải nghiệm tuyệt vời với sản phẩm.',
      status: 'reviewed'
    },
    {
      id: 2,
      productName: 'Quần jeans slim fit',
      productImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop',
      rating: 4,
      date: '10/12/2024',
      comment: 'Quần đẹp, form chuẩn. Tuy nhiên màu hơi đậm hơn ảnh một chút. Nhưng nhìn chung vẫn ok.',
      hasReply: true,
      reply: 'Cảm ơn bạn đã phản hồi! Shop sẽ cải thiện chất lượng ảnh để khách hàng dễ dàng lựa chọn hơn.',
      status: 'reviewed'
    },
    {
      id: 3,
      productName: 'Giày sneaker trắng',
      productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
      rating: 0,
      date: '08/12/2024',
      comment: '',
      hasReply: false,
      reply: '',
      status: 'pending'
    },
    {
      id: 4,
      productName: 'Túi xách mini',
      productImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop',
      rating: 5,
      date: '05/12/2024',
      comment: 'Túi xinh quá! Size vừa đủ đựng đồ cần thiết. Chất liệu da mềm, may cẩn thận.',
      hasReply: false,
      reply: '',
      status: 'reviewed'
    }
  ]);

  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({ rating: 0, comment: '' });
  const [expandedComments, setExpandedComments] = useState({}); // quản lý collapse comment

  const handleSubmitReview = (reviewId) => {
    if (reviewFormData.rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            rating: reviewFormData.rating, 
            comment: reviewFormData.comment,
            status: 'reviewed' 
          }
        : review
    ));

    setShowReviewForm(null);
    setReviewFormData({ rating: 0, comment: '' });
  };

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    return review.status === activeTab;
  });

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarFilled className="text-yellow-400" />
            ) : (
              <StarOutlined className="text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Đánh giá và phản hồi</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {['all', 'pending', 'reviewed'].map(tab => {
          const labelMap = { all: 'Tất cả', pending: 'Chờ đánh giá', reviewed: 'Đã đánh giá' };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {labelMap[tab]} ({reviews.filter(r => tab === 'all' ? true : r.status === tab).length})
            </button>
          );
        })}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có đánh giá nào
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 flex flex-col md:flex-row gap-4">
              {/* Product Image */}
              <img src={review.productImage} alt={review.productName} className="w-20 h-20 object-cover rounded-lg" />

              {/* Review Content */}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{review.productName}</h3>
                
                {review.status === 'pending' ? (
                  <div>
                    {showReviewForm === review.id ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-3">Đánh giá của bạn</p>
                        <div className="mb-4">{renderStars(reviewFormData.rating, true, (r) => setReviewFormData({ ...reviewFormData, rating: r }))}</div>
                        <textarea
                          value={reviewFormData.comment}
                          onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                          rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => handleSubmitReview(review.id)} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Gửi đánh giá</button>
                          <button onClick={() => setShowReviewForm(null)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowReviewForm(review.id)} className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                        Viết đánh giá
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Stars */}
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    {/* Date */}
                    <p className="text-sm text-gray-500 mb-2">{review.date}</p>
                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-700 mb-2">
                        {expandedComments[review.id] || review.comment.length <= 100
                          ? review.comment
                          : review.comment.slice(0, 100) + '...'}
                        {review.comment.length > 100 && (
                          <button
                            onClick={() => setExpandedComments(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                            className="text-blue-600 ml-2 text-sm underline"
                          >
                            {expandedComments[review.id] ? 'Thu gọn' : 'Xem thêm'}
                          </button>
                        )}
                      </p>
                    )}
                    {/* Shop Reply */}
                    {review.hasReply && (
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mt-3">
                        <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                          <span>💬 Phản hồi từ shop:</span>
                        </p>
                        <p className="text-sm text-gray-700">{review.reply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsFeedback;
