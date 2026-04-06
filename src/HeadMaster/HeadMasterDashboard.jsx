import React, { useState } from "react";
import "./HeadMasterDashboard.css";

import NewStudentDetails from "./Admission/NewStudentDetails";
import DeleteStudent from "./Admission/DeleteStudent";
import OldStudentEnrollment from "./Admission/OldStudentEnrollment";
import EnrollmentForm from "./Admission/EnrollmentForm";
import StudentList from "./Admission/StudentList";
import StudentPage from "./Admission/StudentPage";
import UpdateStudent from "./Admission/UpdateStudent";
import UpdateAdditionalFee from "./Admission/UpdateAdditionalFee";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authService";

const school = sessionStorage.getItem("school");
const name = sessionStorage.getItem("name");

const HeadmasterDashboard = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [pageProps, setPageProps] = useState({});       // ✅ stores studentId etc.
    const navigate = useNavigate();

    // ✅ Unified navigation handler — pass to ALL child components
    const handleSetActivePage = (page, props = {}) => {
        setActivePage(page);
        setPageProps(props);
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="dashboard-container">

            {/* HEADER */}
            <div className="dashboard-header">
                <div className="header-left">
                    <img src="/logo.png" alt="School Logo" className="logo" />
                    <div className="school-name">
                        {school}
                        <div className="role-label">
                            Headmaster {school?.isTemporary && "(Acting)"}
                        </div>
                    </div>
                </div>

                <div className="header-right">
                    <div className="user-profile">
                        <img src="/avatar.png" alt="Profile" className="profile-avatar" />
                        <span>{name}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-body">

                {/* SIDEBAR */}
                <div className="dashboard-sidebar">
                    <div className="sidebar-menu">
                        <div className="menu-dropdown">
                            <button className="menu-btn">Admission</button>
                            <div className="dropdown-content">
                                <button onClick={() => handleSetActivePage("newStudent")}>
                                    New Student
                                </button>
                                <button onClick={() => handleSetActivePage("oldStudent")}>
                                    Old Student
                                </button>
                                <button onClick={() => handleSetActivePage("updateStudent")}>
                                    Update Student
                                </button>
                                <button onClick={() => handleSetActivePage("removeStudent")}>
                                    Remove Student
                                </button>
                            </div>
                        </div>
                        <div className="menu-dropdown">
                            <button className="menu-btn">Overview</button>
                            <div className="dropdown-content">
                                <button onClick={() => handleSetActivePage("students")}>
                                    Students
                                </button>
                                <button onClick={() => handleSetActivePage("enrollments")}>
                                    Enrollments
                                </button>
                                <button onClick={() => handleSetActivePage("Classes")}>
                                    Classes
                                </button>
                                <button onClick={() => handleSetActivePage("Staffs")}>
                                    Staffs
                                </button>
                            </div>
                        </div>
                        <button className="menu-btn">Student Performance</button>
                        <button className="menu-btn">Notices</button>
                        <button className="menu-btn">Timetable</button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="dashboard-content">

                    {/* DASHBOARD */}
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

                    {/* NEW STUDENT */}
                    {activePage === "newStudent" && (
                        <NewStudentDetails setActivePage={handleSetActivePage} />
                    )}

                    {/* OLD STUDENT */}
                    {activePage === "oldStudent" && (
                        <OldStudentEnrollment setActivePage={handleSetActivePage} />
                    )}

                    {/* DELETE STUDENT */}
                    {activePage === "removeStudent" && (
                        <DeleteStudent setActivePage={handleSetActivePage} />
                    )}
                    {activePage === "updateStudent" && (
                        <UpdateStudent setActivePage={handleSetActivePage} />
                    )}

                    {/* ENROLLMENT FORM ✅ Fixed — activePage is a string, studentId from pageProps */}
                    {activePage === "enrollment" && (
                        <EnrollmentForm
                            studentId={pageProps.studentId}
                            setActivePage={handleSetActivePage}
                        />
                    )}
                    {activePage === "enrollments" && (
                        <StudentList setActivePage={handleSetActivePage} />
                    )}
                    {activePage === "students" && (
                        <StudentPage setActivePage={handleSetActivePage} />
                    )}

                </div>
            </div>
        </div>
    );
};

export default HeadmasterDashboard;