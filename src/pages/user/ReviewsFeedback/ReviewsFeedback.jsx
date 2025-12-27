import { useEffect, useState } from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { reviewService } from '../../../services/review.service';
import { feedbackService } from '../../../services/feedback.service';

const ReviewsFeedback = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [replyFilter, setReplyFilter] = useState('all');

  const [reviews, setReviews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [expandedComments, setExpandedComments] = useState({});


  const countByReplyStatus = (list, replyField = 'reply') => {
    const total = list.length;
    const replied = list.filter(item => item[replyField] !== null).length;
    const unreplied = total - replied;

    return { total, replied, unreplied };
  };
  const currentList =
    activeTab === 'review' ? reviews : feedbacks;

  const { total, replied, unreplied } =
    countByReplyStatus(currentList);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, feedbackRes] = await Promise.all([
          reviewService.getReviewUser(),
          feedbackService.getFeedbackUser()
        ]);

        setReviews(reviewRes.data.data);
        setFeedbacks(feedbackRes.data.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };

    fetchData();
  }, []);

  /* ================= FILTER ================= */
  const applyReplyFilter = (item, replyField = 'reply') => {
    if (replyFilter === 'replied') return item[replyField] !== null;
    if (replyFilter === 'unreplied') return item[replyField] === null;
    return true;
  };

  const filteredReviews = reviews.filter(r => applyReplyFilter(r));
  const filteredFeedbacks = feedbacks.filter(f => applyReplyFilter(f));

  /* ================= UI HELPERS ================= */
  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star =>
        star <= rating
          ? <StarFilled key={star} className="text-yellow-400" />
          : <StarOutlined key={star} className="text-gray-300" />
      )}
    </div>
  );

  /* ================= RENDER ================= */
  return (
    <div className="bg-white rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Đánh giá & Góp ý</h1>

      {/* ===== Tabs ===== */}
      <div className="flex gap-6 border-b mb-4">
        {['review', 'feedback'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-medium ${activeTab === tab
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500'
              }`}
          >
            {tab === 'review'
              ? `Đánh giá (${reviews.length})`
              : `Góp ý (${feedbacks.length})`}
          </button>
        ))}
      </div>

      {/* ===== Reply Filter (DÙNG CHUNG) ===== */}
      <div className="flex gap-3 mb-6">
        {[
          { key: 'all', label: `Tất cả (${total})` },
          { key: 'replied', label: `Đã phản hồi (${replied})` },
          { key: 'unreplied', label: `Chưa phản hồi (${unreplied})` }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setReplyFilter(item.key)}
            className={`px-4 py-1 rounded-full border text-sm ${replyFilter === item.key
              ? 'bg-black text-white'
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
          >
            {item.label}
          </button>
        ))}

      </div>

      {/* ===== Review Tab ===== */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Không có đánh giá
            </p>
          ) : (
            filteredReviews.map(review => (
              <div key={review.review_id} className="border-b pb-6 flex gap-4">
                <img
                  src={review.product.thumbnail}
                  className="w-20 h-20 rounded object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {review.product.product_name}
                  </h3>

                  {renderStars(review.rating)}

                  <p className="text-sm text-gray-500">
                    {review.createdAt}
                  </p>

                  {review.comment && (
                    <p className="mt-2 text-gray-700">
                      {expandedComments[review.review_id]
                        ? review.comment
                        : review.comment.slice(0, 100)}
                      {review.comment.length > 100 && (
                        <button
                          onClick={() =>
                            setExpandedComments(prev => ({
                              ...prev,
                              [review.review_id]: !prev[review.review_id]
                            }))
                          }
                          className="text-blue-600 ml-2 text-sm"
                        >
                          {expandedComments[review.review_id]
                            ? 'Thu gọn'
                            : 'Xem thêm'}
                        </button>
                      )}
                    </p>
                  )}
                  {
                    review.images && review.images.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {review.images.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`Review Image ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                  {review.reply && (
                    <div className="bg-blue-50 p-3 mt-3 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-semibold">
                        💬 Phản hồi từ shop
                      </p>
                      <p className="text-sm">{review.reply.message}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== Feedback Tab ===== */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {filteredFeedbacks.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Không có góp ý
            </p>
          ) : (
            filteredFeedbacks.map(item => (
              <div
                key={item.feedback.feedback_id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    {item.feedback.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.feedback.created_at}
                  </span>
                </div>

                <p className="text-gray-800 mb-3">
                  {item.feedback.message}
                </p>

                {item.reply ? (
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-sm font-semibold">
                      💬 Phản hồi từ shop
                    </p>
                    <p className="text-sm">{item.reply.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.reply.replied_at}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-orange-500">
                    ⏳ Chưa được phản hồi
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsFeedback;
