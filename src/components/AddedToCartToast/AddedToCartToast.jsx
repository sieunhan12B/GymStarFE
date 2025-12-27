import React from "react";
import { Image } from "antd";
import { formatPrice } from "../../utils/utils";

const AddedToCartToast = ({ product, size, color, quantity = 1, message }) => {
    return (
        <div className="w-full max-w-sm bg-white ">

            {/* ======= TIÊU ĐỀ ======= */}
            <p className="text-base font-bold text-black  pb-2">
                {message}
            </p>

            <div className="border-b mb-3"></div>

            {/* ======= NỘI DUNG ======= */}
            <div className="flex gap-3">
                <Image
                    width={64}
                    height={64}
                    src={product.thumbnail}
                    alt={product.name}
                    className="rounded-md object-cover border"
                    preview={false}
                />

                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                        {product.name}
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                        Màu: <span className="font-medium">{color}</span>
                        {size && <>&nbsp;/&nbsp;Size: <span className="font-medium">{size}</span>&nbsp;/&nbsp;Số lượng: <span className="text-xs  text-gray-500">x{quantity}
                        </span> </>}
                    </p>


                    {product.price && (
                        <p className="text-sm font-bold text-black mt-1">
                            {formatPrice(product.price)}
                        </p>
                    )}

                </div>
            </div>

        </div>
    );
};

export default AddedToCartToast;
