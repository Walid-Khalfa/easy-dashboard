import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/config/serverApiConfig';
import { getCookie, setCookie, deleteCookie } from '@/auth/cookie';
import errorHandler from './errorHandler';
import successHandler from './successHandler';

// Token helper functions
const getToken = () => getCookie(ACCESS_TOKEN_NAME);
const getRefreshToken = () => getCookie(REFRESH_TOKEN_NAME);

const setToken = token => setCookie(ACCESS_TOKEN_NAME, token);
const setRefreshToken = token => setCookie(REFRESH_TOKEN_NAME, token);
const removeTokens = () => {
  deleteCookie(ACCESS_TOKEN_NAME);
  deleteCookie(REFRESH_TOKEN_NAME);
};

// Token refresh mutex to prevent race conditions
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = cb => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = token => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const onRefreshError = error => {
  refreshSubscribers.forEach(cb => cb(null, error));
  refreshSubscribers = [];
};

// Create axios instance with dynamic token handling
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    common: {
      [ACCESS_TOKEN_NAME]: getToken(),
    },
  },
});

// Response interceptor for token refresh with mutex
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If token expired and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token, err) => {
            if (err) {
              reject(err);
            } else {
              originalRequest.headers[ACCESS_TOKEN_NAME] = token;
              resolve(axiosInstance(originalRequest));
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}refresh`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data.result;

        setToken(token);
        setRefreshToken(newRefreshToken);

        // Notify all queued requests with the new token
        onTokenRefreshed(token);
        isRefreshing = false;

        originalRequest.headers[ACCESS_TOKEN_NAME] = token;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Notify all queued requests of the error
        onRefreshError(refreshError);
        isRefreshing = false;
        
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const getHeaders = () => ({
  [ACCESS_TOKEN_NAME]: getToken(),
});

const request = {
  create: async (entity, jsonData) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.post(entity + '/create', jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  read: async (entity, id) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.get(entity + '/read/' + id);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  update: async (entity, id, jsonData) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.patch(entity + '/update/' + id, jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  delete: async (entity, id, option = {}) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.delete(entity + '/delete/' + id);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  filter: async (entity, option = {}) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      let filter = option.filter ? 'filter=' + option.filter : '';
      let equal = option.equal ? '&equal=' + option.equal : '';
      let query = `?${filter}${equal}`;

      const response = await axiosInstance.get(entity + '/filter' + query);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  search: async (entity, source, option = {}) => {
    axiosInstance.defaults.headers = {
      [ACCESS_TOKEN_NAME]: getToken(),
    };
    try {
      let query = '';
      if (Object.keys(option).length > 0) {
        let fields = option.fields ? 'fields=' + option.fields : '';
        let question = option.question ? '&q=' + option.question : '';
        query = `?${fields}${question}`;
      }
      // headersInstance.cancelToken = source.token;
      const response = await axiosInstance.get(entity + '/search' + query, {
        cancelToken: source.token,
      });

      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  list: async (entity, option = {}) => {
    axiosInstance.defaults.headers = {
      [ACCESS_TOKEN_NAME]: getToken(),
    };
    try {
      let query = '';
      if (Object.keys(option).length > 0) {
        let page = option.page ? 'page=' + option.page : '';
        let items = option.items ? '&items=' + option.items : '';
        query = `?${page}${items}`;
      }

      const response = await axiosInstance.get(entity + '/list' + query);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  post: async (entityUrl, jsonData, option = {}) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.post(entityUrl, jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  get: async entityUrl => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.get(entityUrl);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  patch: async (entityUrl, jsonData) => {
    axiosInstance.defaults.headers = {
      ...getHeaders(),
    };
    try {
      const response = await axiosInstance.patch(entityUrl, jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  source: () => {
    // const CancelToken = await axiosInstance.CancelToken;

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    return source;
  },
};
export default request;
