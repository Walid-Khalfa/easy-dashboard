import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  current: any;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  current: null,
  isLoggedIn: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.current = action.payload;
    },
    loginFailure: (state) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.current = null;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.current = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
