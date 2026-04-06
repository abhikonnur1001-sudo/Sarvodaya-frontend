import React, { useState, useEffect } from "react";
import { api } from "../api";
import "./AddClass.css";

const AddClass = ({ goBack }) => {
    const [classCode, setClassCode] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editCode, setEditCode] = useState("");

    useEffect(() => {
        loadSchools();
        loadClasses();
    }, []);

    const loadSchools = async () => {
        try {
            const res = await api.get("/schools");
            setSchools(res.data);
        } catch {
            notify("error", "Failed to load schools.");
        }
    };

    const loadClasses = async () => {
        try {
            const res = await api.get("/classes");
            setClasses(res.data);
        } catch {
            notify("error", "Failed to load classes.");
        }
    };

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        if (!classCode.trim() || !selectedSchool) {
            notify("error", "Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/classes", { classCode: classCode.trim(), schoolId: Number(selectedSchool) });
            notify("success", "Class added successfully.");
            setClassCode("");
            setSelectedSchool("");
            loadClasses();
        } catch (err) {
            notify("error", err.response?.data?.message || "Failed to add class.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        if (!editCode.trim()) { notify("error", "Class code cannot be empty."); return; }
        try {
            await api.put(`/classes/${id}`, { classCode: editCode.trim() });
            notify("success", "Class updated.");
            setEditingId(null);
            loadClasses();
        } catch (err) {
            notify("error", err.response?.data?.message || "Update failed.");
        }
    };

    const getSchoolName = (schoolId) => {
        const s = schools.find(s => s.id === schoolId);
        return s ? s.name : "—";
    };

    return (
        <div className="acm-container">
            {/* Page Header */}
            <div className="acm-page-header">
                <div>
                    <h2 className="acm-page-title">Class Management</h2>
                    <p className="acm-page-subtitle">Add and manage classes across all schools</p>
                </div>
                <button className="acm-back-btn" onClick={goBack}>
                    ← Back
                </button>
            </div>

            {notification && (
                <div className={`acm-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            {/* Add New Class Card */}
            <div className="acm-card">
                <div className="acm-card-header">
                    <span className="acm-card-title">➕ Add New Class</span>
                </div>
                <form className="acm-form" onSubmit={handleAddClass}>
                    <div className="acm-form-row">
                        <div className="acm-field">
                            <label>Class Code <span className="req">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. 1K, 2E, 3K"
                                value={classCode}
                                onChange={e => setClassCode(e.target.value)}
                                required
                                maxLength={10}
                            />
                        </div>
                        <div className="acm-field">
                            <label>School <span className="req">*</span></label>
                            <select
                                value={selectedSchool}
                                onChange={e => setSelectedSchool(e.target.value)}
                                required
                            >
                                <option value="">— Select School —</option>
                                {schools.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="acm-field acm-field-btn">
                            <label>&nbsp;</label>
                            <button type="submit" className="acm-add-btn" disabled={loading}>
                                {loading ? "Adding…" : "+ Add Class"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Existing Classes Card */}
            <div className="acm-card">
                <div className="acm-card-header">
                    <span className="acm-card-title">📋 Existing Classes</span>
                    <span className="acm-badge">{classes.length} total</span>
                </div>

                {classes.length === 0 ? (
                    <div className="acm-empty">
                        <p>No classes added yet. Use the form above to add your first class.</p>
                    </div>
                ) : (
                    <table className="acm-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>#</th>
                                <th>Class Code</th>
                                <th>School</th>
                                <th style={{ width: "160px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls, index) => (
                                <tr key={cls.id}>
                                    <td className="acm-index">{index + 1}</td>
                                    <td>
                                        {editingId === cls.id ? (
                                            <input
                                                className="acm-inline-input"
                                                value={editCode}
                                                onChange={e => setEditCode(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="acm-code-badge">{cls.classCode}</span>
                                        )}
                                    </td>
                                    <td className="acm-school-name">{getSchoolName(cls.schoolId)}</td>
                                    <td className="acm-action-cell">
                                        {editingId === cls.id ? (
                                            <>
                                                <button className="acm-save-btn" onClick={() => handleUpdate(cls.id)}>✅ Save</button>
                                                <button className="acm-cancel-btn" onClick={() => setEditingId(null)}>✖ Cancel</button>
                                            </>
                                        ) : (
                                            <button className="acm-edit-btn" onClick={() => { setEditingId(cls.id); setEditCode(cls.classCode); }}>
                                                ✏️ Update
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AddClass;