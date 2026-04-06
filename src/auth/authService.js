import { api } from "../api";
import { jwtDecode } from "jwt-decode";

export async function login(username, password) {
    const response = await api.post("/auth/login", {
        username,
        password
    });

    const { token, user, schoolName } = response.data;

    // Decode JWT (optional, keep if you want)
    const decoded = jwtDecode(token);

    const role =
        decoded.role ??
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // 🔥 STORE EVERYTHING
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);

    // ✅ ADD THESE (IMPORTANT)
    sessionStorage.setItem("name", user.fullName);
    sessionStorage.setItem("school", schoolName);

    // Axios header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return role;
}

export function logout() {
    sessionStorage.clear();
    delete api.defaults.headers.common["Authorization"];
}

export function isLoggedIn() {
    return !!sessionStorage.getItem("token");
}

export function getRole() {
    return sessionStorage.getItem("role");
}