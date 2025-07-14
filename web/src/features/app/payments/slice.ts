import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PaymentOnboardingStatus {
  isOnboarded: boolean;
  accountId?: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface PaymentState {
  onboardingStatus: PaymentOnboardingStatus | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  onboardingStatus: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setOnboardingStatus: (
      state,
      action: PayloadAction<PaymentOnboardingStatus>
    ) => {
      state.onboardingStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setOnboardingStatus, setLoading, setError, clearError } =
  paymentSlice.actions;
export default paymentSlice.reducer;
