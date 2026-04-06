import { useState, useEffect } from "react";
import { api } from "../api";
import "./UserList.css";

const ROLE_LABELS = {
    0: { label: "Administrator", color: "role-admin" },
    1: { label: "HeadMaster", color: "role-hm" },
    2: { label: "Accounts", color: "role-accounts" },
    3: { label: "Faculty", color: "role-faculty" },
};

const ROLE_FILTER_OPTIONS = [
    { value: "", label: "All Roles" },
    { value: "0", label: "Administrator" },
    { value: "1", label: "HeadMaster" },
    { value: "2", label: "Accounts" },
    { value: "3", label: "Faculty" },
];

export default function UserList({ goBack }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    // Toggle confirm modal
    const [toggleModal, setToggleModal] = useState(null); // { user, action }
    const [adminPassword, setAdminPassword] = useState("");
    const [toggleLoading, setToggleLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    // Update modal
    const [editModal, setEditModal] = useState(null); // user object
    const [editForm, setEditForm] = useState({ fullName: "", phoneNumber: "", email: "", address: "" });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => { loadUsers(); }, []);

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch {
            notify("error", "Failed to load users.");
        } finally { setLoading(false); }
    };

    const openToggle = (user) => {
        setToggleModal({ user, action: user.isActive ? "disable" : "enable" });
        setAdminPassword("");
        setShowPw(false);
    };

    const handleToggle = async () => {
        if (!adminPassword) { notify("error", "Enter admin password."); return; }
        const { user, action } = toggleModal;
        setToggleLoading(true);
        try {
            await api.put(`/auth/${action}-user`, null, {
                params: { userId: user.userId, adminPassword }
            });
            notify("success", `User ${action}d successfully.`);
            setToggleModal(null);
            loadUsers();
        } catch (err) {
            notify("error", err.response?.data || `Failed to ${action} user.`);
        } finally { setToggleLoading(false); }
    };

    const openEdit = (user) => {
        setEditModal(user);
        setEditForm({
            fullName: user.fullName || "",
            phoneNumber: user.phoneNumber || "",
            email: user.email || "",
            address: user.address || "",
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await api.put("/auth/update-user", null, {
                params: {
                    userId: editModal.userId,
                    fullName: editForm.fullName,
                    phoneNumber: editForm.phoneNumber,
                    email: editForm.email,
                    address: editForm.address,
                }
            });
            notify("success", "User updated successfully.");
            setEditModal(null);
            loadUsers();
        } catch (err) {
            notify("error", err.response?.data || "Update failed.");
        } finally { setEditLoading(false); }
    };

    const filtered = users.filter(u => {
        const matchSearch =
            u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            u.userId?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.username?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "" || String(u.role) === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div className="ul-container">

            {/* Page Header */}
            <div className="ul-page-header">
                <div>
                    <h2 className="ul-page-title">User Management</h2>
                    <p className="ul-page-subtitle">View, update and enable/disable staff accounts</p>
                </div>
                <button className="ul-back-btn" onClick={goBack}>← Back</button>
            </div>

            {notification && (
                <div className={`ul-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            {/* Toolbar */}
            <div className="ul-toolbar">
                <input className="ul-search" type="text" placeholder="🔍  Search by name, ID, email..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select className="ul-role-filter" value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}>
                    {ROLE_FILTER_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <span className="ul-count">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Table Card */}
            <div className="ul-card">
                {loading ? (
                    <div className="ul-empty">Loading users…</div>
                ) : filtered.length === 0 ? (
                    <div className="ul-empty">No users found.</div>
                ) : (
                    <table className="ul-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User ID</th>
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th style={{ width: "180px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, index) => (
                                <tr key={user.id} className={!user.isActive ? "ul-row-disabled" : ""}>
                                    <td className="ul-index">{index + 1}</td>
                                    <td><span className="ul-userid-badge">{user.userId}</span></td>
                                    <td className="ul-fullname">{user.fullName}</td>
                                    <td className="ul-username">@{user.username}</td>
                                    <td className="ul-email">{user.email || "—"}</td>
                                    <td>
                                        <span className={`ul-role-badge ${ROLE_LABELS[user.role]?.color}`}>
                                            {ROLE_LABELS[user.role]?.label || "Unknown"}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Toggle Switch */}
                                        <button
                                            className={`ul-toggle ${user.isActive ? "active" : "inactive"}`}
                                            onClick={() => openToggle(user)}
                                            title={user.isActive ? "Click to Disable" : "Click to Enable"}
                                        >
                                            <span className="ul-toggle-thumb" />
                                            <span className="ul-toggle-label">
                                                {user.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="ul-action-cell">
                                        <button className="ul-edit-btn" onClick={() => openEdit(user)}>
                                            ✏️ Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Toggle Confirm Modal ── */}
            {toggleModal && (
                <div className="ul-overlay" onClick={() => setToggleModal(null)}>
                    <div className="ul-modal" onClick={e => e.stopPropagation()}>
                        <div className="ul-modal-header">
                            <span>
                                {toggleModal.action === "disable" ? "🔒 Disable User" : "🔓 Enable User"}
                            </span>
                            <button className="ul-modal-close" onClick={() => setToggleModal(null)}>✖</button>
                        </div>
                        <div className="ul-modal-body">
                            <p className="ul-modal-info">
                                You are about to <strong>{toggleModal.action}</strong> the account of{" "}
                                <strong>{toggleModal.user.fullName}</strong> ({toggleModal.user.userId}).
                            </p>
                            <p className="ul-modal-hint">Enter your admin password to confirm.</p>
                            <div className="ul-field">
                                <label>Admin Password <span className="req">*</span></label>
                                <div className="ul-pw-wrap">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        placeholder="Your password"
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleToggle()}
                                        autoFocus
                                    />
                                    <button type="button" className="ul-pw-toggle"
                                        onClick={() => setShowPw(p => !p)}>
                                        {showPw ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="ul-modal-footer">
                            <button className="ul-cancel-btn" onClick={() => setToggleModal(null)}>
                                Cancel
                            </button>
                            <button
                                className={`ul-confirm-btn ${toggleModal.action === "disable" ? "danger" : "success"}`}
                                onClick={handleToggle}
                                disabled={toggleLoading}
                            >
                                {toggleLoading ? "Processing…" :
                                    toggleModal.action === "disable" ? "🔒 Disable" : "🔓 Enable"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Update Modal ── */}
            {editModal && (
                <div className="ul-overlay" onClick={() => setEditModal(null)}>
                    <div className="ul-modal ul-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="ul-modal-header">
                            <span>✏️ Update User — {editModal.userId}</span>
                            <button className="ul-modal-close" onClick={() => setEditModal(null)}>✖</button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="ul-modal-body">
                                <div className="ul-user-meta">
                                    <span className={`ul-role-badge ${ROLE_LABELS[editModal.role]?.color}`}>
                                        {ROLE_LABELS[editModal.role]?.label}
                                    </span>
                                    <span className="ul-meta-username">@{editModal.username}</span>
                                </div>
                                <div className="ul-form-grid">
                                    <div className="ul-field ul-field-full">
                                        <label>Full Name <span className="req">*</span></label>
                                        <input type="text" value={editForm.fullName} required
                                            onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))} />
                                    </div>
                                    <div className="ul-field">
                                        <label>Phone Number</label>
                                        <input type="text" value={editForm.phoneNumber} maxLength={15}
                                            onChange={e => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))} />
                                    </div>
                                    <div className="ul-field">
                                        <label>Email</label>
                                        <input type="email" value={editForm.email}
                                            onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div className="ul-field ul-field-full">
                                        <label>Address</label>
                                        <textarea rows={2} value={editForm.address}
                                            onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                            <div className="ul-modal-footer">
                                <button type="button" className="ul-cancel-btn"
                                    onClick={() => setEditModal(null)}>Cancel</button>
                                <button type="submit" className="ul-confirm-btn primary" disabled={editLoading}>
                                    {editLoading ? "Saving…" : "✅ Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}