import { useState } from "react";
import Login from "./auth/Login";
import { isLoggedIn, getRole, logout } from "./auth/authService";


import AdminDashboard from "./dashboards/AdminDashboard";
import HeadMasterDashboard from "./dashboards/HeadMasterDashboard";
import AccountsDashboard from "./dashboards/AccountsDashboard";

function App() {
    const [loggedIn, setLoggedIn] = useState(isLoggedIn());
    const [role, setRole] = useState(getRole());

    if (!loggedIn) {
        return (
            <Login
                onLogin={(r) => {
                    setRole(r);
                    setLoggedIn(true);
                }}
            />
        );
    }

    const onLogout = () => {
        logout();
        setLoggedIn(false);
        setRole(null);
    };

    return (
        <>
            {role === "Administrator" && <AdminDashboard onLogout={onLogout} />}
            {role === "HeadMaster" && <HeadMasterDashboard onLogout={onLogout} />}
            {role === "Accounts" && <AccountsDashboard onLogout={onLogout} />}
        </>
    );
}

export default App;