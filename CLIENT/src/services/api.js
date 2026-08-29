import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
baseURL = baseURL.trim().replace(/\/+$/, "");

if (!baseURL.endsWith("/api")) {
  baseURL += "/api";
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
