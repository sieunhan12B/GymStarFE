// ================== IMPORTS ==================
import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Rate, Input, Checkbox, Pagination, Select } from 'antd';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';

import { reviewService } from '@/services/review.service';

import { removeVietnameseTones } from '@/utils/removeVietnameseTones';
import dayjs from 'dayjs';

import "./product.css"

const PAGE_SIZE = 3;

const ProductReview = ({ productId }) => {
    const reviewListRef = useRef(null);

    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [sortType, setSortType] = useState('default');
    const [selectedFilters, setSelectedFilters] = useState({
        ratings: [],
        withImage: false,
        replied: false
    });

    /* ================= EFFECT ================= */
    useEffect(() => {
        if (!productId) return;
        const fetchReviews = async () => {
            try {
                const res = await reviewService.getReviewByProductId(productId);

                setReviews(res.data?.data || []);
            } catch (error) {
                console.error('Lỗi lấy review:', error);
            } finally {
            }
        };
        fetchReviews();
    }, [productId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, selectedFilters, sortType]);


    // Filter ,sorter
    const filteredReviews = reviews.filter(review => {
        const normalizedSearch = removeVietnameseTones(searchText)
            .toLowerCase()
            .trim();

        if (normalizedSearch) {
            const nameNormalized = removeVietnameseTones(
                review.reviewer.full_name || ''
            )
                .toLowerCase()
                .trim();

            const commentNormalized = removeVietnameseTones(
                review.comment || ''
            )
                .toLowerCase()
                .trim();

            if (
                !nameNormalized.includes(normalizedSearch) &&
                !commentNormalized.includes(normalizedSearch)
            ) {
                return false;
            }
        }

        if (
            selectedFilters.ratings.length > 0 &&
            !selectedFilters.ratings.includes(Math.floor(review.rating))
        ) {
            return false;
        }
        if (selectedFilters.withImage && review.images.length === 0) {
            return false;
        }
        if (selectedFilters.replied && !review.reply) {
            return false;
        }

        return true;
    });

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        switch (sortType) {
            case 'rating_desc':
                return b.rating - a.rating; // cao → thấp
            case 'rating_asc':
                return a.rating - b.rating; // thấp → cao
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    //Pagination 
    const paginatedReviews = sortedReviews.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // Tính tổng số lần đánh giá, trung bình ,phân bổ số sao , ví dụ 5*: 20 lượt đánh giá,4* : 10 lần đánh giá
    const ratingStats = useMemo(() => {
        if (reviews.length === 0) {
            return {
                average: 0,
                total: 0,
                breakdown: []
            };
        }
        const total = reviews.length;
        const average =
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
        const breakdown = [5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(
                r => Math.floor(r.rating) === star
            ).length;
            return {
                stars: star,
                count,
                percentage: Math.round((count / total) * 100)
            };
        });
        return {
            average: Number(average.toFixed(1)),
            total,
            breakdown
        };
    }, [reviews]);

    /* ================== RENDER ================== */
    return (
        <div ref={reviewListRef} className="max-w-7xl mx-auto p-6 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar - Filters */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                        <h2 className="text-2xl font-bold mb-6">ĐÁNH GIÁ SẢN PHẨM</h2>

                        {/* Search */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-3">Lọc đánh giá</h3>
                            <Input
                                prefix={<SearchOutlined className="text-gray-400" />}
                                placeholder="Tìm theo tên người đánh giá hoặc nội dung"
                                className="rounded-lg"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                        </div>

                        {/* Rating Filter */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-3">Phân loại xếp hạng</h3>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <div key={rating} className="flex items-center">
                                        <Checkbox
                                            checked={selectedFilters.ratings.includes(rating)}
                                            onChange={() =>
                                                setSelectedFilters(prev => ({
                                                    ...prev,
                                                    ratings: prev.ratings.includes(rating)
                                                        ? prev.ratings.filter(r => r !== rating)
                                                        : [...prev.ratings, rating]
                                                }))
                                            }
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="mr-1">{rating}</span>
                                                <Rate
                                                    disabled
                                                    defaultValue={rating}
                                                    count={5}
                                                    className="rate-black text-lg"
                                                />
                                            </span>
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Other Filters */}
                        <div className="mb-6 space-y-3">
                            <h3 className="text-sm font-semibold mb-3">Lọc phản hồi</h3>
                            <div className="flex items-start gap-3 rounded-md bg-blue-50 p-4 border border-blue-200">
                                <InfoCircleOutlined className="text-blue-600 text-lg mt-0.5" />
                                <p className="text-sm text-blue-900 leading-relaxed">
                                    Các đánh giá hiển thị đều được xác thực từ khách hàng đã mua sản phẩm trên GymStar.
                                </p>
                            </div>
                            <div className="space-y-2 flex flex-col ">
                                <Checkbox
                                    checked={selectedFilters.withImage}
                                    onChange={e =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            withImage: e.target.checked
                                        }))
                                    }
                                >
                                    Có hình ảnh
                                </Checkbox>

                                <Checkbox
                                    checked={selectedFilters.replied}
                                    onChange={e =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            replied: e.target.checked
                                        }))
                                    }
                                >
                                    Đã phản hồi
                                </Checkbox>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Reviews */}
                <div className="lg:col-span-2">
                    {/* Rating Summary */}
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Overall Rating */}
                            <div className="md:w-1/3 text-center md:text-left">
                                <div className="text-6xl font-bold mb-2">
                                    {ratingStats.average}
                                </div>
                                <Rate
                                    disabled
                                    value={ratingStats.average}
                                    allowHalf
                                    className="overall-rating text-2xl mb-2"
                                />
                                <p className="text-gray-600">
                                    Dựa trên {ratingStats.total} đánh giá
                                </p>
                            </div>

                            {/* ⭐ Breakdown */}
                            <div className="md:w-2/3 space-y-2">
                                {ratingStats.breakdown.map(item => (
                                    <div
                                        key={item.stars}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <span className="w-8 text-right font-medium">
                                            {item.stars}★
                                        </span>

                                        <div className="flex-1 bg-gray-200 h-2 rounded overflow-hidden">
                                            <div
                                                className="bg-yellow-400 h-2"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>

                                        <span className="w-12 text-right text-gray-600">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>


                    {/* Review Header */}
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Hiện thị đánh giá 1-10</span>
                            <Select
                                value={sortType}
                                onChange={(value) => {
                                    setSortType(value);
                                    setCurrentPage(1);
                                    reviewListRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-56"
                                options={[
                                    { value: 'default', label: 'Mặc định' },
                                    { value: 'rating_desc', label: 'Đánh giá cao nhất' },
                                    { value: 'rating_asc', label: 'Đánh giá thấp nhất' },
                                    { value: 'newest', label: 'Mới nhất' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {paginatedReviews.length === 0 ? (
                            <div className="bg-white rounded-lg p-10 shadow-sm text-center text-gray-500">
                                <p className="text-lg font-medium">Chưa có đánh giá nào</p>
                                <p className="text-sm">
                                    Sản phẩm này hiện chưa có phản hồi từ khách hàng.
                                </p>
                            </div>
                        ) : (

                            paginatedReviews.map(review => (
                                <div key={review.review_id} className="bg-white rounded-lg p-6 shadow-sm">

                                    {/* Header */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <h4 className="font-semibold text-black">
                                            {review.reviewer?.full_name}
                                        </h4>
                                        <span className="text-gray-400">•</span>
                                        <span>
                                            {dayjs(review.createdAt, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')}
                                        </span>
                                    </div>

                                    <Rate
                                        disabled
                                        value={review.rating}
                                        allowHalf
                                        className="rate-black text-lg"
                                    />


                                    {/* Variant */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Kích thước: </span>
                                            <span className="font-medium">{review.variant?.size}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Màu sắc: </span>
                                            <span className="font-medium">{review.variant?.color}</span>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="mb-4 text-gray-800">{review.comment}</p>
                                    )}

                                    {/* Review images */}
                                    {review.images.length > 0 && (
                                        <div className="flex gap-2 mb-3">
                                            {review.images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    className="w-20 h-20 object-cover rounded-lg border"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Shop reply */}
                                    {review.reply && (
                                        <div className="mt-3 ml-4 border-l-2 border-gray-300 pl-4 bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm font-semibold mb-1">
                                                Phản hồi từ cửa hàng
                                            </p>
                                            <p className="text-sm text-gray-700 mb-2">
                                                {review.reply.message}
                                            </p>

                                            {review.reply.images?.length > 0 && (
                                                <div className="flex gap-2">
                                                    {review.reply.images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            className="w-16 h-16 object-cover rounded-md"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                    </div>
                    {filteredReviews.length > PAGE_SIZE && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                current={currentPage}
                                pageSize={PAGE_SIZE}
                                total={filteredReviews.length}
                                onChange={(page) => {
                                    setCurrentPage(page);
                                    reviewListRef.current?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start'
                                    });
                                }}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReview;