import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, 
  loading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    setUser: (state, action) => {
      state.user = action.payload; 
      state.loading = false;

    },

    logout: (state) => {
      state.user = null;
      state.loading = false;

    },
  },
});

export const { setUser, logout } =
  userSlice.actions;

export default userSlice.reducer;
