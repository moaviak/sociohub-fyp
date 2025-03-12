import { createSlice } from "@reduxjs/toolkit";
import { Advisor, Student, UserType } from "./types";

interface AuthState {
  user: Student | Advisor | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  userType: null,
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
      state.userType = action.payload.userType;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.userType = null;
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
