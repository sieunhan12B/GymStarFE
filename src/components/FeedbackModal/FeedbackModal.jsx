import { useState } from 'react';
import { Modal,  Input, Select, Button,  message, Image } from 'antd';
import {  EyeOutlined} from '@ant-design/icons';
import logo from '@/assets/images/logo.svg'; // đổi đường dẫn nếu khác

const { TextArea } = Input;
const { Option } = Select;

const FeedbackModal = ({ visible, onClose }) => {
    const [formData, setFormData] = useState({
        feedbackType: '',
        content: '',
        contact: ''
    });
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const feedbackStats = {
        total: 1247,
        thisMonth: 156
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.feedbackType) {
            newErrors.feedbackType = 'Vui lòng chọn loại góp ý!';
        }

        if (!formData.content) {
            newErrors.content = 'Vui lòng nhập nội dung góp ý!';
        } else if (formData.content.length < 10) {
            newErrors.content = 'Nội dung phải có ít nhất 10 ký tự!';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        setLoading(true);
        setTimeout(() => {
            console.log('Feedback data:', formData);
            console.log('Images:', fileList);

            message.success('Cảm ơn bạn đã đóng góp ý kiến!');
            setFormData({ feedbackType: '', content: '', contact: '' });
            setFileList([]);
            setErrors({});
            setLoading(false);
            onClose();
        }, 1000);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const uploadProps = {
        listType: "picture-card",
        fileList,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ được upload file ảnh!');
                return false;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
                return false;
            }
            return false;
        },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
        maxCount: 5,
        onRemove: (file) => {
            setFileList(prev => prev.filter(item => item.uid !== file.uid));
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            className="feedback-modal"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b pb-6">
                    <div className="mb-4">
                        <img
                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop"
                            alt="Shop Banner"
                            className="w-full h-32 object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg -mt-10bg flex items-center justify-center overflow-hidden">
                            <Image
                                src={logo}   // đổi thành logo của bạn
                                alt="Logo"
                                preview={false}
                                width={150}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">GymStar lắng nghe bạn!</h2>
                    <p className="text-gray-500 mt-2">Chia sẻ trải nghiệm của bạn với chúng tôi</p>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-blue-600">{feedbackStats.total}</span>
                            <span className="text-sm text-gray-600">lượt góp ý</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                            <EyeOutlined />
                            Xem chi tiết
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        <span className="font-semibold text-green-600">+{feedbackStats.thisMonth}</span> góp ý trong tháng này
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                            Loại góp ý <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder="Chọn loại góp ý"
                            size="large"
                            className="w-full"
                            value={formData.feedbackType || undefined}
                            onChange={(value) => handleInputChange('feedbackType', value)}
                            status={errors.feedbackType ? 'error' : ''}
                        >
                            <Option value="compliment">Khen ngợi</Option>
                            <Option value="suggestion">Đề xuất</Option>
                            <Option value="complaint">Khiếu nại</Option>
                            <Option value="question">Câu hỏi</Option>
                            <Option value="product">Góp ý về sản phẩm</Option>
                            <Option value="service">Góp ý về dịch vụ</Option>
                            <Option value="other">Khác</Option>
                        </Select>
                        {errors.feedbackType && (
                            <p className="text-red-500 text-sm mt-1">{errors.feedbackType}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                            Nội dung góp ý <span className="text-red-500">*</span>
                        </label>
                        <TextArea
                            rows={6}
                            placeholder="Chia sẻ trải nghiệm, ý kiến của bạn về GymStar..."
                            className="resize-none"
                            showCount
                            maxLength={500}
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            status={errors.content ? 'error' : ''}
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            size="large"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                            loading={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            Gửi góp ý
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};



export default FeedbackModal;