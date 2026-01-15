import React, { useEffect, useState } from "react";

const announcements = [
  "🔥 BLACK FRIDAY SỚM – GIẢM ĐẾN 70% TOÀN BỘ SẢN PHẨM | MÃ: SALE1T",
  "💪 Miễn phí vận chuyển cho đơn từ 500K",
  "🏋️‍♂️ Bộ sưu tập Gym mới ra mắt – Mua ngay!",
  "⚡ Flash Sale mỗi ngày – Số lượng có hạn!",
  "🎯 Mua 2 giảm thêm 10% – Áp dụng toàn shop"
];

const Announcement = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % announcements.length);
        setFade(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white py-2 text-center overflow-hidden">
      <p
        className={`text-sm transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {announcements[index]}
      </p>
    </div>
  );
};

export default Announcement;
