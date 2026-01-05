import { generateSlug } from "./generateSlug";

export const buildCategoryUrl = (category, parents = []) => {
    const parentPath = parents
        .map(p => generateSlug(p.name))
        .join("/");

    const self = `${generateSlug(category.name)}-${category.category_id}`;

    return parentPath
        ? `/danh-muc/${parentPath}/${self}`
        : `/danh-muc/${self}`;
};
