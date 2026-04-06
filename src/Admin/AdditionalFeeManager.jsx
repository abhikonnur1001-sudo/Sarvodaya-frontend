import React, { useState, useEffect } from "react";
import { api } from "../api";
import "./AdditionalFeeManager.css";

const AdditionalFeeManager = ({ userRole }) => {

    // ── Role checks ───────────────────────────────────────────────────────
    const isAdmin = userRole === "Administrator";
    const canAssign = ["Administrator", "HeadMaster", "Faculty"].includes(userRole);

    const [tab, setTab] = useState("manage");
    const [feeTypes, setFeeTypes] = useState([]);
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);

    // Manage tab
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [feeForm, setFeeForm] = useState({ code: "", name: "", amount: "" });

    // Assign tab
    const [enrollmentInput, setEnrollmentInput] = useState("");
    const [studentInfo, setStudentInfo] = useState(null);
    const [assignedFees, setAssignedFees] = useState([]);
    const [selectedFeeId, setSelectedFeeId] = useState("");
    const [customAmount, setCustomAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [assigning, setAssigning] = useState(false);

    useEffect(() => { loadFeeTypes(); }, []);

    const loadFeeTypes = async () => {
        try {
            const res = await api.get("/additional-fees");
            setFeeTypes(res.data);
        } catch {
            notify("error", "Failed to load fee types.");
        }
    };

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    // ── Manage: Create / Edit ─────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        setFeeForm({ code: "", name: "", amount: "" });
        setShowForm(true);
    };

    const openEdit = (fee) => {
        setEditTarget(fee);
        setFeeForm({ code: fee.code, name: fee.name, amount: fee.amount });
        setShowForm(true);
    };

    const handleFeeFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editTarget) {
                await api.put(`/additional-fees/${editTarget.id}`, {
                    name: feeForm.name,
                    amount: Number(feeForm.amount),
                });
                notify("success", "Fee updated successfully.");
            } else {
                await api.post("/additional-fees", {
                    code: feeForm.code,
                    name: feeForm.name,
                    amount: Number(feeForm.amount),
                });
                notify("success", "Fee created successfully.");
            }
            setShowForm(false);
            loadFeeTypes();
        } catch (err) {
            notify("error", err.response?.data?.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fee) => {
        if (!window.confirm(`Delete "${fee.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/additional-fees/${fee.id}`);
            notify("success", "Fee deleted.");
            loadFeeTypes();
        } catch (err) {
            notify("error", err.response?.data?.message || "Delete failed.");
        }
    };

    // ── Assign tab ────────────────────────────────────────────────────────
    const searchStudent = async () => {
        if (!enrollmentInput.trim()) { notify("error", "Enter an enrollment number."); return; }
        setStudentInfo(null);
        setAssignedFees([]);
        try {
            const res = await api.get(`/accounts/student-fee/${enrollmentInput.trim()}`);
            setStudentInfo(res.data);
            const aRes = await api.get(`/additional-fees/student/${enrollmentInput.trim()}`);
            setAssignedFees(aRes.data);
        } catch (err) {
            notify("error", err.response?.data?.message || "Enrollment not found.");
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedFeeId) { notify("error", "Select a fee type."); return; }
        setAssigning(true);
        try {
            await api.post("/additional-fees/assign", {
                enrollmentNumber: enrollmentInput.trim(),
                additionalFeeId: Number(selectedFeeId),
                customAmount: customAmount ? Number(customAmount) : null,
                remarks: remarks || null,
            });
            notify("success", "Fee assigned successfully.");
            setSelectedFeeId(""); setCustomAmount(""); setRemarks("");
            const aRes = await api.get(`/additional-fees/student/${enrollmentInput.trim()}`);
            setAssignedFees(aRes.data);
        } catch (err) {
            notify("error", err.response?.data?.message || "Assignment failed.");
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveAssignment = async (id) => {
        if (!window.confirm("Remove this fee assignment?")) return;
        try {
            await api.delete(`/additional-fees/assignment/${id}`);
            notify("success", "Assignment removed.");
            const aRes = await api.get(`/additional-fees/student/${enrollmentInput.trim()}`);
            setAssignedFees(aRes.data);
        } catch (err) {
            notify("error", err.response?.data?.message || "Could not remove.");
        }
    };

    // ── RENDER ────────────────────────────────────────────────────────────
    return (
        <div className="afm-container">

            <div className="afm-header">
                <div>
                    <h2 className="afm-title">Additional Fees</h2>
                    <p className="afm-subtitle">
                        Manage mid-year fees like Club, Annual Day, School Trip, etc.
                    </p>
                </div>
            </div>

            {notification && (
                <div className={`afm-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            <div className="afm-tabs">
                <button
                    className={`afm-tab${tab === "manage" ? " active" : ""}`}
                    onClick={() => setTab("manage")}
                >
                    📋 Fee Types
                </button>
                {!isAdmin && (
                    <button
                        className={`afm-tab${tab === "assign" ? " active" : ""}`}
                        onClick={() => setTab("assign")}
                    >
                        🎯 Assign to Student
                    </button>
                )}
            </div>

            {/* ── TAB 1: Manage Fee Types ── */}
            {tab === "manage" && (
                <div className="afm-card">
                    <div className="afm-card-header">
                        <span className="afm-card-title">📋 All Additional Fee Types</span>
                        {isAdmin && (
                            <button className="afm-add-btn" onClick={openCreate}>
                                + New Fee Type
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <form className="afm-form" onSubmit={handleFeeFormSubmit}>
                            <div className="afm-form-title">
                                {editTarget ? "✏️ Edit Fee Type" : "➕ Create New Fee Type"}
                            </div>
                            <div className="afm-form-row">
                                {!editTarget && (
                                    <div className="afm-field">
                                        <label>Fee Code <span className="req">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CLUB, ANNUAL_DAY, TRIP"
                                            value={feeForm.code}
                                            onChange={e => setFeeForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                            required
                                            maxLength={20}
                                        />
                                        <small>Unique short code. Cannot be changed after creation.</small>
                                    </div>
                                )}
                                <div className="afm-field">
                                    <label>Fee Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Club Fee, Annual Day Fee"
                                        value={feeForm.name}
                                        onChange={e => setFeeForm(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="afm-field">
                                    <label>Default Amount (₹) <span className="req">*</span></label>
                                    <input
                                        type="number"
                                        placeholder="500"
                                        value={feeForm.amount}
                                        onChange={e => setFeeForm(p => ({ ...p, amount: e.target.value }))}
                                        min="1"
                                        required
                                    />
                                    <small>Can be overridden per student during assignment.</small>
                                </div>
                            </div>
                            <div className="afm-form-actions">
                                <button type="submit" className="afm-save-btn" disabled={loading}>
                                    {loading ? "Saving…" : (editTarget ? "Update Fee" : "Create Fee")}
                                </button>
                                <button
                                    type="button"
                                    className="afm-cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {feeTypes.length === 0 ? (
                        <div className="afm-empty">
                            <p>No additional fee types created yet.</p>
                            {isAdmin && <p>Click <strong>+ New Fee Type</strong> to get started.</p>}
                        </div>
                    ) : (
                        <table className="afm-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Default Amount</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {feeTypes.map(fee => (
                                    <tr key={fee.id}>
                                        <td><span className="fee-code-badge">{fee.code}</span></td>
                                        <td>{fee.name}</td>
                                        <td className="amount-cell">
                                            ₹ {Number(fee.amount).toLocaleString("en-IN")}
                                        </td>
                                        {isAdmin && (
                                            <td className="action-cell">
                                                <button
                                                    className="afm-edit-btn"
                                                    onClick={() => openEdit(fee)}
                                                >✏️</button>
                                                <button
                                                    className="afm-del-btn"
                                                    onClick={() => handleDelete(fee)}
                                                >🗑️</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── TAB 2: Assign to Student ── */}
            {tab === "assign" && (
                <div className="afm-card">
                    <div className="afm-card-title-plain">🎯 Assign Additional Fee to Student</div>

                    <div className="afm-search-row">
                        <input
                            type="text"
                            className="afm-search-input"
                            placeholder="Enter Enrollment Number (e.g. SAR-2025-001)"
                            value={enrollmentInput}
                            onChange={e => setEnrollmentInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && searchStudent()}
                        />
                        <button className="afm-search-btn" onClick={searchStudent}>
                            🔍 Search
                        </button>
                    </div>

                    {studentInfo && (
                        <>
                            <div className="afm-student-card">
                                <div className="afm-student-info">
                                    <div className="afm-student-avatar">
                                        {enrollmentInput.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="afm-student-name">
                                            {enrollmentInput.toUpperCase()}
                                        </div>
                                        <div className="afm-student-meta">
                                            Base Fee: ₹{Number(studentInfo.totalFee).toLocaleString("en-IN")}
                                            &nbsp;|&nbsp;
                                            Paid: ₹{Number(studentInfo.totalPaid).toLocaleString("en-IN")}
                                            &nbsp;|&nbsp;
                                            Balance: ₹{Number(studentInfo.remainingBalance).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ FIXED: was isAdmin, now canAssign (HM + Faculty + Admin) */}
                            {canAssign && (
                                <form className="afm-assign-form" onSubmit={handleAssign}>
                                    <div className="afm-form-title">➕ Add Additional Fee</div>
                                    <div className="afm-form-row">
                                        <div className="afm-field">
                                            <label>Fee Type <span className="req">*</span></label>
                                            <select
                                                value={selectedFeeId}
                                                onChange={e => {
                                                    setSelectedFeeId(e.target.value);
                                                    const found = feeTypes.find(
                                                        f => f.id === Number(e.target.value)
                                                    );
                                                    setCustomAmount(found ? found.amount : "");
                                                }}
                                                required
                                            >
                                                <option value="">— Select Fee —</option>
                                                {feeTypes.map(f => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.name} (₹{Number(f.amount).toLocaleString("en-IN")})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="afm-field">
                                            <label>Amount (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="Leave blank to use default"
                                                value={customAmount}
                                                onChange={e => setCustomAmount(e.target.value)}
                                                min="1"
                                            />
                                            <small>Default pre-filled. Edit to override.</small>
                                        </div>
                                        <div className="afm-field">
                                            <label>Remarks</label>
                                            <input
                                                type="text"
                                                placeholder="Optional note"
                                                value={remarks}
                                                onChange={e => setRemarks(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="afm-assign-btn"
                                        disabled={assigning}
                                    >
                                        {assigning ? "Assigning…" : "Assign Fee"}
                                    </button>
                                </form>
                            )}

                            <div className="afm-assigned-section">
                                <div className="afm-section-label">
                                    Additional Fees Assigned to This Student
                                </div>
                                {assignedFees.length === 0 ? (
                                    <div className="afm-empty">
                                        No additional fees assigned yet.
                                    </div>
                                ) : (
                                    <table className="afm-table">
                                        <thead>
                                            <tr>
                                                <th>Fee</th>
                                                <th>Amount</th>
                                                <th>Remarks</th>
                                                <th>Status</th>
                                                {isAdmin && <th>Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignedFees.map(af => (
                                                <tr key={af.id}>
                                                    <td>
                                                        <span className="fee-code-badge">
                                                            {af.code}
                                                        </span>
                                                        {" "}{af.name}
                                                    </td>
                                                    <td className="amount-cell">
                                                        ₹ {Number(af.amount).toLocaleString("en-IN")}
                                                    </td>
                                                    <td>{af.remarks || "—"}</td>
                                                    <td>
                                                        <span className={`status-badge ${af.isPaid ? "paid" : "pending"}`}>
                                                            {af.isPaid ? "✅ Paid" : "⏳ Pending"}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td>
                                                            {!af.isPaid && (
                                                                <button
                                                                    className="afm-del-btn"
                                                                    onClick={() => handleRemoveAssignment(af.id)}
                                                                    title="Remove assignment"
                                                                >🗑️</button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdditionalFeeManager;