import axios from "axios";

const api = axios.create({
  baseURL: "https://securefiletransfer-0kub.onrender.com/api", // backend URL
  timeout: 15000,
});

// --- ✅ NEW: Load token from localStorage on startup
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// --- Function to set or remove Authorization header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token); // ✅ persist token
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Optional: intercept requests for debugging
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
