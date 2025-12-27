const findCategoryPath = (categories, categoryId) => {
    for (const l1 of categories) {
        if (l1.category_id === categoryId) {
            return { level1: l1.category_id, level2: null };
        }

        for (const l2 of l1.children || []) {
            if (l2.category_id === categoryId) {
                return { level1: l1.category_id, level2: null };
            }

            for (const l3 of l2.children || []) {
                if (l3.category_id === categoryId) {
                    return {
                        level1: l1.category_id,
                        level2: l2.category_id,
                    };
                }
            }
        }
    }

    return { level1: null, level2: null };
};

export { findCategoryPath };