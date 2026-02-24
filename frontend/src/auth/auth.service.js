// Import API base URL and access token name from serverApiConfig
import { API_BASE_URL, ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from "@/config/serverApiConfig";

import axios from "axios";
import errorHandler from "@/request/errorHandler";
import successHandler from "@/request/successHandler";

import { getCookie, setCookie, deleteCookie } from "./cookie";

export const login = async (loginAdminData) => {
  try {
    const response = await axios.post(
      API_BASE_URL + `login?timestamp=${new Date().getTime()}`,
      loginAdminData
    );
    
    const { token, refreshToken } = response.data.result;
    
    // Store tokens
    setCookie(ACCESS_TOKEN_NAME, token);
    setCookie(REFRESH_TOKEN_NAME, refreshToken);
    
    return successHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

export const logout = () => {
  token.remove();
  refreshToken.remove();
};

export const token = {
  get: () => {
    return getCookie(ACCESS_TOKEN_NAME);
  },
  set: (token) => {
    return setCookie(ACCESS_TOKEN_NAME, token);
  },
  remove: () => {
    return deleteCookie(ACCESS_TOKEN_NAME);
  },
};

export const refreshToken = {
  get: () => {
    return getCookie(REFRESH_TOKEN_NAME);
  },
  set: (token) => {
    return setCookie(REFRESH_TOKEN_NAME, token);
  },
  remove: () => {
    return deleteCookie(REFRESH_TOKEN_NAME);
  },
};
