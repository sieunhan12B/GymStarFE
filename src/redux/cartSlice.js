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

    },
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
