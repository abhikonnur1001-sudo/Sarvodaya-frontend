import { useState, useEffect } from "react";
import { api } from "../api";
import "./School.css";

export default function AddSchool({ goBack }) {
    const [schools, setSchools] = useState([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [headmasters, setHeadmasters] = useState([]);
    const [selectedHM, setSelectedHM] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editCode, setEditCode] = useState("");
    const [editName, setEditName] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [schoolRes, hmRes] = await Promise.all([
                api.get("/schools"),
                api.get("/accounts/headmasters")
            ]);
            setSchools(schoolRes.data);
            setHeadmasters(hmRes.data);
        } catch (err) {
            notify("error", "Failed to load data.");
        }
    };

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const addSchool = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/schools", { code, name });
            notify("success", "School added successfully.");
            setCode(""); setName("");
            fetchData();
        } catch (err) {
            notify("error", err.response?.data?.message || "Failed to add school.");
        } finally { setLoading(false); }
    };

    const handleUpdate = async (id) => {
        if (!editCode.trim() || !editName.trim()) { notify("error", "Fields cannot be empty."); return; }
        try {
            await api.put(`/schools/${id}`, { code: editCode.trim(), name: editName.trim() });
            notify("success", "School updated.");
            setEditingId(null);
            fetchData();
        } catch (err) {
            notify("error", err.response?.data?.message || "Update failed.");
        }
    };

    const handleAssign = async () => {
        if (!selectedHM || !selectedSchool) { notify("error", "Please select both Headmaster and School."); return; }
        try {
            await api.post("/schools/assign-hm", null, {
                params: { userId: Number(selectedHM), schoolId: Number(selectedSchool) }
            });
            notify("success", "Headmaster assigned successfully.");
            setSelectedHM(""); setSelectedSchool("");
        } catch (err) {
            notify("error", err.response?.data || "Assignment failed.");
        }
    };

    return (
        <div className="sm-container">
            {/* Page Header */}
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title">School Management</h2>
                    <p className="sm-page-subtitle">Add, update schools and assign headmasters</p>
                </div>
                <button className="sm-back-btn" onClick={goBack}>← Back</button>
            </div>

            {notification && (
                <div className={`sm-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            <div className="sm-grid">

                {/* LEFT — Add + Table */}
                <div className="sm-left">

                    {/* Add School Card */}
                    <div className="sm-card">
                        <div className="sm-card-header">
                            <span className="sm-card-title">➕ Add New School</span>
                        </div>
                        <form className="sm-form" onSubmit={addSchool}>
                            <div className="sm-form-row">
                                <div className="sm-field">
                                    <label>School Code <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PRI001, HIGH001,INTER001"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                                        required maxLength={10}
                                    />
                                </div>
                                <div className="sm-field">
                                    <label>School Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sarvodaya Primary School"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="sm-field sm-field-btn">
                                    <label>&nbsp;</label>
                                    <button type="submit" className="sm-add-btn" disabled={loading}>
                                        {loading ? "Adding…" : "+ Add School"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Existing Schools Table */}
                    <div className="sm-card">
                        <div className="sm-card-header">
                            <span className="sm-card-title">🏫 Existing Schools</span>
                            <span className="sm-badge">{schools.length} total</span>
                        </div>

                        {schools.length === 0 ? (
                            <div className="sm-empty">No schools added yet.</div>
                        ) : (
                            <table className="sm-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>#</th>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th style={{ width: "180px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.map((school, index) => (
                                        <tr key={school.id}>
                                            <td className="sm-index">{index + 1}</td>
                                            <td>
                                                {editingId === school.id ? (
                                                    <input className="sm-inline-input" value={editCode}
                                                        onChange={e => setEditCode(e.target.value.toUpperCase())} autoFocus />
                                                ) : (
                                                    <span className="sm-code-badge">{school.code}</span>
                                                )}
                                            </td>
                                            <td>
                                                {editingId === school.id ? (
                                                    <input className="sm-inline-input sm-inline-wide" value={editName}
                                                        onChange={e => setEditName(e.target.value)} />
                                                ) : (
                                                    <span className="sm-school-name">{school.name}</span>
                                                )}
                                            </td>
                                            <td className="sm-action-cell">
                                                {editingId === school.id ? (
                                                    <>
                                                        <button className="sm-save-btn" onClick={() => handleUpdate(school.id)}>✅ Save</button>
                                                        <button className="sm-cancel-btn" onClick={() => setEditingId(null)}>✖</button>
                                                    </>
                                                ) : (
                                                    <button className="sm-edit-btn" onClick={() => {
                                                        setEditingId(school.id);
                                                        setEditCode(school.code);
                                                        setEditName(school.name);
                                                    }}>✏️ Update</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* RIGHT — Assign HM */}
                <div className="sm-right">
                    <div className="sm-card">
                        <div className="sm-card-header">
                            <span className="sm-card-title">👤 Assign Headmaster</span>
                        </div>
                        <div className="sm-assign-body">
                            <p className="sm-assign-hint">
                                Select a headmaster and a school to assign them. Each headmaster can be assigned to one school only.
                            </p>

                            <div className="sm-field">
                                <label>Headmaster <span className="req">*</span></label>
                                <select value={selectedHM} onChange={e => setSelectedHM(e.target.value)}>
                                    <option value="">— Select Headmaster —</option>
                                    {headmasters.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm-field">
                                <label>School <span className="req">*</span></label>
                                <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
                                    <option value="">— Select School —</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="sm-assign-btn" onClick={handleAssign}>
                                Assign Headmaster →
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}