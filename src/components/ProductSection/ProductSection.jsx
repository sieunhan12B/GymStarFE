import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard/ProductCard";

const ProductSection = ({ title, link, data, scrollRef, scrollProducts }) => (
  <section className="max-w-7xl mx-auto px-4 py-16">
    <div className="flex items-end justify-between mb-8">
      <div className="flex items-end gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link
          to={link}
          className="text-sm hover:underline flex items-center pb-[2px]"
        >
          Xem Tất Cả <RightOutlined className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => scrollProducts(scrollRef, "left")}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          <LeftOutlined />
        </button>
        <button
          onClick={() => scrollProducts(scrollRef, "right")}
          className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
        >
          <RightOutlined />
        </button>
      </div>
    </div>

    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {(data.length ? data : Array(5).fill(null)).map((item, idx) => (
        <div key={idx} className="w-72 flex-shrink-0">
          <ProductCard product={item} />
        </div>
      ))}
    </div>
  </section>
);

export default ProductSection;
