import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '@/config/serverApiConfig';
import { getCookie, setCookie, deleteCookie } from '@/auth/cookie';
import { login as loginService, logout as logoutService } from '@/auth/auth.service';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}login?timestamp=${new Date().getTime()}`,
        credentials
      );
      
      const { token, refreshToken, admin } = response.data.result;
      
      // Store tokens in cookies
      setCookie(ACCESS_TOKEN_NAME, token);
      setCookie('refreshToken', refreshToken);
      
      return { token, refreshToken, admin };
    } catch (error: any) {
      return rejectWithValue(errorHandler(error));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = getCookie(ACCESS_TOKEN_NAME);
      
      if (token) {
        await axios.post(
          `${API_BASE_URL}logout`,
          {},
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
      }
      
      // Clear cookies
      deleteCookie(ACCESS_TOKEN_NAME);
      deleteCookie('refreshToken');
      
      logoutService();
      return true;
    } catch (error: any) {
      // Clear cookies even if API call fails
      deleteCookie(ACCESS_TOKEN_NAME);
      deleteCookie('refreshToken');
      return rejectWithValue(errorHandler(error));
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getCookie('refreshToken');
      
      if (!refreshToken) {
        return rejectWithValue({ message: 'No refresh token' });
      }
      
      const response = await axios.post(`${API_BASE_URL}refresh`, {
        refreshToken,
      });
      
      const { token, refreshToken: newRefreshToken } = response.data.result;
      
      // Store new tokens
      setCookie(ACCESS_TOKEN_NAME, token);
      setCookie('refreshToken', newRefreshToken);
      
      return { token, refreshToken: newRefreshToken };
    } catch (error: any) {
      // Clear tokens on refresh failure
      deleteCookie(ACCESS_TOKEN_NAME);
      deleteCookie('refreshToken');
      return rejectWithValue(errorHandler(error));
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = getCookie(ACCESS_TOKEN_NAME);
      
      if (!token) {
        return rejectWithValue({ message: 'No token found' });
      }
      
      // Validate token by making a request
      const response = await axios.get(`${API_BASE_URL}admin/list`, {
        headers: {
          'x-auth-token': token,
        },
      });
      
      return { isAuthenticated: true, admin: response.data.result?.[0] };
    } catch (error: any) {
      deleteCookie(ACCESS_TOKEN_NAME);
      deleteCookie('refreshToken');
      return rejectWithValue(errorHandler(error));
    }
  }
);
