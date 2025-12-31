import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // chứa thông tin user
  loading: true,

};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    setUser: (state, action) => {
      state.user = action.payload; // dùng khi gọi /me
      state.loading = false;

    },


    logout: (state) => {
      state.user = null;
      state.loading = false;

    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, logout, setLoading } =
  userSlice.actions;

export default userSlice.reducer;
