import axios from "axios";
export const api = axios.create({
    baseURL:"https://sarvodaya-erp-api-hhb5dmddhjbrfpg0.centralindia-01.azurewebsites.net/api"  
});

// Automatically attach token for every request//https://sarvodaya-erp-api-hhb5dmddhjbrfpg0.centralindia-01.azurewebsites.net/api //
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