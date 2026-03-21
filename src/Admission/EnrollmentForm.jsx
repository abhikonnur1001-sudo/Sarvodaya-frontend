import React, { useState, useEffect } from "react";
import "./EnrollmentForm.css";
import { api } from "../api";

const EnrollmentForm = ({ setActivePage, studentId }) => {

    const [formData, setFormData] = useState({
        studentId: "",
        academicYearId: "",
        schoolId: "",
        classId: "",
        studentTypeId: ""
    });

    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [studentTypes, setStudentTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [school, setSchool] = useState(null); // 🔥 HM school

    // 🔥 LOAD BASIC DROPDOWNS (NO SCHOOLS NOW)
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [yearsRes, typesRes] = await Promise.all([
                    api.get("/academicyears"),
                    api.get("/student-types")
                ]);

                setAcademicYears(yearsRes.data);
                const activeYear = yearsRes.data.find(y => y.isActive);

                if (activeYear) {
                    setFormData(prev => ({
                        ...prev,
                        academicYearId: activeYear.id
                    }));
                }
                setStudentTypes(typesRes.data);

            } catch (error) {
                console.error("Failed to load dropdowns:", error);
            }
        };

        fetchDropdowns();
    }, []);

    // 🔥 FETCH HM SCHOOL + CLASSES
    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const res = await api.get("/schools/my-school");

                setSchool(res.data);

                // auto assign schoolId
                setFormData(prev => ({
                    ...prev,
                    schoolId: res.data.id
                }));

                // load classes for this school
                const classRes = await api.get(`/classes/by-school/${res.data.id}`);
                setClasses(classRes.data);

            } catch (err) {
                console.error("Failed to load HM school", err);
            }
        };

        fetchSchool();
    }, []);

    // 🔥 AUTO SET STUDENT ID
    useEffect(() => {
        if (studentId) {
            setFormData(prev => ({
                ...prev,
                studentId: studentId
            }));
        }
    }, [studentId]);

    // 🔥 FETCH STUDENT DETAILS
    useEffect(() => {
        if (!studentId) return;

        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${studentId}`);
                setStudentDetails(res.data);
            } catch (err) {
                console.error("Failed to fetch student:", err);
            }
        };

        fetchStudent();
    }, [studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.academicYearId || !formData.classId || !formData.studentTypeId) {
            setNotification({
                type: "error",
                message: "Please fill all required fields"
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                studentId: Number(formData.studentId),
                academicYearId: Number(formData.academicYearId),
                schoolId: Number(formData.schoolId),
                classId: Number(formData.classId),
                studentTypeId: Number(formData.studentTypeId)
            };

            await api.post("/enrollments", payload);

            setNotification({
                type: "success",
                message: "Student enrolled successfully ✓"
            });

            setTimeout(() => {
                setNotification(null);
                setActivePage("dashboard");
            }, 2000);

        } catch (error) {
            console.error(error);

            setNotification({
    
                const errorMessage =
                    error.response?.data?.message || "Enrollment failed";

                setNotification({
                    type: "error",
                    message: errorMessage
                });
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enroll-container">

            {/* Header */}
            <div className="enroll-header">
                <div>
                    <h2 className="enroll-title">Student Enrollment</h2>
                    <p className="enroll-subtitle">Fill in the details to enroll a student</p>
                </div>
                <div className="enroll-badge">Status: <span>Pending</span></div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`enroll-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Student & Year */}
                <div className="enroll-card">
                    <div className="enroll-card-title">🎓 Student & Year</div>

                    <div className="enroll-row-two">

                        <div className="enroll-field">
                            <label>Student</label>
                            <div className="info-box">
                                {studentDetails ? (
                                    <>
                                        <strong>
                                            {studentDetails.firstName}{" "}
                                            {studentDetails.middleName || ""}{" "}
                                            {studentDetails.lastName}
                                        </strong>
                                        <br />
                                        <strong>ID: {studentId}</strong>
                                        <br />
                                        DOB:{" "}
                                        {new Date(studentDetails.dateOfBirth)
                                            .toLocaleDateString("en-GB")}
                                    </>
                                ) : "Loading student..."}
                            </div>
                        </div>

                        <div className="enroll-field">
                            <label>Academic Year *</label>
                            <select
                                name="academicYearId"
                                value={formData.academicYearId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Academic Year</option>
                                {academicYears.map((y) => (
                                    <option key={y.id} value={y.id}>{y.name}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                {/* School & Class */}
                <div className="enroll-card">
                    <div className="enroll-card-title">🏫 School & Class</div>

                    <div className="enroll-row-three">

                        {/* 🔥 AUTO SCHOOL DISPLAY */}
                        <div className="enroll-field">
                            <label>School</label>
                            <div className="info-box">
                                {school ? school.name : "Loading school..."}
                            </div>
                        </div>

                        <div className="enroll-field">
                            <label>Class *</label>
                            <select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.classCode}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="enroll-field">
                            <label>Student Type *</label>
                            <select
                                name="studentTypeId"
                                value={formData.studentTypeId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Type</option>
                                {studentTypes.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                {/* Buttons */}
                <div className="enroll-actions">
                    <button
                        type="button"
                        className="enroll-back-btn"
                        onClick={() => setActivePage("newStudent")}
                    >
                        ← Back
                    </button>

                    <button
                        type="submit"
                        className="enroll-confirm-btn"
                        disabled={loading}
                    >
                        {loading ? "Enrolling..." : "✅ Confirm Enrollment"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EnrollmentForm;