import { createSlice } from "@reduxjs/toolkit";
import { Advisor, Student, UserType } from "@/types";
import { clearTokens, getTokens, saveTokens } from "./storage";

interface AuthState {
  user: Student | Advisor | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

// Get tokens from localStorage on initial load
const { accessToken: storedAccessToken, refreshToken: storedRefreshToken } =
  getTokens();

const initialState: AuthState = {
  user: null,
  userType: null,
  isAuthenticated: false,
  isAuthChecked: false,
  accessToken: storedAccessToken || null,
  refreshToken: storedRefreshToken || null,
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
      state.refreshToken = action.payload.refreshToken;

      // Save tokens to localStorage for persistence
      if (action.payload.accessToken && action.payload.refreshToken) {
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthChecked = true;

      // Clear tokens from localStorage
      clearTokens();
    },
    setAuthChecked: (state, action) => {
      state.isAuthChecked = action.payload;
    },
    setSociety: (state, action) => {
      (state.user as Advisor).societyId = action.payload.society.id;
    },
    verifyEmail: (state) => {
      if (state.user) {
        state.user.isEmailVerified = true;
      }
    },
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Save tokens to localStorage for persistence
      if (action.payload.accessToken && action.payload.refreshToken) {
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      }
    },
  },
});

export const {
  login,
  logout,
  setAuthChecked,
  setSociety,
  verifyEmail,
  setCredentials,
} = AuthSlice.actions;

export default AuthSlice.reducer;
