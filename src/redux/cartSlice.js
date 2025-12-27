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
        removeItem(state, action) {
            const id = action.payload;
            state.items = state.items.filter(item => item.cart_detail_id !== id);
            state.count = state.items.length;
        },
        updateItemQuantity(state, action) {
            const { cart_detail_id, quantity } = action.payload;
            const item = state.items.find(item => item.cart_detail_id === cart_detail_id);
            if (item) {
                item.quantity = quantity;
            }
        },
    },
});

export const { setCart, clearCart, removeItem, updateItemQuantity } = cartSlice.actions;
export default cartSlice.reducer;
