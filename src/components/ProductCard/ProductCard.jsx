/* ================= IMPORTS ================= */

// React
import React, { useContext, useState } from "react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "@/redux/cartSlice";

// Utils
import { generateSlug } from "@/utils/generateSlug";
import { formatPrice } from "@/utils/formatPrice";
import { isVideo } from "@/utils/isVideo";

// React router dom
import { Link } from "react-router-dom";

// Services
import { cartService } from "@/services/cart.service";

// Components
import AddedToCartToast from "@/components/AddedToCartToast/AddedToCartToast";

// Context
import { NotificationContext } from "@/App";


/* ================= COMPONENT ================= */
const ProductCard = ({ product, hoverSize = true, badgeContext = [] }) => {

    /* ===== STATE ===== */
    const [isHovered, setIsHovered] = useState(false);
    const { showNotification } = useContext(NotificationContext);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.userSlice.user);
    const userId = user?.user_id;

    // ================LOADING SKELETON================
    if (!product) {
        return (
            <div className="animate-pulse">
                {/* Ảnh */}
                <div className="w-full h-80 sm:h-96 bg-gray-200 rounded-lg"></div>

                {/* Text */}
                <div className="mt-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    /* ================= UTILS ================= */

    // ========LẤY VARIANT ĐẦU TIÊN THEO ID BÉ NHẤT CÒN HÀNG==========
    const firstVariant = product?.product_variants
        ?.filter(v => v.stock > 0)
        ?.sort((a, b) => a.product_variant_id - b.product_variant_id)[0];

    if (!firstVariant) {
        return (
            <div className="w-full h-80 sm:h-96 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                Hết hàng
            </div>
        );
    }

    // ========MÀU & ẢNH THEO VARIANT ĐẦU TIÊN=========
    const selectedColor = product.colors?.find(
        c => c.color === firstVariant.color
    );

    // chỉ lấy ảnh (không lấy video)
    const validImages = selectedColor?.images || [].filter(img => !isVideo(img));

    // lấy 2 ảnh đầu tiên hợp lệ
    const images = [
        validImages[0] || product.thumbnail || "/placeholder.png",
        validImages[1] || validImages[0] || product.thumbnail || "/placeholder.png",
    ];

    // ========SIZE THEO MÀU CỦA VARIANT ĐẦU TIÊN=========
    const allSizes = ["S", "M", "L", "XL", "XXL"];
    const productLink = `/san-pham/${generateSlug(product.category_name)}/${product.product_id}`;

    // lọc ra tất cả các variant cùng màu với variant đang chọn ( xác định màu đó có mấy size và kiểm tra stock)
    const variantsOfSelectedColor = product.product_variants.filter(
        v => v.color === firstVariant.color && v.stock > 0
    );

    // size còn hàng
    const availableSizes = variantsOfSelectedColor.map(v => v.size);

    // tổng hàng tồn 
    const totalStock = product.product_variants?.reduce(
        (sum, v) => sum + v.stock,
        0
    );

    // Xử lý để lấy badge
    const isNewProduct = (() => {
        if (!product.createdAt) return false;
        const created = new Date(product.createdAt);
        const now = new Date();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
    })();

    const isLowStock =
        totalStock > 0 && totalStock <= 10;

    const badgesToShow = (() => {
        if (!product || !Array.isArray(badgeContext)) return [];

        const badges = [];

        if (badgeContext.includes("bestseller")) {
            badges.push("bestseller");
        }

        if (badgeContext.includes("sale") && product.discount > 0) {
            badges.push("sale");
        }

        if (badgeContext.includes("new") && isNewProduct) {
            badges.push("new");
        }

        if (badgeContext.includes("lowStock") && isLowStock) {
            badges.push("lowStock");
        }

        return badges;
    })();


    /* ================= HANDLERS ADD TO CART WITH SIZES ================= */
    const handleSelectSize = async (size) => {
        if (!availableSizes.includes(size)) return;


        if (!userId) {
            showNotification("Vui lòng đăng nhập để thêm vào giỏ hàng!", "warning");
            return;
        }

        const variant = variantsOfSelectedColor.find(v => v.size === size);
        if (!variant) return;
        try {
            const res = await cartService.addToCart({
                product_variant_id: variant.product_variant_id,
                quantity: 1,
            });

            const cartRes = await cartService.getCart();
            dispatch(setCart(cartRes.data.data));

            showNotification(
                <AddedToCartToast
                    product={product}
                    product_variant={variant}
                    message={res.data.message}
                />,
                "success"
            );
        } catch (err) {
            console.error("Lỗi khi thêm giỏ hàng:", err);
            showNotification(
                err.response?.data?.message || "Có lỗi xảy ra",
                "error"
            );
        }
    };


    /* ===== RENDER ===== */
    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ẢNH SẢN PHẨM */}
            <Link
                to={productLink}
                className="relative overflow-hidden bg-gray-100 h-80 sm:h-96 block rounded-lg"
            >
                {/* BADGES */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                    {badgesToShow.includes("bestseller") && (
                        <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            ⭐ BÁN CHẠY
                        </span>
                    )}

                    {badgesToShow.includes("sale") && (
                        <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            -{product.discount}%
                        </span>
                    )}

                    {badgesToShow.includes("new") && (
                        <span className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full shadow opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            NEW
                        </span>
                    )}

                    {badgesToShow.includes("lowStock") && (
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            🔥 Còn ít
                        </span>
                    )}
                </div>


                <img
                    src={images[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0 : 1 }}
                />
                <img
                    src={images[1]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                />

                {/* HOVER CHỌN SIZE */}
                {hoverSize && (
                    <div
                        className={`absolute inset-x-0 bottom-0 bg-white bg-opacity-95 p-4 transition-all duration-300 ${isHovered
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-5 pointer-events-none"
                            }`}
                    >
                        <div className="grid grid-cols-5 gap-2">
                            {allSizes.map(size => {
                                const isAvailable = availableSizes.includes(size);

                                return (
                                    <button
                                        key={size}
                                        disabled={!isAvailable}
                                        onMouseDown={e => e.stopPropagation()}
                                        onTouchStart={e => e.stopPropagation()}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelectSize(size);
                                        }}
                                        className={`py-2 text-xs font-medium hover:bg-black hover:text-white border transition-all
                                          bg-white text-black border-gray-300 hover:border-blackactive:bg-black active:text-white
                                            ${!isAvailable
                                                ? "line-through opacity-50 cursor-not-allowed"
                                                : "hover:border-black"
                                            }
                                        `}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Link>

            {/* THÔNG TIN SẢN PHẨM */}
            <Link to={productLink}>
                <div className="pt-3 pb-2">
                    <h3 className="text-sm font-medium mb-1 text-gray-900">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                        {firstVariant.color}
                    </p>

                    <div className="flex items-baseline gap-2">
                        <div className="flex items-baseline gap-2">
                            {product.discount ? (
                                <>
                                    <span className="text-sm font-bold">
                                        {firstVariant.final_price
                                            ? formatPrice(firstVariant.final_price)
                                            : formatPrice(
                                                firstVariant.price -
                                                (firstVariant.price * product.discount) / 100
                                            )}
                                    </span>

                                    <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(firstVariant.price)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-bold">
                                    {formatPrice(firstVariant.price)}
                                </span>
                            )}
                        </div>

                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
