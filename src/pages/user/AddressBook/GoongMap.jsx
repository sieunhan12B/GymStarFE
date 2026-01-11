import React, { useEffect, useRef, useState } from "react";

const MAP_KEY = "GoSBpp4tfxKwxOd1cXgdhba5aU5nnTwdnXYFMe3L";
const REST_KEY = "5ZhRsh04dXRNT54EXlgBblniHkg4ASscrVh5mY8t";

export default function GoongMap() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);

    const [address, setAddress] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        window.goongjs.accessToken = MAP_KEY;

        map.current = new window.goongjs.Map({
            container: mapContainer.current,
            style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${MAP_KEY}`,
            center: [106.700981, 10.776889],
            zoom: 12,
        });

        marker.current = new window.goongjs.Marker()
            .setLngLat([106.700981, 10.776889])
            .addTo(map.current);
    }, []);

    // Gọi API autocomplete khi gõ
    const handleChange = async (value) => {
        setAddress(value);

        if (!value) {
            setSuggestions([]);
            return;
        }

        const url = `https://rsapi.goong.io/place/autocomplete?input=${encodeURIComponent(
            value
        )}&api_key=${REST_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.predictions) {
            setSuggestions(data.predictions);
        }
    };

    // Click 1 gợi ý
    const selectSuggestion = async (item) => {
        setAddress(item.description);
        setSuggestions([]);

        const detailUrl = `https://rsapi.goong.io/place/detail?place_id=${item.place_id}&api_key=${REST_KEY}`;

        const res = await fetch(detailUrl);
        const data = await res.json();

        if (data.result) {
            const { lat, lng } = data.result.geometry.location;

            map.current.flyTo({
                center: [lng, lat],
                zoom: 16,
            });

            if (marker.current) marker.current.remove();

            marker.current = new window.goongjs.Marker()
                .setLngLat([lng, lat])
                .addTo(map.current);
        }
    };

    return (
        <div style={{ position: "relative", maxWidth: 400 }}>
            <input
                value={address}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Nhập địa chỉ..."
                style={{ width: "100%", padding: 8 }}
            />

            {suggestions.length > 0 && (
                <div
                    style={{
                        position: "absolute",
                        background: "#fff",
                        border: "1px solid #ddd",
                        width: "100%",
                        zIndex: 10,
                        maxHeight: 200,
                        overflowY: "auto",
                    }}
                >
                    {suggestions.map((item) => (
                        <div
                            key={item.place_id}
                            onClick={() => selectSuggestion(item)}
                            style={{
                                padding: 8,
                                cursor: "pointer",
                                borderBottom: "1px solid #eee",
                            }}
                        >
                            {item.description}
                        </div>
                    ))}
                </div>
            )}

            <div
                ref={mapContainer}
                style={{ width: "100%", height: "500px", marginTop: 10 }}
            />
        </div>
    );
}
