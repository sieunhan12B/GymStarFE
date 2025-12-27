import { useEffect, useState } from "react";
import { Select, Input, Spin, Form } from "antd";

const AddressSelector = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const city = Form.useWatch("city");
    const selectedCity = data.find(c => c.name === city);
    const wards = selectedCity?.wards || [];

    // fetch tỉnh thành
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/v2/?depth=2")
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <Spin />;

    return (
        <div className="space-y-4">
            {/* SỐ NHÀ */}
            <div>
                <label className="block mb-1 font-medium">Số nhà / Đường</label>
                <Form.Item name="houseNumber" noStyle>
                    <Input />
                </Form.Item>
            </div>

            {/* TỈNH / THÀNH */}
            <div>
                <label className="block mb-1 font-medium">Tỉnh / Thành phố</label>
                <Form.Item name="city" noStyle>
                    <Select
                        showSearch
                        className="w-full"
                        options={data.map(c => ({
                            label: c.name,
                            value: c.name
                        }))}
                    />
                </Form.Item>
            </div>

            {/* PHƯỜNG / XÃ */}
            <div>
                <label className="block mb-1 font-medium">Phường / Xã</label>
                <Form.Item name="ward" noStyle>
                    <Select
                        showSearch
                        className="w-full"
                        disabled={!city}
                        options={wards.map(w => ({
                            label: w.name,
                            value: w.name
                        }))}
                    />
                </Form.Item>
            </div>
        </div>
    );
};

export default AddressSelector;
