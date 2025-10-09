import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "https://securefiletransfer-0kub.onrender.com/api", // adjust to your backend URL
  timeout: 15000,
});
//https://securefiletransfer-0kub.onrender.com
// Function to set or remove Authorization header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Optional: intercept requests for debugging
api.interceptors.request.use(
  (config) => {
    // console.log("Request:", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: intercept responses for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
