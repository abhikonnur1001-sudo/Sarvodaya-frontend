import React, { useState } from "react";
import "../Admin/AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authService";
import NewCollection from "./NewCollection";
import UpdateCollection from "./UpdateCollection";

const name = sessionStorage.getItem("name");

const AccountsDashboard = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="dashboard-container">

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
                        <span>{name}</span>
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-main">

                <div className="dashboard-sidebar">
                    <div className="sidebar-menu">

                        <div className="menu-dropdown">
                            <button className="menu-btn">Fee Collection</button>
                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("newCollection")}>New Collection</button>
                                <button onClick={() => setActivePage("updateCollection")}>Update Fee</button>
                                <button onClick={() => setActivePage("additionalCollection")}>Additional Collection</button>
                            </div>
                        </div>

                        <div className="menu-dropdown">
                            <button className="menu-btn">Student Dues</button>
                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("pendingDues")}>Pending</button>
                                <button onClick={() => setActivePage("overdueDues")}>Overdue</button>
                            </div>
                        </div>

                        <div className="menu-dropdown">
                            <button className="menu-btn">Receipts</button>
                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("generateReceipt")}>Generate</button>
                                <button onClick={() => setActivePage("receiptHistory")}>History</button>
                            </div>
                        </div>

                        <div className="menu-dropdown">
                            <button className="menu-btn">Reports</button>
                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("dailyReport")}>Daily</button>
                                <button onClick={() => setActivePage("monthlyReport")}>Monthly</button>
                            </div>
                        </div>

                        <button
                            className="sidebar-item"
                            onClick={() => setActivePage("dashboard")}
                        >
                            Dashboard
                        </button>

                        <div className="menu-dropdown">
                            <button className="menu-btn">Settings</button>
                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("profile")}>Profile</button>
                                <button onClick={() => setActivePage("system")}>System</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">

                    {activePage === "dashboard" && (
                        <>
                            <div className="stats-row">
                                <div className="stat-card">
                                    <div className="stat-label">Today Collection</div>
                                    <div className="stat-value">₹0</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Payments</div>
                                    <div className="stat-value">0</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Pending Dues</div>
                                    <div className="stat-value">₹0</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Receipts</div>
                                    <div className="stat-value">0</div>
                                </div>
                            </div>

                            <div className="content-grid">
                                <div className="notice-card">
                                    <div className="card-header">
                                        <h3>Collection Notices</h3>
                                    </div>
                                    <div className="notice-list">
                                        <div className="notice-item">
                                            <div className="notice-date">Today</div>
                                            <div>Fee collection summary will appear here.</div>
                                        </div>
                                        <div className="notice-item">
                                            <div className="notice-date">Info</div>
                                            <div>Pending dues and reminders can be shown here.</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-card">
                                    <div className="card-header">
                                        <h3>Collection Chart</h3>
                                    </div>
                                    <div className="chart-placeholder">
                                        <div className="chart-line">
                                            <div className="chart-bar" style={{ height: "35%" }}></div>
                                            <div className="chart-bar" style={{ height: "60%" }}></div>
                                            <div className="chart-bar" style={{ height: "45%" }}></div>
                                            <div className="chart-bar" style={{ height: "70%" }}></div>
                                        </div>
                                        <div className="chart-labels">
                                            <div>Jan</div>
                                            <div>Feb</div>
                                            <div>Mar</div>
                                            <div>Apr</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activePage === "newCollection" && <NewCollection />}
                    {activePage === "updateCollection" && <UpdateCollection />}
                    {activePage === "additionalCollection" && <h2>Additional Collection</h2>}
                    {activePage === "pendingDues" && <h2>Pending Dues</h2>}
                    {activePage === "overdueDues" && <h2>Overdue Dues</h2>}
                    {activePage === "generateReceipt" && <h2>Generate Receipt</h2>}
                    {activePage === "receiptHistory" && <h2>Receipt History</h2>}
                    {activePage === "dailyReport" && <h2>Daily Report</h2>}
                    {activePage === "monthlyReport" && <h2>Monthly Report</h2>}
                    {activePage === "profile" && <h2>Profile</h2>}
                    {activePage === "system" && <h2>System Settings</h2>}
                </div>
            </div>
        </div>
    );
};

export default AccountsDashboard;