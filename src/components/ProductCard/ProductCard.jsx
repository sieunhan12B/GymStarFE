import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { generateSlug } from "@/utils/generateSlug";
import { cartService } from "@/services/cart.service";
import { NotificationContext } from "@/App";
import { setCart } from "@/redux/cartSlice";
import AddedToCartToast from "@/components/AddedToCartToast/AddedToCartToast";
import { formatPrice } from "../../utils/utils";

const ProductCard = ({ product, hoverSize = true }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState("");
    const { showNotification } = useContext(NotificationContext);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.userSlice.user);
    const userId = user?.user_id;


    // ===============================
    // LOADING SKELETON
    // ===============================
    if (!product) {
        return (
            <div className="w-full h-80 sm:h-96 bg-gray-200 animate-pulse rounded-lg" />
        );
    }

    // ===============================
    // LẤY VARIANT ĐẦU TIÊN CÒN HÀNG
    // ===============================
    const firstVariant = product.product_variants?.find(v => v.stock > 0);

    if (!firstVariant) {
        return (
            <div className="w-full h-80 sm:h-96 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                Hết hàng
            </div>
        );
    }

    // ===============================
    // MÀU & ẢNH THEO VARIANT ĐẦU TIÊN
    // ===============================
    const selectedColor = product.colors?.find(
        c => c.color === firstVariant.color
    );


    const isVideo = (url = "") => {
        return /\.(mp4|webm|ogg)$/i.test(url);
    };

    const colorImages = selectedColor?.images || [];

    // chỉ lấy ảnh (không lấy video)
    const validImages = colorImages.filter(img => !isVideo(img));

    // lấy 2 ảnh đầu tiên hợp lệ
    const images = [
        validImages[0] || product.thumbnail || "/placeholder.png",
        validImages[1] || validImages[0] || product.thumbnail || "/placeholder.png",
    ];

    // ===============================
    // SIZE THEO MÀU CỦA VARIANT ĐẦU TIÊN
    // ===============================
    const allSizes = ["S", "M", "L", "XL", "XXL"];

    const variantsOfSelectedColor = product.product_variants.filter(
        v => v.color === firstVariant.color && v.stock > 0
    );

    const availableSizes = variantsOfSelectedColor.map(v => v.size);

    // ===============================
    // ADD TO CART
    // ===============================
    const handleSelectSize = async (size) => {
        if (!availableSizes.includes(size)) return;

        setSelectedSize(size);

        if (!userId) {
            showNotification("Vui lòng đăng nhập để thêm vào giỏ hàng!", "warning");
            return;
        }

        const variant = variantsOfSelectedColor.find(v => v.size === size);
        if (!variant) return;
        console.log(variant);
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

    const productLink = `/san-pham/${generateSlug(product.category_name)}/${product.product_id}`;

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
                                        className={`py-2 text-xs font-medium border transition-all
                                            ${selectedSize === size
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-black border-gray-300"
                                            }
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
                        {product.discount ? (
                            <>
                                <span className="text-sm font-bold">
                                    {product.product_variants[0].final_price ? formatPrice(product.product_variants[0].final_price) : formatPrice(product.product_variants[0].price - (product.product_variants[0].price * product.discount) / 100)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(product.product_variants[0].price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm font-bold">{formatPrice(product.product_variants[0].price)}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
