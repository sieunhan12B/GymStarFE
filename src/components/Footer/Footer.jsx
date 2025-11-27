import {
    PhoneOutlined,
    MailOutlined,
    FacebookOutlined,
    YoutubeOutlined,
    InstagramOutlined,
    ArrowUpOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import FeedbackModal from '@/components/FeedbackModal/FeedbackModal';

const Footer = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const socialLinks = [
        { icon: <FacebookOutlined />, url: '#', label: 'Facebook' },
        { icon: <span className="font-semibold">Zalo</span>, url: '#', label: 'Zalo' },
        { icon: <span className="font-semibold">TT</span>, url: '#', label: 'TikTok' },
        { icon: <InstagramOutlined />, url: '#', label: 'Instagram' },
        { icon: <YoutubeOutlined />, url: '#', label: 'Youtube' },
    ];

    const footerSections = [
        {
            title: 'GymClub',
            links: ['Tài khoản GymClub', 'Đăng kí thành viên', 'Ưu đãi & Đặc quyền'],
        },
        {
            title: 'CHÍNH SÁCH',
            links: ['Chính sách đổi trả 60 ngày', 'Chính sách khuyến mãi', 'Chính sách bảo mật', 'Chính sách giao hàng'],
        },

        {
            title: 'VỀ GYMSTAR',
            links: [
                'Quy tắc ứng xử của GYMSTAR',
                'GYMSTAR 101',
                'DVKH xuất sắc',
                'Câu chuyện về GYMSTAR',
                'Nhà máy',

            ],
        },


    ];

    const storeAddresses = [
        'Văn phòng Hà Nội: Tầng 3-4, Tòa nhà BMM, Km2, Đường Phùng Hưng, Hà Đông, Hà Nội',
        'Trung tâm vận hành Hà Nội: Lô C8, KCN Lại Yên, Hoài Đức, Hà Nội',
        'Văn phòng & Trung tâm vận hành TP.HCM: Lô C3, KCN Cát Lái, Thủ Đức, TP.HCM',
        'Trung tâm R&D: Tầng 01, The Manhattan, Vinhomes Grand Park, Thủ Đức',
    ];

    const badges = [
        'https://mcdn.GYMSTAR.me/image/September2023/mceclip0_46.png',
        'https://mcdn.GYMSTAR.me/image/January2024/mceclip1_37.png',
        'https://mcdn.GYMSTAR.me/image/January2024/mceclip0_37.png',
        'https://theme.hstatic.net/1000306633/1000891789/14/footer_trustbadge_4.png',
    ];

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-black text-white">
            {/* Scroll to top */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 left-8 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition z-50"
            >
                <ArrowUpOutlined />
            </button>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* CTA + Contact */}
                <div className="border-b border-gray-800 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold mb-4"> GymStar lắng nghe bạn!</h2>
                        <p className="text-gray-300 max-w-xl mb-6">
                            Chúng tôi luôn mong đợi ý kiến đóng góp để nâng cấp dịch vụ tốt hơn nữa.
                        </p>
                        <Button
                            className=" group bg-white text-black px-5 py-3 rounded-full inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:!text-black hover:bg-gray-100"
                            onClick={() => setModalVisible(true)}
                        >
                            ĐÓNG GÓP Ý KIẾN
                            <ArrowRightOutlined
                                className="text-xs transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Button>

                        <FeedbackModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                        />
                    </div>

                    <div className="space-y-6">
                        {/* Hotline */}
                        <div>
                            <p className="text-gray-400 text-sm">Hotline</p>
                            <div className="flex items-center gap-2">
                                <PhoneOutlined className="text-xl" />
                                <span className="text-lg font-semibold">1900.27.27.37 - 028.777.2737</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <p className="text-gray-400 text-sm">Email</p>
                            <div className="flex items-center gap-2">
                                <MailOutlined className="text-xl" />
                                <span className="text-lg font-semibold">Gym@GymStar.me</span>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="flex gap-3">
                            {socialLinks.map((s, i) => (
                                <a key={i} href={s.url} className="w-12 h-12 border border-white rounded-lg flex items-center justify-center">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="py-12 border-b border-gray-800 grid grid-cols-1 lg:grid-cols-10 gap-10">

                    {/* Link Sections — chiếm 7 phần */}
                    <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
                        {footerSections.map((section, idx) => (
                            <div key={idx}>
                                <h3 className="font-bold text-sm mb-4 uppercase">{section.title}</h3>
                                <ul className="space-y-2 text-gray-300">
                                    {section.links.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Address — chiếm 3 phần */}
                    <div className="lg:col-span-4">
                        <h3 className="font-bold text-sm mb-4 uppercase">ĐỊA CHỈ LIÊN HỆ</h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            {storeAddresses.map((addr, i) => (
                                <li key={i}>{addr}</li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Bottom row */}
                <div className="pt-8 flex flex-col lg:flex-row justify-between gap-6 text-gray-400 text-xs">
                    <div>
                        <p className="text-white font-semibold">© CÔNG TY TNHH FASTECH ASIA</p>
                        <p>Mã số doanh nghiệp: 0108667038 cấp ngày 20/02/2019 tại Hà Nội.</p>
                    </div>

                    <div className="flex gap-3">
                        {badges.map((src, i) => (
                            <img key={i} src={src} className="h-12 object-contain" />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
