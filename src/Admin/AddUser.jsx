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
        email: "", address: "", dateOfBirth: "", role: "",
    });
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                email: "", address: "", dateOfBirth: "", role: ""
            });
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

                    {/* Section: Account Info */}
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
                                <input type={showPassword ? "text" : "password"} name="password"
                                    placeholder="Min. 8 characters"
                                    value={formData.password} onChange={handleChange} required />
                                <button type="button" className="au-toggle-pw"
                                    onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section: Personal Info */}
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
                            <input type="text" name="phoneNumber" placeholder="e.g. 9876543210"
                                value={formData.phoneNumber} onChange={handleChange} maxLength={15} />
                        </div>
                        <div className="au-field au-field-wide">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="e.g. john@sarvodaya.edu"
                                value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="au-form-row">
                        <div className="au-field au-field-full">
                            <label>Address</label>
                            <textarea name="address" placeholder="Full address..."
                                value={formData.address} onChange={handleChange} rows={2} />
                        </div>
                    </div>

                    {/* Section: Role */}
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
                            onClick={() => setFormData({
                                username: "", password: "", fullName: "",
                                phoneNumber: "", email: "", address: "", dateOfBirth: "", role: ""
                            })}>
                            Reset Form
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddUser;