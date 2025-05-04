import { createSlice } from "@reduxjs/toolkit";

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
  },
});

export const { login, logout, setAuthChecked, setSociety, verifyEmail } =
  AuthSlice.actions;

export default AuthSlice.reducer;
