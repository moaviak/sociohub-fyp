import { createSlice } from "@reduxjs/toolkit";
import { User } from "./types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,
  accessToken: null,
};

const AuthSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.isAuthChecked = true;
    },
    updateCheckAuth: (state, action) => {
      state.isAuthChecked = action.payload;
    },
  },
});

export const { login, logout, updateCheckAuth } = AuthSlice.actions;

export default AuthSlice.reducer;
