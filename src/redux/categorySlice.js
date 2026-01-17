import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    tree: [],
  },
  reducers: {
    setCategoryTree: (state, action) => {
      state.tree = action.payload;
    },
  },
});

export const { setCategoryTree } = categorySlice.actions;
export default categorySlice.reducer;
