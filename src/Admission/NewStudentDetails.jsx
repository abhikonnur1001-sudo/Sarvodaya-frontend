import React, { useState } from "react";
import "./NewStudentDetails.css";
import { api } from "../api";

const NewStudentDetails = ({ setActivePage }) => {

    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        gender: "",
        fatherName: "",
        motherName: "",
        guardianPhone: "",
        guardianEmail: "",
        addressLine1: "",
        pincode: ""
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // 🔥 NEW STATES
    const [studentSaved, setStudentSaved] = useState(false);
    const [savedStudentId, setSavedStudentId] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                gender: parseInt(formData.gender),
                dateOfBirth: formData.dob,
                addressLine1: formData.addressLine1,
                pincode: formData.pincode,
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                phone: formData.guardianPhone
            };

            const res = await api.post("/students", payload);

            // ✅ STORE STUDENT ID
            setSavedStudentId(res.data.id);
            setStudentSaved(true);

            // 🔥 HANDLE DUPLICATE VS NEW
            if (res.data.alreadyExists) {
                setNotification({
                    type: "warning",
                    message: res.data.message
                });
            } else {
                setNotification({
                    type: "success",
                    message: res.data.message
                });
            }

            // optional: auto clear
            setTimeout(() => setNotification(null), 3000);

        } catch (error) {
            console.error(error);

            const errorMessage =
                error.response?.data?.message || "Failed to create student";

            setNotification({
                type: "error",
                message: errorMessage
            });

        } finally {
            setLoading(false);
        }
    };

    // 🔥 FIXED LOGIC
    const handleProceedToEnroll = () => {

        if (!studentSaved) {
            alert("Please save student first");
            return;
        }

        if (typeof setActivePage === "function") {
            setActivePage({
                page: "enrollment",
                studentId: savedStudentId   // 🔥 pass student id
            });
        } else {
            console.error("setActivePage not available");
        }
    };

    const handleCancel = () => {
        if (typeof setActivePage === "function") {
            setActivePage("dashboard");
        }
    };

    return (
        <div className="student-form-container">

            <h2 className="page-title">New Student Registration</h2>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Student Section */}
                <div className="form-section">
                    <div className="student-layout">

                        <div className="student-form">
                            <h3>Student Details</h3>

                            <div className="row-three">
                                <div className="input-group">
                                    <label>First Name *</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} required />
                                </div>

                                <div className="input-group">
                                    <label>Middle Name</label>
                                    <input name="middleName" value={formData.middleName} onChange={handleChange} />
                                </div>

                                <div className="input-group">
                                    <label>Last Name *</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="row-two">
                                <div className="input-group">
                                    <label>Date of Birth *</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                                </div>

                                <div className="input-group">
                                    <label>Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                                        <option value="">Select</option>
                                        <option value="0">Male</option>
                                        <option value="1">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="avatar-box">
                            <img src="/avatar.png" alt="student" />
                        </div>

                    </div>
                </div>

                {/* Parent + Address */}
                <div className="parent-address-row">

                    <div className="form-section">
                        <h3>Parent / Guardian Details</h3>

                        <div className="input-group">
                            <label>Father's Name</label>
                            <input name="fatherName" value={formData.fatherName} onChange={handleChange} />
                        </div>

                        <div className="input-group">
                            <label>Mother's Name</label>
                            <input name="motherName" value={formData.motherName} onChange={handleChange} />
                        </div>

                        <div className="input-group">
                            <label>Guardian Phone</label>
                            <div className="phone-group">
                                <span className="country-code">+91</span>
                                <input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Guardian Email</label>
                            <input name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Address Details</h3>

                        <div className="input-group">
                            <label>Address</label>
                            <textarea name="addressLine1" rows="6" value={formData.addressLine1} onChange={handleChange}></textarea>
                        </div>

                        <div className="input-group">
                            <label>Pincode</label>
                            <input name="pincode" value={formData.pincode} onChange={handleChange} />
                        </div>
                    </div>

                </div>

                {/* Buttons */}
                <div className="form-actions">

                    <div className="left-actions">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Cancel
                        </button>

                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save Student"}
                        </button>
                    </div>

                    {/* 🔥 ONLY SHOW AFTER SAVE */}
                    {studentSaved && (
                        <button
                            type="button"
                            className="proceed-to-enroll-btn"
                            onClick={handleProceedToEnroll}
                        >
                            Proceed to Enrollment →
                        </button>
                    )}

                </div>

            </form>

        </div>
    );
};

export default NewStudentDetails;