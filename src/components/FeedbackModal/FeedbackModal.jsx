import { useContext, useState } from 'react';
import { Modal, Input, Select, Button, message, Image } from 'antd';
import logo from '@/assets/images/logo.svg';
import { feedbackService } from '../../services/feedback.service';
import { NotificationContext } from "@/App";
import { SendOutlined } from '@ant-design/icons';
import feebackBanner from '@/assets/Images/feedbackBanner.jpg'


const { TextArea } = Input;
const { Option } = Select;

const FeedbackModal = ({ visible, onClose }) => {
    const [formData, setFormData] = useState({
        feedbackType: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showNotification } = useContext(NotificationContext);
    const [step, setStep] = useState('form');

    // Map FE -> BE
    const mapFeedbackType = (type) => ({
        compliment: 'Khen ngợi',
        suggestion: 'Đề xuất',
        complaint: 'Khiếu nại',
        question: 'Câu hỏi',
        product: 'Góp ý về sản phẩm',
        service: 'Góp ý về dịch vụ',
        other: 'Khác'
    })[type];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.feedbackType) {
            newErrors.feedbackType = 'Vui lòng chọn loại góp ý!';
        }

        if (!formData.content || formData.content.length < 10) {
            newErrors.content = 'Nội dung phải có ít nhất 10 ký tự!';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // ✅ SUBMIT JSON RAW
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const payload = {
                type: mapFeedbackType(formData.feedbackType),
                message: formData.content
            };

            const res = await feedbackService.addFeedback(payload);

            // ❌ không đóng modal liền
            setStep('success');

            // optional: toast nhỏ
            showNotification(res.data.message, "success");

            // auto close sau 1.8s
            setTimeout(() => {
                setStep('form');
                setFormData({ feedbackType: '', content: '' });
                setErrors({});
                onClose();
            }, 2200);

        } catch (err) {
            showNotification(
                err?.response?.data?.message || 'Gửi góp ý thất bại',
                "error"
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal
            open={visible}
            onCancel={() => {
                setStep('form');
                onClose();
            }}
            footer={null}
            width={600}
            centered
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="relative border-b pb-6">
                    {/* Banner */}
                    <div
                        className="w-full h-48 rounded-t-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${feebackBanner})` }}
                    >
                    </div>


                    {/* Logo nổi trên banner */}
                    <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow flex items-center justify-center border border-gray-200">
                        <Image
                            src={logo}
                            preview={false}
                            className="w-16 h-16 object-contain"
                            alt="Logo"
                        />
                    </div>

                    {/* Tiêu đề */}
                    <div className="mt-16 text-center">
                        <h2 className="text-2xl font-bold">GymStar lắng nghe bạn</h2>
                        <p className="text-gray-500">Chia sẻ trải nghiệm của bạn</p>
                    </div>
                </div>


                {/* Form */}
                {step === 'form' && (
                    <div className="space-y-4">
                        {/* Loại góp ý */}
                        <div>
                            <label className="font-semibold">
                                Loại góp ý <span className="text-red-500">*</span>
                            </label>
                            <Select
                                className="w-full"
                                size="large"
                                placeholder="Chọn loại góp ý"
                                value={formData.feedbackType || undefined}
                                onChange={(v) =>
                                    handleInputChange('feedbackType', v)
                                }
                                status={errors.feedbackType ? 'error' : ''}
                            >
                                <Option value="compliment">Khen ngợi</Option>
                                <Option value="suggestion">Đề xuất</Option>
                                <Option value="complaint">Khiếu nại</Option>
                                <Option value="question">Câu hỏi</Option>
                                <Option value="product">Góp ý sản phẩm</Option>
                                <Option value="service">Góp ý dịch vụ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                            {errors.feedbackType && (
                                <p className="text-red-500 text-sm">
                                    {errors.feedbackType}
                                </p>
                            )}
                        </div>

                        {/* Nội dung */}
                        <div>
                            <label className="font-semibold">
                                Nội dung góp ý <span className="text-red-500">*</span>
                            </label>
                            <TextArea
                                rows={6}
                                maxLength={500}
                                showCount
                                value={formData.content}
                                onChange={(e) =>
                                    handleInputChange('content', e.target.value)
                                }
                                status={errors.content ? 'error' : ''}
                            />
                            {errors.content && (
                                <p className="text-red-500 text-sm">
                                    {errors.content}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button

                                size="large"
                                className="flex-1 rounded-full border-2 text-gray-600 hover:!text-black w-full font-semibold hover:!border-black "
                                onClick={onClose}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                className="flex-1 w-full bg-black  hover:!bg-gray-700 border-none rounded-full font-semibold"
                                loading={loading}
                                onClick={handleSubmit}
                                icon={<SendOutlined />}

                            >
                                Gửi góp ý
                            </Button>
                        </div>
                    </div>
                )}


                {step === 'success' && (
                    <div className="py-14 text-center space-y-4">
                        <div className="text-green-500 text-6xl">✓</div>

                        <h3 className="text-xl font-semibold text-gray-800">
                            Cảm ơn bạn đã góp ý!
                        </h3>

                        <p className="text-gray-500 max-w-md mx-auto">
                            Ý kiến của bạn giúp GymStar cải thiện dịch vụ tốt hơn mỗi ngày 💪
                        </p>
                    </div>
                )}

            </div>
        </Modal>
    );
};

export default FeedbackModal;
