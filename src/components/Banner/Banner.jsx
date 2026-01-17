import React from 'react'
import { Link } from 'react-router-dom'

const Banner = ({
    imgSrc,
    titleBanner,
    desBanner,
    categories = [],
    mediaType = "image", // NEW: "image" | "video"
}) => {
    return (
        <section className="relative h-[70vh] overflow-hidden">
            {mediaType === "image" && (
                <img
                    src={imgSrc}
                    alt={titleBanner}
                    className="w-full h-full object-cover"
                />
            )}

            {mediaType === "video" && (
                <video
                    src={imgSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content bottom-left */}
            <div className="absolute bottom-10 left-10 text-white max-w-md">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {titleBanner}
                </h2>
                <p className="text-sm md:text-base mb-4 text-gray-200">
                    {desBanner}
                </p>

                <div className="flex gap-4">
                    {categories.map((item, index) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={
                                index === 0
                                    ? "bg-white text-black px-6 py-2 rounded hover:bg-gray-100 font-medium"
                                    : "border border-white text-white px-6 py-2 rounded hover:bg-white hover:text-black font-medium transition"
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Banner
