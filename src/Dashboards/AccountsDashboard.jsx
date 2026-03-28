import React, { useState } from "react";
import "./AdminDashboard.css"; // SAME CSS

// 👉 You will replace these with your real components
import CollectFee from "./CollectFee";
import Reports from "./Reports";

const AccountantDashboard = ({ onLogout }) => {
    const [activePage, setActivePage] = useState("dashboard");

    return (
        <div className="dashboard-container">

            {/* HEADER (Same as Admin) */}
            <div className="dashboard-header">

                <div className="header-left">
                    <img src="/logo.png" alt="Logo" className="header-logo" />

                    <div className="header-title">
                        <h1>SARVODAYA GROUP OF INSTITUTIONS</h1>
                        <div className="header-subtitle">Accountant</div>
                    </div>
                </div>

                <div className="header-right">
                    <div className="header-profile">
                        <img src="/profile.jpg" alt="Profile" className="profile-img" />
                        <div>Accountant</div>
                    </div>

                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>

            </div>

            <div className="dashboard-main">

                {/* SIDEBAR (Same Structure) */}
                <div className="dashboard-sidebar">

                    <div className="sidebar-menu">

                        {/* FEES */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">
                                Fee Management
                            </button>

                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("collectFee")}>
                                    Collect Fee
                                </button>

                                <button onClick={() => setActivePage("feeReports")}>
                                    Fee Reports
                                </button>
                            </div>
                        </div>

                        {/* STUDENTS */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">
                                Students
                            </button>

                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("viewStudents")}>
                                    View Students
                                </button>
                            </div>
                        </div>

                        {/* REPORTS */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">
                                Reports
                            </button>

                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("dailyReport")}>
                                    Daily Report
                                </button>

                                <button onClick={() => setActivePage("monthlyReport")}>
                                    Monthly Report
                                </button>
                            </div>
                        </div>

                        {/* SIMPLE BUTTON */}
                        <button className="sidebar-item">
                            Notifications
                        </button>

                    </div>
                </div>

                {/* CONTENT (Same Logic) */}
                <div className="dashboard-content">

                    {activePage === "dashboard" && (
                        <>
                            <div className="stats-row">

                                <div className="stat-card">
                                    <div className="stat-label">Total Fees</div>
                                    <div className="stat-value">₹10,00,000</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Today Collection</div>
                                    <div className="stat-value">₹25,000</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Pending Fees</div>
                                    <div className="stat-value">₹2,00,000</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Transactions</div>
                                    <div className="stat-value">120</div>
                                </div>

                            </div>
                        </>
                    )}

                    {activePage === "collectFee" && (
                        <CollectFee goBack={() => setActivePage("dashboard")} />
                    )}

                    {activePage === "feeReports" && (
                        <Reports goBack={() => setActivePage("dashboard")} />
                    )}

                    {activePage === "viewStudents" && (
                        <div>Student List Page</div>
                    )}

                    {activePage === "dailyReport" && (
                        <div>Daily Report Page</div>
                    )}

                    {activePage === "monthlyReport" && (
                        <div>Monthly Report Page</div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default AccountantDashboard;