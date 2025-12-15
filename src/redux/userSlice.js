import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // chứa thông tin user

};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    setUser: (state, action) => {
      state.user = action.payload; // dùng khi gọi /me

    },
  

    logout: (state) => {
      state.user = null;
            state.token = null;

    },
  },
});

export const { setUser, logout } =
  userSlice.actions;

export default userSlice.reducer;
