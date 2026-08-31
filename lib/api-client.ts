import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://payment-saas.onrender.com/api/v1', // Assuming the API is proxied or hosted at this base path
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Some endpoints might require x-www-form-urlencoded
      // We will let the service layer override Content-Type if needed
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If a 401 occurs and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh endpoint. Using base axios to avoid infinite loops if it fails with 401.
        const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        }, {
           headers: { Authorization: `Bearer ${refreshToken}` } // Passing both ways as it's common
        });

        // Assuming the response returns tokens like { accessToken, refreshToken }
        const newAccessToken = res.data.accessToken || res.data.token;
        const newRefreshToken = res.data.refreshToken || refreshToken;

        if (newAccessToken) {
          document.cookie = `accessToken=${newAccessToken}; path=/; max-age=3600; Secure; SameSite=Lax`;
          localStorage.setItem('accessToken', newAccessToken);
          
          if (newRefreshToken) {
             document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; Secure; SameSite=Lax`;
             localStorage.setItem('refreshToken', newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
