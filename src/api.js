import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("API URL:", API_BASE_URL);

export const api = axios.create({
    //baseURL:"https://sarvodaya-erp-api-hhb5dmddhjbrfpg0.centralindia-01.azurewebsites.net/api",
    baseURL: API_BASE_URL
});

// Automatically attach token for every request
api.interceptors.request.use((config) => {
     const token = sessionStorage.getItem("token");
     if (token) {
         config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
});
// Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401) {
            sessionStorage.clear();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);