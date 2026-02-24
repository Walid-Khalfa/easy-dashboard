import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, logout as logoutApi, refreshAccessToken, checkAuthStatus } from './actions';

interface AuthState {
  current: any;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
}

const initialState: AuthState = {
  current: null,
  isLoggedIn: false,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.isAuthenticated = true;
      state.current = action.payload.admin;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.isAuthenticated = false;
      state.current = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.isAuthenticated = false;
      state.current = null;
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginApi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginApi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.isAuthenticated = true;
        state.current = action.payload.admin;
        state.error = null;
      })
      .addCase(loginApi.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.isAuthenticated = false;
        state.current = null;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutApi.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.isAuthenticated = false;
        state.current = null;
        state.error = null;
      })
      // Refresh token
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isLoggedIn = false;
        state.isAuthenticated = false;
        state.current = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isLoggedIn = true;
        state.current = action.payload.admin;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isLoggedIn = false;
        state.current = null;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout: logoutAction, setAuthenticated, clearError } = authSlice.actions;
export default authSlice.reducer;
