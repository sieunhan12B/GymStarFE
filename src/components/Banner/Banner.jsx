import React from 'react'
import { Link } from 'react-router-dom'

const Banner = ({ imgSrc, titleBanner, desBanner, }) => {
    return (
        <section className="relative h-[500px] overflow-hidden">
            <img
                // src="https://www.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fwl6q2in9o7k3%2F1iQMycVHZ7R39B83cOpofM%2F3a8eeeaee2e338a3067892dc6c1f842d%2FHeadless_Desktop_-_25171493.jpeg&w=1920&q=85"
                src={imgSrc}
                alt="Gym Banner"
                className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content bottom-left */}
            <div className="absolute bottom-10 left-10 text-white max-w-md">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {/* PHONG CÁCH GYM NĂNG ĐỘNG */}
                    {titleBanner}
                </h2>
                <p className="text-sm md:text-base mb-4 text-gray-200">
                    {desBanner}
                    {/* Quần áo & phụ kiện thể thao dành cho người tập luyện nghiêm túc */}
                </p>
                <div className="flex gap-4">
                    <Link
                        to="danh-muc/nam-1"
                        className="bg-white text-black px-6 py-2 rounded hover:bg-gray-100 font-medium"
                    >
                        SHOP NAM
                    </Link>

                    <Link
                        to="danh-muc/nu-2"
                        className="border border-white text-white px-6 py-2 rounded hover:bg-white hover:text-black font-medium transition"
                    >
                        SHOP NỮ
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Banner
