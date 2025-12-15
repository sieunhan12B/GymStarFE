import { createSlice } from "@reduxjs/toolkit";



const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        count: 0,
    },
    reducers: {
        setCart(state, action) {
            state.items = action.payload;
            state.count = action.payload.length;
        },
        clearCart: (state) => {
            state.items = [];
            state.count = 0;
        },
        // Xóa 1 item theo id
        removeItem(state, action) {
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id);
            state.count = state.items.length;
        },
        // Cập nhật số lượng 1 item theo id
        updateItemQuantity(state, action) {
            const { product_variant_id, quantity } = action.payload;
            const item = state.items.find(item => item.product_variant_id === product_variant_id);
            if (item) {
                item.quantity = quantity;
            }
        },

    },
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
