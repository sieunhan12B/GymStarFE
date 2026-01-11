import { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Select, Spin, message, AutoComplete } from "antd";
import { removeVietnameseTones } from "../../utils/removeVietnameseTones";
import useDebounce from "@/hooks/useDebounce";

// === KEYS ===
const GOONG_REST_KEY = "5ZhRsh04dXRNT54EXlgBblniHkg4ASscrVh5mY8t";
const GOONG_MAP_KEY = "GoSBpp4tfxKwxOd1cXgdhba5aU5nnTwdnXYFMe3L";

const DEFAULT_CENTER = { lat: 10.77653, lng: 106.700981 };

const AddEditAddressModal = ({ open, onCancel, onSubmit, addressData, mode }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [suggestions, setSuggestions] = useState([]);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

    const [form] = Form.useForm();
    const [coordinates, setCoordinates] = useState(DEFAULT_CENTER);

    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);

    const [searchText, setSearchText] = useState("");
    const debouncedSearchText = useDebounce(searchText, 600);

    const city = Form.useWatch("city", form);
    const selectedCity = data.find((c) => c.name === city);
    const wards = selectedCity?.wards || [];

    // ================= Fetch tỉnh/thành =================
    useEffect(() => {
        setLoading(true);
        fetch("https://provinces.open-api.vn/api/v2/?depth=2")
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch(() => {
                message.error("Không tải được danh sách tỉnh/thành phố");
                setLoading(false);
            });
    }, []);

    // ================= Geocode =================
    const geocodeAddress = async (address) => {
        try {
            const res = await fetch(
                `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${GOONG_REST_KEY}`
            );
            const data = await res.json();
            if (data.results?.[0]) {
                return data.results[0].geometry.location;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    };

    // ================= Autocomplete =================
    useEffect(() => {
        if (!debouncedSearchText || debouncedSearchText.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setFetchingSuggestions(true);
            try {
                const ward = form.getFieldValue("ward") || "";
                const city = form.getFieldValue("city") || "";
                const query = [debouncedSearchText, ward, city].filter(Boolean).join(", ");

                const res = await fetch(
                    `https://rsapi.goong.io/v2/place/autocomplete?api_key=${GOONG_REST_KEY}&input=${encodeURIComponent(query)}`
                );

                const data = await res.json();
                setSuggestions(data.predictions || []);
            } catch (e) {
                console.error(e);
            } finally {
                setFetchingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchText]);

    // ================= Set dữ liệu edit =================
    useEffect(() => {
        if (!addressData) return;
        form.setFieldsValue(addressData);
    }, [addressData, form]);

    // ================= Init map =================
    useEffect(() => {
        if (!open) {
            map.current = null;
            marker.current = null;
            return;
        }

        const timer = setTimeout(() => {
            if (!window.goongjs || !mapContainer.current || map.current) return;

            window.goongjs.accessToken = GOONG_MAP_KEY;

            map.current = new window.goongjs.Map({
                container: mapContainer.current,
                style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`,
                center: [coordinates.lng, coordinates.lat],
                zoom: 14,
            });

            map.current.on("load", () => {
                marker.current = new window.goongjs.Marker()
                    .setLngLat([coordinates.lng, coordinates.lat])
                    .addTo(map.current);
            });

            map.current.on("click", (e) => {
                const { lng, lat } = e.lngLat;
                setCoordinates({ lat, lng });

                if (marker.current) marker.current.remove();
                marker.current = new window.goongjs.Marker().setLngLat([lng, lat]).addTo(map.current);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [open]);

    // ================= Edit: pin từ address_detail =================
    useEffect(() => {
        if (!open || !addressData?.address_detail) return;

        const run = async () => {
            // Đợi map sẵn sàng
            while (!map.current) {
                await new Promise((r) => setTimeout(r, 100));
            }

            const location = await geocodeAddress(addressData.address_detail);
            if (!location) return;

            setCoordinates(location);

            map.current.flyTo({
                center: [location.lng, location.lat],
                zoom: 16,
            });

            if (marker.current) marker.current.remove();
            marker.current = new window.goongjs.Marker()
                .setLngLat([location.lng, location.lat])
                .addTo(map.current);
        };

        run();
    }, [open, addressData]);

    // ================= Select suggestion =================
    const handleSelect = async (value, option) => {
        form.setFieldsValue({
            houseNumber: option.fullAddress,
            city: form.getFieldValue("city") || option.city,
            ward: form.getFieldValue("ward") || option.ward,
        });

        try {
            const res = await fetch(
                `https://rsapi.goong.io/v2/place/detail?place_id=${option.place_id}&api_key=${GOONG_REST_KEY}`
            );

            const data = await res.json();

            if (data.result) {
                const { lat, lng } = data.result.geometry.location;
                setCoordinates({ lat, lng });

                if (map.current) {
                    map.current.flyTo({ center: [lng, lat], zoom: 16 });

                    if (marker.current) marker.current.remove();
                    marker.current = new window.goongjs.Marker().setLngLat([lng, lat]).addTo(map.current);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ================= Submit =================
    const handleFinish = async (values) => {
        setSubmitting(true);
        try {
            await onSubmit({
                ...values,
            });
        } catch (error) {
            // ❌ Không reset
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={mode === "add" ? "Thêm địa chỉ mới" : "Cập nhật địa chỉ"}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={submitting}
            width={800}
            destroyOnClose
        >
            {loading ? (
                <div className="flex justify-center py-16">
                    <Spin size="large" />
                </div>
            ) : (
                <Form layout="vertical" form={form} onFinish={handleFinish}>
                    <Form.Item label="Tên người nhận" name="receiver_name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Tỉnh / Thành phố" name="city">
                        <Select
                            showSearch
                            allowClear
                            options={data.map((c) => ({ label: c.name, value: c.name }))}
                            filterOption={(input, option) =>
                                removeVietnameseTones(option.label.toLowerCase()).includes(
                                    removeVietnameseTones(input.toLowerCase())
                                )
                            }
                            onChange={() => form.setFieldsValue({ ward: undefined })}
                        />
                    </Form.Item>

                    <Form.Item label="Phường / Xã" name="ward">
                        <Select
                            showSearch
                            disabled={!city}
                            allowClear
                            options={wards.map((w) => ({ label: w.name, value: w.name }))}
                            filterOption={(input, option) =>
                                removeVietnameseTones(option.label.toLowerCase()).includes(
                                    removeVietnameseTones(input.toLowerCase())
                                )
                            }
                        />
                    </Form.Item>

                    <Form.Item label="Địa chỉ chi tiết" name="houseNumber" rules={[{ required: true }]}>
                        <AutoComplete
                            onSearch={(val) => setSearchText(val)}
                            onSelect={handleSelect}
                            notFoundContent={fetchingSuggestions ? <Spin size="small" /> : null}
                            options={suggestions.map((s) => ({
                                value: s.description,
                                label: s.description,
                                fullAddress: s.description,
                                ward: s.compound?.commune,
                                city: s.compound?.province,
                                place_id: s.place_id,
                            }))}
                        />
                    </Form.Item>

                    <div
                        ref={mapContainer}
                        style={{
                            width: "100%",
                            height: 320,
                            marginTop: 10,
                            borderRadius: 8,
                            overflow: "hidden",
                        }}
                    />
                </Form>
            )}
        </Modal>
    );
};

export default AddEditAddressModal;