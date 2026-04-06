import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./auth/Login";
import { isLoggedIn, logout } from "./auth/authService";
import { exitFullscreen } from "./utils/fullscreen";

import AdminDashboard from "./Admin/AdminDashboard";
import HeadMasterDashboard from "./HeadMaster/HeadMasterDashboard";
import AccountsDashboard from "./Accountant/AccountsDashboard";

// 🔒 Protected Route
const ProtectedRoute = ({ children }) => {
    return isLoggedIn() ? children : <Navigate to="/login" />;
};
const handleLogout = async () => {
    await exitFullscreen();
    logout();
};
function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* LOGIN */}
                <Route path="/login" element={<Login />} />

                {/* DASHBOARDS */}
                <Route
                    path="/administrator"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/headmaster"
                    element={
                        <ProtectedRoute>
                            <HeadMasterDashboard onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/accounts"
                    element={
                        <ProtectedRoute>
                            <AccountsDashboard onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* DEFAULT */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;