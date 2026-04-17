import React, { useState } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authService";
import AddUser from "./AddUser";
import AddSchool from "./School";
import AddClass from "./AddClass";
import StockManagement from "./Stock/StockManagement";
import FeeAssign from "./FeeAssign";
import UserList from "./UserList";
import StudentTypes from "./StudentType";
import AdditionalFeeManager from "./AdditionalFeeManager";
const name = sessionStorage.getItem("name");


const AdminDashboard = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const navigate = useNavigate();


    // 🔥 FIXED LOGOUT
    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="dashboard-container">

            {/* HEADER */}
            <div className="dashboard-header">

                <div className="header-left">
                    <img src="/logo.png" alt="Logo" className="header-logo" />

                    <div className="header-title">
                        <h1>SARVODAYA GROUP OF INSTITUTIONS</h1>
                        <div className="header-subtitle">Administrator</div>
                    </div>
                </div>

                <div className="header-right">
                    <div className="header-profile">
                        <img src="/profile.jpg" alt="Profile" className="profile-img" />
                        <span>
                            {name}
                        </span>
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-main">

                {/* SIDEBAR */}
                <div className="dashboard-sidebar">

                    <div className="sidebar-menu">

                        {/* MANAGE USERS */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">Manage Users</button>

                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("addUser")}>Add User</button>
                                <button onClick={() => setActivePage("userlist")}>Users</button>
                            </div>
                        </div>

                        {/* SYSTEM MANAGEMENT */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">System Management</button>

                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("addSchool")}>Add School</button>
                                <button onClick={() => setActivePage("addClass")}>Add Classes</button>
                                <button onClick={() => setActivePage("student-types")}>Add StudentTypes</button>
                                <button onClick={() => setActivePage("feeAssign")}>Fee Assign</button>
                                <button onClick={() => setActivePage("additionalFee")}>Additional Fees</button>
                                <button onClick={() => setActivePage("stockAssign")}>Stock Assign</button>
                            </div>
                        </div>

                        {/* VIEW */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">View</button>

                            <div className="dropdown-content">
                                <button>Reports</button>
                                <button>Student Database</button>
                                <button>Employee Database</button>
                                <button>Bank Accounts</button>
                            </div>
                        </div>

                        {/* WARNINGS */}
                        <button
                            className="sidebar-item"
                            onClick={() => setActivePage("dashboard")}
                        >
                            Dashboard
                        </button>

                        {/* SETTINGS */}
                        <div className="menu-dropdown">
                            <button className="menu-btn">System Settings</button>

                            <div className="dropdown-content">
                                <button>Database Alteration</button>
                                <button>Database Maintenance</button>
                                <button>Database Backup</button>
                                <button>Soft PowerOff</button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* CONTENT */}
                <div className="dashboard-content">

                    {/* DASHBOARD */}
                    {activePage === "dashboard" && (
                        <>
                            <div className="stats-row">

                                <div className="stat-card">
                                    <div className="stat-label">Students</div>
                                    <div className="stat-value">2,450</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Teachers</div>
                                    <div className="stat-value">185</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Today's Attendance</div>
                                    <div className="stat-value">94%</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-label">Fees Collected</div>
                                    <div className="stat-value">$15M</div>
                                </div>

                            </div>

                            <div className="content-grid">

                                <div className="notice-card">
                                    <div className="card-header">
                                        <h3>Notice Board</h3>
                                    </div>

                                    <div className="notice-list">
                                        <div className="notice-item">
                                            <div className="notice-date">Mar 08</div>
                                            <div>Updating Mid Exams Schedule</div>
                                        </div>

                                        <div className="notice-item">
                                            <div className="notice-date">Mar 07</div>
                                            <div>New Library Resource Policy</div>
                                        </div>

                                        <div className="notice-item">
                                            <div className="notice-date">Mar 06</div>
                                            <div>New Library Resource Policy</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-card">
                                    <div className="card-header">
                                        <h3>Performance Chart</h3>
                                    </div>

                                    <div className="chart-placeholder">
                                        <div className="chart-line">
                                            <div className="chart-bar" style={{ height: "60%" }}></div>
                                            <div className="chart-bar" style={{ height: "75%" }}></div>
                                            <div className="chart-bar" style={{ height: "85%" }}></div>
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

                    {/* PAGES */}
                    {activePage === "addUser" && <AddUser goBack={() => setActivePage("dashboard")} />}
                    {activePage === "addSchool" && <AddSchool goBack={() => setActivePage("dashboard")} />}
                    {activePage === "addClass" && <AddClass goBack={() => setActivePage("dashboard")} />}
                    {activePage === "feeAssign" && <FeeAssign goBack={() => setActivePage("dashboard")} />}
                    {activePage === "additionalFee" && <AdditionalFeeManager userRole="Administrator" goBack={() => setActivePage("dashboard")} />}
                    {activePage === "userlist" && <UserList goBack={() => setActivePage("dashboard")} />}
                    {activePage === "student-types" && <StudentTypes goBack={() =>setActivePage("dashboard")} />}
                    {activePage === "stockAssign" && <StockManagement goBack={() => setActivePage("dashboard")} />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;