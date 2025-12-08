import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
  // 304 Not Modified ni muvaffaqiyatli status deb qabul qilish
  validateStatus: (status) => {
    return (status >= 200 && status < 300) || status === 304;
  }
});

// Request interceptor - add auth token to headers
axiosWrapper.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors globally
axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem("authToken");
      // Don't redirect on auth pages - let user login
      const authPaths = ['/', '/auth'];
      if (!authPaths.includes(window.location.pathname)) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);
