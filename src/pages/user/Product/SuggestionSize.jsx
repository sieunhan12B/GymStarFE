import React, { useState } from 'react';
import { Modal } from 'antd';
import {
    CloseOutlined,
    ColumnHeightOutlined,
    BulbOutlined,
} from '@ant-design/icons';

const SuggestionSize = ({ isOpen, onClose, sizeChart }) => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [status, setStatus] = useState({
        type: 'idle', // idle | error | success
        message: 'Nhập chiều cao và cân nặng để gợi ý size phù hợp',
    });

    // result = { type: 'success' | 'error', message: string }

    const defaultSizeChart = [
        { size: 'S', height: '155-160', weight: '48-55', chest: '65', waist: '47', shoulder: '47', sleeve: '34.5', cuffWidth: '19.6', cuffOpening: '16', collarWidth: '16' },
        { size: 'M', height: '160-165', weight: '55-62', chest: '67', waist: '49', shoulder: '40', sleeve: '36', cuffWidth: '20.4', cuffOpening: '16.5', collarWidth: '15.5' },
        { size: 'L', height: '165-172', weight: '62-69', chest: '69', waist: '51', shoulder: '51', sleeve: '37', cuffWidth: '21.2', cuffOpening: '17', collarWidth: '15' },
        { size: 'XL', height: '172-177', weight: '69-76', chest: '71', waist: '53', shoulder: '53', sleeve: '39', cuffWidth: '22', cuffOpening: '17', collarWidth: '16.5' },
        { size: '2XL', height: '177-183', weight: '76-85', chest: '73', waist: '55', shoulder: '55', sleeve: '40.5', cuffWidth: '22.8', cuffOpening: '18', collarWidth: '17' },
    ];

    const sizes = sizeChart || defaultSizeChart;

    const calculateSize = () => {
        const h = Number(height);
        const w = Number(weight);

        if (!h || !w) {
            setStatus({
                type: 'error',
                message: 'Vui lòng nhập đầy đủ chiều cao và cân nặng',
            });
            return;
        }

        if (h < 140 || h > 200) {
            setStatus({
                type: 'error',
                message: 'Chiều cao nên nằm trong khoảng 140 – 200 cm',
            });
            return;
        }

        if (w < 35 || w > 150) {
            setStatus({
                type: 'error',
                message: 'Cân nặng nên nằm trong khoảng 35 – 150 kg',
            });
            return;
        }

        const matched = sizes.find((item) => {
            const [hMin, hMax] = item.height.split('-').map(Number);
            const [wMin, wMax] = item.weight.split('-').map(Number);
            return h >= hMin && h <= hMax && w >= wMin && w <= wMax;
        });

        const finalSize = matched
            ? matched.size
            : sizes[sizes.length - 1].size;

        setStatus({
            type: 'success',
            message: `Size phù hợp với bạn là ${finalSize}`,
            size: finalSize,
        });
    };


    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={1100}
            closeIcon={false}
            centered
            bodyStyle={{ padding: 0 }}
        >
            <div className="bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Hướng dẫn chọn size
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <CloseOutlined style={{ fontSize: 22 }} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6">

                    {/* Calculator */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                            <ColumnHeightOutlined className="text-blue-600" />
                            Tính toán size phù hợp
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chiều cao (cm)
                                </label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cân nặng (kg)
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg"
                                />
                            </div>
                        </div>

                        <button
                            onClick={calculateSize}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg"
                        >
                            Tính toán
                        </button>

                        {/* RESULT / ERROR DISPLAY */}
                        {status && (
                            <div className="mt-4 min-h-[80px] flex items-center justify-center">
                                <div
                                    className={`w-full p-4 rounded-lg border transition-all ${status.type === 'success'
                                            ? 'bg-green-50 border-green-400'
                                            : status.type === 'error'
                                                ? 'bg-amber-50 border-amber-400'
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <p className="text-center text-sm text-gray-700">
                                        {status.type === 'success' ? (
                                            <>
                                                <span className="font-medium">Size gợi ý: </span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {status.size}
                                                </span>
                                            </>
                                        ) : (
                                            status.message
                                        )}
                                    </p>
                                </div>
                            </div>

                        )}
                    </div>

                    {/* Table */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Bảng size chi tiết</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        {['Size', 'Chiều cao', 'Cân nặng', 'Dài thân', 'Ngang ngực', 'Ngang gấu', 'Dài tay', 'Rộng bắp tay', 'Cửa tay', 'Ngang cổ']
                                            .map(h => (
                                                <th key={h} className="px-4 py-3 text-center">{h}</th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sizes.map((row, i) => (
                                        <tr
                                            key={i}
                                            className={`${i % 2 ? 'bg-gray-50' : 'bg-white'} ${status?.type === 'success' && status.message === row.size
                                                ? 'bg-green-100 font-semibold'
                                                : ''
                                                }`}
                                        >
                                            <td className="px-4 py-3 font-bold">{row.size}</td>
                                            <td className="px-4 py-3 text-center">{row.height}</td>
                                            <td className="px-4 py-3 text-center">{row.weight}</td>
                                            <td className="px-4 py-3 text-center">{row.chest}</td>
                                            <td className="px-4 py-3 text-center">{row.waist}</td>
                                            <td className="px-4 py-3 text-center">{row.shoulder}</td>
                                            <td className="px-4 py-3 text-center">{row.sleeve}</td>
                                            <td className="px-4 py-3 text-center">{row.cuffWidth}</td>
                                            <td className="px-4 py-3 text-center">{row.cuffOpening}</td>
                                            <td className="px-4 py-3 text-center">{row.collarWidth}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-amber-50 border rounded-lg p-5">
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <BulbOutlined /> Lưu ý khi chọn size
                        </h3>
                        <ul className="text-sm space-y-1">
                            <li>• Ưu tiên theo chiều cao nếu thích mặc rộng</li>
                            <li>• Giữa 2 size → chọn size lớn hơn</li>
                            <li>• Sai số ±1–2cm</li>
                        </ul>
                    </div>

                </div>
            </div>
        </Modal>
    );
};

export default SuggestionSize;
