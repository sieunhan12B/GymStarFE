import React, { useMemo } from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { generateSlug } from "@/utils/generateSlug";

const findPathById = (tree, id, path = []) => {
    for (let node of tree) {
        const newPath = [...path, node];
        if (node.category_id === id) return newPath;

        if (node.children?.length) {
            const found = findPathById(node.children, id, newPath);
            if (found) return found;
        }
    }
    return null;
};

const getCategoryIdFromSplat = (splat) => {
    if (!splat) return null;
    const segments = splat.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    const match = last.match(/-(\d+)$/);
    return match ? Number(match[1]) : null;
};

const BreadcrumbBar = ({ product }) => {
    const location = useLocation();
    const params = useParams();
    const categoryTree = useSelector((state) => state.categorySlice.tree);

    const breadcrumbItems = useMemo(() => {
        let items = [
            {
                title: (
                    <Link to="/" className="flex items-center  gap-1">
                        <HomeOutlined />
                    </Link>
                ),
            },
        ];

        const pathname = location.pathname;

        // ===== CATEGORY PAGE =====
        if (pathname.startsWith("/danh-muc")) {
            const splat = params["*"];
            const categoryId = getCategoryIdFromSplat(splat);

            if (categoryId && categoryTree.length > 0) {
                const path = findPathById(categoryTree, categoryId);

                if (path) {
                    let currentPath = "/danh-muc";

                    path.forEach((cat) => {
                        const slug = `${generateSlug(cat.name)}-${cat.category_id}`;
                        currentPath += `/${slug}`;

                        items.push({
                            title: <Link to={currentPath}>{cat.name}</Link>,
                        });
                    });
                }
            }
        }

        // ===== PRODUCT DETAIL PAGE =====
        if (pathname.startsWith("/san-pham") && product && categoryTree.length > 0) {
            const path = findPathById(categoryTree, product.category_id);

            if (path) {
                let currentPath = "/danh-muc";

                path.forEach((cat) => {
                    const slug = `${generateSlug(cat.name)}-${cat.category_id}`;
                    currentPath += `/${slug}`;

                    items.push({
                        title: <Link to={currentPath}>{cat.name}</Link>,
                    });
                });
            }

            items.push({
                title: product.name,
            });
        }

        // ===== SEARCH PAGE =====
        if (pathname.startsWith("/tim-kiem")) {
            const keyword = params.keyword;
            items.push({ title: "Tìm kiếm" });
            if (keyword) {
                items.push({ title: `"${keyword}"` });
            }
        }

        // ===== SPECIAL PAGES =====
        if (pathname === "/san-pham-moi") {
            items.push({ title: "Sản phẩm mới" });
        }

        if (pathname === "/san-pham-ban-chay") {
            items.push({ title: "Bán chạy" });
        }

        if (pathname === "/san-pham-giam-gia") {
            items.push({ title: "Giảm giá" });
        }

        // ===== MAKE LAST ITEM BOLD & BIGGER =====
        items = items.map((item, index) => {
            const isLast = index === items.length - 1;

            if (!isLast) return item;

            return {
                ...item,
                title: (
                    <span className="font-bold text-base text-black">
                        {item.title}
                    </span>
                ),
            };
        });

        return items;
    }, [location.pathname, params, categoryTree, product]);

    if (breadcrumbItems.length <= 1) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb className="font-semibold" separator="/" items={breadcrumbItems} />
        </div>
    );
};

export default BreadcrumbBar;
