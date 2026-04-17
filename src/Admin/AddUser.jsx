import React, { useState } from "react";
import { api } from "../api";
import "./AddUser.css";

const ROLES = [
    { value: "0", label: "Administrator", icon: "🛡️" },
    { value: "1", label: "HeadMaster", icon: "🏫" },
    { value: "3", label: "Faculty", icon: "👨‍🏫" },
    { value: "2", label: "Accountant", icon: "💼" },
];

const AddUser = ({ goBack }) => {
    const [formData, setFormData] = useState({
        username: "", password: "", fullName: "", phoneNumber: "",
        email: "", confirmEmail: "", address: "", dateOfBirth: "", role: "",
    });
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const validate = () => {
        const newErrors = {};

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = "Enter a valid email address.";
        }

        // Confirm email match
        if (formData.email && formData.confirmEmail !== formData.email) {
            newErrors.confirmEmail = "Emails do not match.";
        }

        // Phone — 10 digits, starts with 6-9
        const phoneRegex = /^[6-9]\d{9}$/;
        if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Enter a valid 10-digit Indian mobile number.";
        }

        // Password min length
        if (formData.password && formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return; // ✅ stop if validation fails

        setLoading(true);
        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                address: formData.address,
                dateOfBirth: formData.dateOfBirth,
                role: Number(formData.role),
            };
            const response = await api.post("/auth/create-user", payload);
            notify("success", response.data.message || "User created successfully.");
            setFormData({
                username: "", password: "", fullName: "", phoneNumber: "",
                email: "", confirmEmail: "", address: "", dateOfBirth: "", role: ""
            });
            setErrors({});
        } catch (error) {
            notify("error", error?.response?.data || "Failed to create user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="au-container">

            {/* Page Header */}
            <div className="au-page-header">
                <div>
                    <h2 className="au-page-title">Add New User</h2>
                    <p className="au-page-subtitle">Create a new staff account and assign a role</p>
                </div>
                <button className="au-back-btn" onClick={goBack}>← Back</button>
            </div>

            {notification && (
                <div className={`au-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            <div className="au-card">
                <form className="au-form" onSubmit={handleSubmit}>

                    {/* Account Credentials */}
                    <div className="au-section-label">🔐 Account Credentials</div>
                    <div className="au-form-row">
                        <div className="au-field">
                            <label>Username <span className="req">*</span></label>
                            <input type="text" name="username" placeholder="e.g. john.doe"
                                value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="au-field">
                            <label>Password <span className="req">*</span></label>
                            <div className="au-password-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? "au-input-error" : ""}
                                    required />
                                <button type="button" className="au-toggle-pw"
                                    onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {errors.password && <small className="au-field-error">⚠️ {errors.password}</small>}
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="au-section-label">👤 Personal Information</div>
                    <div className="au-form-row">
                        <div className="au-field au-field-wide">
                            <label>Full Name <span className="req">*</span></label>
                            <input type="text" name="fullName" placeholder="e.g. John Michael Doe"
                                value={formData.fullName} onChange={handleChange} required />
                        </div>
                        <div className="au-field">
                            <label>Date of Birth</label>
                            <input type="date" name="dateOfBirth"
                                value={formData.dateOfBirth} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="au-form-row">
                        <div className="au-field">
                            <label>Phone Number</label>
                            <input
                                type="text" name="phoneNumber"
                                placeholder="e.g. 9876543210"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                maxLength={10}
                                className={errors.phoneNumber ? "au-input-error" : ""}
                            />
                            {errors.phoneNumber && <small className="au-field-error">⚠️ {errors.phoneNumber}</small>}
                        </div>
                        <div className="au-field au-field-wide">
                            <label>Email</label>
                            <input
                                type="email" name="email"
                                placeholder="e.g. john@sarvodaya.edu"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? "au-input-error" : ""}
                            />
                            {errors.email && <small className="au-field-error">⚠️ {errors.email}</small>}
                        </div>
                    </div>

                    {/* ✅ Confirm Email row */}
                    <div className="au-form-row">
                        <div className="au-field au-field-wide">
                            <label>Confirm Email</label>
                            <input
                                type="email" name="confirmEmail"
                                placeholder="Re-enter email"
                                value={formData.confirmEmail}
                                onChange={handleChange}
                                className={errors.confirmEmail ? "au-input-error" : ""}
                            />
                            {errors.confirmEmail && <small className="au-field-error">⚠️ {errors.confirmEmail}</small>}
                            {/* ✅ Show green tick when emails match and both filled */}
                            {formData.email && formData.confirmEmail &&
                                formData.email === formData.confirmEmail &&
                                !errors.confirmEmail && (
                                    <small className="au-field-success">✅ Email matched</small>
                                )}
                        </div>
                    </div>

                    <div className="au-form-row">
                        <div className="au-field au-field-full">
                            <label>Address</label>
                            <textarea name="address" placeholder="Full address..."
                                value={formData.address} onChange={handleChange} rows={2} />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="au-section-label">🎯 Assign Role <span className="req">*</span></div>
                    <div className="au-role-grid">
                        {ROLES.map(r => (
                            <label key={r.value}
                                className={`au-role-card ${formData.role === r.value ? "selected" : ""}`}>
                                <input type="radio" name="role" value={r.value}
                                    checked={formData.role === r.value}
                                    onChange={handleChange} required />
                                <span className="au-role-icon">{r.icon}</span>
                                <span className="au-role-label">{r.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="au-form-actions">
                        <button type="submit" className="au-submit-btn" disabled={loading}>
                            {loading ? "Creating…" : "✅ Create User"}
                        </button>
                        <button type="button" className="au-reset-btn"
                            onClick={() => {
                                setFormData({
                                    username: "", password: "", fullName: "",
                                    phoneNumber: "", email: "", confirmEmail: "",
                                    address: "", dateOfBirth: "", role: ""
                                });
                                setErrors({});
                            }}>
                            Reset Form
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddUser;