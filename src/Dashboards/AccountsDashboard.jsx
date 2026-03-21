import React from "react";
import "./AdminDashboard.css";

export default function AccountsDashboard({ onLogout }) {
    return (
        <div className="dashboard-container">

            <div className="dashboard-header">

                <div className="header-left">
                    <img src="/logo.png" alt="Logo" className="header-logo" />

                    <div className="header-title">
                        <h1>SARVODAYA GROUP OF INSTITUTIONS</h1>
                        <div className="header-subtitle">Accounts Dashboard</div>
                    </div>
                </div>

                <div className="header-right">
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>

            </div>

            <div className="dashboard-content">
                <h2>Accounts Dashboard</h2>
            </div>

        </div>
    );
}