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
}

const initialState: AuthState = {
  user: null,
  userType: null,
  isAuthenticated: false,
  isAuthChecked: false,
  accessToken: null,
  refreshToken: null,
};

// To initialize your state with tokens from storage, you should do it before creating the slice.
// You can't call reducers directly to mutate the initialState outside of Redux's flow.
// Instead, fetch tokens before creating the slice and set them in initialState.

let tokens: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

(async () => {
  tokens = await getTokens();
})();

const hydratedInitialState: AuthState = {
  ...initialState,
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
};

const AuthSlice = createSlice({
  name: "authSlice",
  initialState: hydratedInitialState,
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
