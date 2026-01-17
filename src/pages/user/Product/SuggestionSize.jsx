import React, { useState } from 'react';
import { Modal } from 'antd';
import { CloseOutlined, ColumnHeightOutlined, BulbOutlined } from '@ant-design/icons';

const defaultShirtSizeChart = [
    { size: 'S', height: '155-160', weight: '48-55' },
    { size: 'M', height: '160-165', weight: '55-62' },
    { size: 'L', height: '165-172', weight: '62-69' },
    { size: 'XL', height: '172-177', weight: '69-76' },
    { size: '2XL', height: '177-183', weight: '76-85' },
];

const defaultPantsSizeChart = [
    { size: 'S', height: '155-160', weight: '48-55', waist: '66-70' },
    { size: 'M', height: '160-165', weight: '55-62', waist: '70-74' },
    { size: 'L', height: '165-172', weight: '62-69', waist: '74-78' },
    { size: 'XL', height: '172-177', weight: '69-76', waist: '78-82' },
    { size: '2XL', height: '177-183', weight: '76-85', waist: '82-86' },
];

const SuggestionSize = ({ isOpen, onClose, productType }) => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [waist, setWaist] = useState('');
    console.log(productType)
    const [status, setStatus] = useState({
        type: 'idle',
        message: 'Nhập thông tin để gợi ý size',
    });
    const isPants =
        productType &&
        productType.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('quan');


    const sizes = isPants ? defaultPantsSizeChart : defaultShirtSizeChart;

    const parseRange = (range) => range.split('-').map(Number);

    const calculateShirtSize = () => {
        const h = Number(height);
        const w = Number(weight);

        // Check rỗng
        if (!height || !weight) {
            setStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }

        // Phi thực tế
        if (h < 120 || h > 250 || w < 30 || w > 300) {
            setStatus({
                type: 'error',
                message: 'Số đo không hợp lệ (quá nhỏ hoặc quá lớn)',
            });
            return;
        }

        const parsed = sizes.map(s => {
            const [hMin, hMax] = parseRange(s.height);
            const [wMin, wMax] = parseRange(s.weight);
            return { ...s, hMin, hMax, wMin, wMax };
        });

        const maxWeight = Math.max(...parsed.map(s => s.wMax));
        const minWeight = Math.min(...parsed.map(s => s.wMin));
        const maxHeight = Math.max(...parsed.map(s => s.hMax));
        const minHeight = Math.min(...parsed.map(s => s.hMin));

        // Vượt hẳn bảng size
        if (w > maxWeight + 2 || h > maxHeight + 2 || w < minWeight - 2 || h < minHeight - 2) {
            setStatus({
                type: 'warning',
                message: 'Số đo vượt ngoài bảng size hiện tại',
            });
            return;
        }

        // Match chuẩn
        let match = parsed.find(s =>
            h >= s.hMin && h <= s.hMax &&
            w >= s.wMin && w <= s.wMax
        );

        // Match nới biên ±2
        if (!match) {
            match = parsed.find(s =>
                h >= s.hMin - 2 && h <= s.hMax + 2 &&
                w >= s.wMin - 2 && w <= s.wMax + 2
            );
        }

        if (!match) {
            setStatus({
                type: 'warning',
                message: 'Không tìm thấy size phù hợp',
            });
            return;
        }

        // Check sát biên
        const nearBoundary =
            Math.abs(h - match.hMin) <= 2 ||
            Math.abs(h - match.hMax) <= 2 ||
            Math.abs(w - match.wMin) <= 2 ||
            Math.abs(w - match.wMax) <= 2;

        if (nearBoundary) {
            setStatus({
                type: 'warning',
                message: `Bạn đang ở sát biên size ${match.size}, nên cân nhắc lên size nếu thích mặc rộng`,
                size: match.size,
            });
            return;
        }

        setStatus({
            type: 'success',
            message: `Size phù hợp là ${match.size}`,
            size: match.size,
        });
    };



    const calculatePantsSize = () => {
        const h = Number(height);
        const w = Number(weight);
        const ws = Number(waist);

        // Check rỗng
        if (!height || !weight || !waist) {
            setStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }

        // Phi thực tế
        if (h < 120 || h > 250 || w < 30 || w > 300 || ws < 50 || ws > 200) {
            setStatus({
                type: 'error',
                message: 'Số đo không hợp lệ (quá nhỏ hoặc quá lớn)',
            });
            return;
        }

        const parsed = sizes.map(s => {
            const [hMin, hMax] = parseRange(s.height);
            const [wMin, wMax] = parseRange(s.weight);
            const [waistMin, waistMax] = parseRange(s.waist);
            return { ...s, hMin, hMax, wMin, wMax, waistMin, waistMax };
        });

        const maxWaist = Math.max(...parsed.map(s => s.waistMax));
        const minWaist = Math.min(...parsed.map(s => s.waistMin));

        if (ws > maxWaist + 2 || ws < minWaist - 2) {
            setStatus({
                type: 'warning',
                message: 'Vòng eo vượt ngoài bảng size hiện tại',
            });
            return;
        }

        // Match chuẩn
        let match = parsed.find(s =>
            ws >= s.waistMin && ws <= s.waistMax &&
            h >= s.hMin && h <= s.hMax
        );

        // Match nới biên ±2
        if (!match) {
            match = parsed.find(s =>
                ws >= s.waistMin - 2 && ws <= s.waistMax + 2 &&
                h >= s.hMin - 2 && h <= s.hMax + 2
            );
        }

        if (!match) {
            setStatus({
                type: 'warning',
                message: 'Không tìm thấy size phù hợp',
            });
            return;
        }

        // Sát biên
        const nearBoundary =
            Math.abs(ws - match.waistMin) <= 2 ||
            Math.abs(ws - match.waistMax) <= 2;

        if (nearBoundary) {
            setStatus({
                type: 'warning',
                message: `Bạn đang sát biên size ${match.size}, nên cân nhắc lên size nếu thích mặc thoải mái`,
                size: match.size,
            });
            return;
        }

        setStatus({
            type: 'success',
            message: `Size phù hợp là ${match.size}`,
            size: match.size,
        });
    };



    const calculateSize = () => {
        if (isPants) calculatePantsSize();
        else calculateShirtSize();
    };

    return (
        <Modal open={isOpen} onCancel={onClose} footer={null} width={1000} closeIcon={false} centered>
            <div className="bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">

                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Hướng dẫn chọn size {isPants ? 'quần' : 'áo'}
                    </h2>
                    <button onClick={onClose}>
                        <CloseOutlined style={{ fontSize: 22 }} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">

                    <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ColumnHeightOutlined /> Tính toán size
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input placeholder="Chiều cao (cm)" value={height} onChange={e => setHeight(e.target.value)} className="px-4 py-3 border rounded-lg" />
                            <input placeholder="Cân nặng (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="px-4 py-3 border rounded-lg" />

                            {isPants && (
                                <input placeholder="Vòng eo (cm)" value={waist} onChange={e => setWaist(e.target.value)} className="px-4 py-3 border rounded-lg" />
                            )}
                        </div>

                        <button onClick={calculateSize} className="w-full bg-blue-600 text-white py-3 rounded-lg">
                            Tính toán
                        </button>

                        <div className="mt-4 min-h-[70px] flex items-center justify-center">
                            <div className={`w-full p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-50 border-green-400' :
                                status.type === 'error' ? 'bg-red-50 border-red-400' :
                                    'bg-gray-50 border-gray-200'
                                }`}>
                                <p className="text-center">
                                    {status.type === 'success'
                                        ? <span className="text-2xl font-bold text-green-600">{status.size}</span>
                                        : status.message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Bảng size</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th>Size</th>
                                        <th>Chiều cao</th>
                                        <th>Cân nặng</th>
                                        {isPants && <th>Vòng eo</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sizes.map((row, i) => (
                                        <tr key={i} className={`${i % 2 ? 'bg-gray-50' : 'bg-white'} ${status.type === 'success' && status.size === row.size ? 'bg-green-100 font-bold' : ''
                                            }`}>
                                            <td className="text-center">{row.size}</td>
                                            <td className="text-center">{row.height}</td>
                                            <td className="text-center">{row.weight}</td>
                                            {isPants && <td className="text-center">{row.waist}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-amber-50 border rounded-lg p-5">
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <BulbOutlined /> Lưu ý
                        </h3>
                        <ul className="text-sm space-y-1">
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
