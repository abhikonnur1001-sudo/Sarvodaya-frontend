import { useState, useEffect } from "react";
import "./FacultyDashboard.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authService";
import { api } from "../api";
import IssueMaterial from "../shared/IssueMaterial";

const name = sessionStorage.getItem("name");

export default function FacultyDashboard() {
    const [activePage, setActivePage] = useState("dashboard");
    const [stockItems, setStockItems] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        // Get faculty's assigned categories
        api.get("/stock/my-assignments")
            .then(r => setAssignments(r.data))
            .catch(() => { });

        // Get all stock
        api.get("/stock/all")
            .then(r => setStockItems(r.data))
            .catch(() => { });
    }, []);

    // Filter stock to only assigned categories
    const assignedCategories = assignments.map(a => a.categoryName);
    const facultyStockItems = stockItems.filter(i =>
        assignedCategories.includes(i.categoryName)
    );

    return (
        <div className="dashboard-container">

            {/* HEADER */}
            <div className="dashboard-header">
                <div className="header-left">
                    <img src="/logo.png" alt="Logo" className="logo" />
                    <div className="school-name">
                        SARVODAYA GROUP OF INSTITUTIONS
                        <div className="role-label">Faculty</div>
                    </div>
                </div>
                <div className="header-right">
                    <div className="user-profile">
                        <img src="/avatar.png" alt="Profile" className="profile-avatar" />
                        <span>{name}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="dashboard-body">

                {/* SIDEBAR */}
                <div className="dashboard-sidebar">
                    <div className="sidebar-menu">

                        <button
                            className={`menu-btn ${activePage === "dashboard" ? "menu-btn-active" : ""}`}
                            onClick={() => setActivePage("dashboard")}>
                            🏠 Dashboard
                        </button>

                        <div className="menu-dropdown">
                            <button className="menu-btn">📦 Stock</button>
                            <div className="dropdown-content">
                                <button onClick={() => setActivePage("myAssignments")}>
                                    📋 My Assignments
                                </button>
                                <button onClick={() => setActivePage("issueMaterial")}>
                                    📤 Issue Material
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* CONTENT */}
                <div className="dashboard-content">

                    {/* DASHBOARD HOME */}
                    {activePage === "dashboard" && (
                        <div className="content-grid">
                            <div className="overview-card">
                                <h3>Welcome, {name} 👋</h3>
                                <div className="stats-row">
                                    <div className="stat-box">
                                        <div className="stat-number">{assignments.length}</div>
                                        <div className="stat-label">Assigned Categories</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-number">{facultyStockItems.length}</div>
                                        <div className="stat-label">Available Stock Items</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-number">
                                            {facultyStockItems.filter(i => i.quantity <= 5).length}
                                        </div>
                                        <div className="stat-label stat-label-warn">Low Stock Items</div>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Categories Card */}
                            {assignments.length > 0 && (
                                <div className="overview-card">
                                    <h3>My Assigned Categories</h3>
                                    <div className="fac-category-grid">
                                        {assignments.map((a, i) => (
                                            <div key={i} className="fac-category-card">
                                                <span className="fac-cat-icon">📦</span>
                                                <span className="fac-cat-name">{a.categoryName}</span>
                                                <span className="fac-cat-count">
                                                    {stockItems.filter(s => s.categoryName === a.categoryName).length} items
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MY ASSIGNMENTS */}
                    {activePage === "myAssignments" && (
                        <div className="fac-page-wrap">
                            <div className="fac-page-header">
                                <div>
                                    <h2 className="fac-page-title">My Assignments</h2>
                                    <p className="fac-page-subtitle">Categories assigned to you for stock management</p>
                                </div>
                                <button className="fac-back-btn" onClick={() => setActivePage("dashboard")}>← Back</button>
                            </div>

                            {assignments.length === 0 ? (
                                <div className="fac-empty">No categories assigned yet.</div>
                            ) : (
                                <div className="fac-assignments-wrap">
                                    {assignments.map((a, i) => {
                                        const catItems = stockItems.filter(s => s.categoryName === a.categoryName);
                                        return (
                                            <div key={i} className="fac-assign-card">
                                                <div className="fac-assign-header">
                                                    <span className="sm-cat-badge">📦 {a.categoryName}</span>
                                                    <span className="fac-item-count">{catItems.length} items</span>
                                                </div>
                                                {catItems.length > 0 && (
                                                    <table className="sm-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Stock ID</th>
                                                                <th>Item Name</th>
                                                                <th>Available Qty</th>
                                                                <th>Academic Year</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {catItems.map(item => (
                                                                <tr key={item.stockItemId}>
                                                                    <td><span className="sm-id-badge">{item.stockItemId}</span></td>
                                                                    <td>{item.itemName}</td>
                                                                    <td className={item.quantity <= 5 ? "sm-low-qty" : ""}>
                                                                        {item.quantity}
                                                                        {item.quantity <= 5 && <span className="fac-low-tag"> ⚠️ Low</span>}
                                                                    </td>
                                                                    <td>{item.academicYear}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ISSUE MATERIAL */}
                    {activePage === "issueMaterial" && (
                        <div className="fac-page-wrap">
                            <div className="fac-page-header">
                                <div>
                                    <h2 className="fac-page-title">Issue Material</h2>
                                    <p className="fac-page-subtitle">Issue stock items to students from your assigned categories</p>
                                </div>
                                <button className="fac-back-btn" onClick={() => setActivePage("dashboard")}>← Back</button>
                            </div>
                            {/* Reuses shared component — filtered to faculty's categories only */}
                            <IssueMaterial stockItems={facultyStockItems} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}