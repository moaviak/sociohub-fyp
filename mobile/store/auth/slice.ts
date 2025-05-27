import { UserType } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { clearTokens, getTokens, saveTokens } from "../storage";

interface AuthState {
  user: Student | Advisor | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isTokenLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  userType: null,
  isAuthenticated: false,
  isAuthChecked: false,
  accessToken: null,
  refreshToken: null,
  isTokenLoading: true,
};

const AuthSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.userType = action.payload.userType;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;

      if (action.payload.accessToken && action.payload.refreshToken) {
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.isAuthChecked = true;

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

      if (action.payload.accessToken && action.payload.refreshToken) {
        saveTokens(action.payload.accessToken, action.payload.refreshToken);
      }
    },
    initializeTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setTokenLoading: (state, action) => {
      state.isTokenLoading = action.payload;
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
  initializeTokens,
  setTokenLoading,
} = AuthSlice.actions;

export const initializeAuth = () => async (dispatch: any) => {
  try {
    const tokens = await getTokens();
    if (!tokens.accessToken && !tokens.refreshToken) {
      // If both tokens are null, clear the auth state
      dispatch(logout());
    } else {
      dispatch(initializeTokens(tokens));
    }
  } catch (error) {
    console.log("Failed to initialize auth:", error);
    // In case of any error, clear the auth state
    dispatch(logout());
  } finally {
    dispatch(setTokenLoading(false));
  }
};

export default AuthSlice.reducer;
