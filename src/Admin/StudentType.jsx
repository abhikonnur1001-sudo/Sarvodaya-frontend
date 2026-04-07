import { useState, useEffect } from "react";
import { api } from "../api";
import "./StudentType.css";

export default function StudentTypes({ goBack }) {
    const [types, setTypes] = useState([]);
    const [typeCode, setTypeCode] = useState("");
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => { fetchTypes(); }, []);

    const fetchTypes = async () => {
        try {
            const res = await api.get("/admin/student-types");
            setTypes(res.data);
        } catch {
            notify("error", "Failed to load student types.");
        }
    };

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!typeCode.trim() || !name.trim()) { notify("error", "All fields required."); return; }
        setLoading(true);
        try {
            await api.post("/admin/student-types", { typeCode: typeCode.trim().toUpperCase(), name: name.trim() });
            notify("success", "Student type added.");
            setTypeCode(""); setName("");
            fetchTypes();
        } catch (err) {
            notify("error", err.response?.data?.message || "Failed to add.");
        } finally { setLoading(false); }
    };

    const handleUpdate = async (id) => {
        if (!editName.trim()) { notify("error", "Name cannot be empty."); return; }
        try {
            await api.put(`/admin/student-types/${id}`, JSON.stringify(editName.trim()), {
                headers: { "Content-Type": "application/json" }
            });
            notify("success", "Updated successfully.");
            setEditingId(null);
            fetchTypes();
        } catch (err) {
            notify("error", err.response?.data?.message || "Update failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student type?")) return;
        try {
            await api.delete(`/admin/student-types/${id}`);
            notify("success", "Deleted successfully.");
            fetchTypes();
        } catch  {
            notify("error", "Delete failed.");
        }
    };

    return (
        <div className="st-container">
            {/* Header */}
            <div className="st-page-header">
                <div>
                    <h2 className="st-page-title">Student Types</h2>
                    <p className="st-page-subtitle">Manage student categories (e.g. Regular, RTE, Staff Ward)</p>
                </div>
                <button className="st-back-btn" onClick={goBack}>← Back</button>
            </div>

            {notification && (
                <div className={`st-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            {/* Add Form */}
            <div className="st-card">
                <div className="st-card-header">
                    <span className="st-card-title">➕ Add Student Type</span>
                </div>
                <form className="st-form" onSubmit={handleAdd}>
                    <div className="st-form-row">
                        <div className="st-field">
                            <label>Type Code <span className="req">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. ROUTE1, HOST, NONE"
                                value={typeCode}
                                onChange={e => setTypeCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                                maxLength={10}
                                required
                            />
                        </div>
                        <div className="st-field">
                            <label>Type Name <span className="req">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Village, Hostel, None"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="st-field st-field-btn">
                            <label>&nbsp;</label>
                            <button type="submit" className="st-add-btn" disabled={loading}>
                                {loading ? "Adding…" : "+ Add Type"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="st-card">
                <div className="st-card-header">
                    <span className="st-card-title">📋 Existing Student Types</span>
                    <span className="st-badge">{types.length} total</span>
                </div>
                {types.length === 0 ? (
                    <div className="st-empty">No student types added yet.</div>
                ) : (
                    <table className="st-table">
                        <thead>
                            <tr>
                                <th style={{ width: "50px" }}>#</th>
                                <th>Code</th>
                                <th>Name</th>
                                <th style={{ width: "200px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.map((t, index) => (
                                <tr key={t.id}>
                                    <td className="st-index">{index + 1}</td>
                                    <td><span className="st-code-badge">{t.typeCode}</span></td>
                                    <td>
                                        {editingId === t.id ? (
                                            <input
                                                className="st-inline-input st-inline-wide"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="st-school-name">{t.name}</span>
                                        )}
                                    </td>
                                    <td className="st-action-cell">
                                        {editingId === t.id ? (
                                            <>
                                                <button type="button" className="st-save-btn" onClick={() => handleUpdate(t.id)}>✅ Save</button>
                                                <button type="button" className="st-cancel-btn" onClick={() => setEditingId(null)}>✖</button>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" className="st-edit-btn" onClick={() => { setEditingId(t.id); setEditName(t.name); }}>✏️ Edit</button>
                                                <button type="button" className="st-delete-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
                                            </>
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
}