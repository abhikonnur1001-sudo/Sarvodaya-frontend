import React, { useState } from "react";
import "./HeadMasterDashboard.css";
import NewStudentDetails from "../Admission/NewStudentDetails";
import DeleteStudent from "../Admission/DeleteStudent";
import OldStudentEnrollment from "../Admission/OldStudentEnrollment";
import EnrollmentForm from "../Admission/EnrollmentForm";

const HeadmasterDashboard = ({ onLogout }) => {

    const [activePage, setActivePage] = useState("dashboard");

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <img src="/logo.png" alt="School Logo" className="logo" />
                    <div className="school-name">
                        SARVODAYA GROUP OF INSTITUTIONS
                        <div className="role-label">Headmaster</div>
                    </div>
                </div>

                <div className="header-right">
                    <div className="user-profile">
                        <img src="/avatar.png" alt="Profile" className="profile-avatar" />
                        <span>David Headmaster</span>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-body">

                {/* Sidebar */}
                <div className="dashboard-sidebar">
                    <nav className="sidebar-nav">

                        <div className="nav-item dropdown-container">
                            <a href="#" className="nav-link">Admission</a>

                            <ul className="dropdown-menu">
                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={() => setActivePage("newStudent")}
                                >
                                    New Student
                                </a>

                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={() => setActivePage("oldStudent")}
                                >
                                    Old Student
                                </a>

                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={() => setActivePage("updateStudent")}
                                >
                                    Update Student
                                </a>

                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActivePage("removeStudent");
                                    }}
                                >
                                    Remove Student
                                </a>
                            </ul>
                        </div>

                        <a href="#" className="nav-item">Staff Overview</a>
                        <a href="#" className="nav-item">Student Performance</a>
                        <a href="#" className="nav-item">Notices</a>
                        <a href="#" className="nav-item">Timetable</a>

                    </nav>
                </div>

                {/* Main Content */}
                <div className="dashboard-content">

                    {/* 🏠 Dashboard */}
                    {activePage === "dashboard" && (
                        <div className="content-grid">
                            <div className="overview-card">
                                <h3>Today's Overview</h3>
                                <div className="stats-row">
                                    <div className="stat-box">
                                        <div className="stat-number">950</div>
                                        <div className="stat-label">Present Students</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-number">50</div>
                                        <div className="stat-label">Absent Students</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-number">45</div>
                                        <div className="stat-label">Staff Present</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✅ NEW STUDENT */}
                    {activePage === "newStudent" && (
                        <NewStudentDetails setActivePage={setActivePage} />
                    )}

                    {/* OLD STUDENT */}
                    {activePage === "oldStudent" && <OldStudentEnrollment />}

                    {/* DELETE */}
                    {activePage === "removeStudent" && <DeleteStudent />}

                    {/* 🔥 IMPORTANT: HANDLE OBJECT STATE */}
                    {typeof activePage === "object" && activePage.page === "enrollment" && (
                        <EnrollmentForm
                            studentId={activePage.studentId}   // 🔥 receive ID
                            setActivePage={setActivePage}
                        />
                    )}

                </div>

            </div>
        </div>
    );
};

export default HeadmasterDashboard;