import { useState, useEffect } from "react";
import { api } from "../api";
import "./FeeAssign.css";

export default function FeeAssign({ goBack }) {
    const [yearName, setYearName] = useState("");
    const [academicYear, setAcademicYear] = useState(null);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [classAmount, setClassAmount] = useState("");
    const [studentTypes, setStudentTypes] = useState([]);
    const [selectedStudentType, setSelectedStudentType] = useState("");
    const [typeAmount, setTypeAmount] = useState("");
    const [recentClassFees, setRecentClassFees] = useState([]);
    const [recentStudentFees, setRecentStudentFees] = useState([]);
    const [allClassFees, setAllClassFees] = useState([]);
    const [allStudentFees, setAllStudentFees] = useState([]);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [loadingYear, setLoadingYear] = useState(false);
    const [loadingClass, setLoadingClass] = useState(false);
    const [loadingType, setLoadingType] = useState(false);
    const [activeTab, setActiveTab] = useState("class");

    useEffect(() => {
        loadActiveYear();
        loadSchools();
        loadClasses();
        loadStudentTypes();
    }, []);

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const loadActiveYear = async () => {
        try { const res = await api.get("/academicyears/active"); setAcademicYear(res.data); }
        catch {/* silently ignore */  }
    };
    const loadSchools = async () => {
        try { const res = await api.get("/schools"); setSchools(res.data); }
        catch {/* silently ignore */  }
    };
    const loadClasses = async () => {
        try { const res = await api.get("/classes"); setClasses(res.data); }
        catch { /* silently ignore */ }
    };
    const loadStudentTypes = async () => {
        try {
            const res = await api.get("/admin/student-types");
            console.log("Student Types:", res.data);
            setStudentTypes(res.data);
        }
        catch(err) {
            console.error("Student types error:", err);
        }
    };

    const filteredClasses = classes.filter(
        c => selectedSchool && c.schoolId === parseInt(selectedSchool)
    );

    const createYear = async (e) => {
        e.preventDefault();
        setLoadingYear(true);
        try {
            await api.post("/academicyears", { name: yearName });
            notify("success", "Academic year created successfully.");
            setYearName("");
            loadActiveYear();
        } catch (err) {
            notify("error", err.response?.data || "Error creating academic year.");
        } finally { setLoadingYear(false); }
    };

    const assignFee = async (e) => {
        e.preventDefault();
        if (!selectedClass || !classAmount || !academicYear) { notify("error", "Please fill all fields."); return; }
        setLoadingClass(true);
        try {
            const selectedClassObj = classes.find(c => c.id === parseInt(selectedClass));
            await api.post("/accounts/assign-class-fees", {
                academicYearId: academicYear.id,
                classCode: selectedClassObj.classCode,
                amount: parseFloat(classAmount)
            });
            notify("success", `Class fee assigned for ${selectedClassObj.classCode}.`);
            setRecentClassFees(prev => [{
                classCode: selectedClassObj.classCode,
                amount: parseFloat(classAmount),
                school: schools.find(s => s.id == selectedSchool)?.name
            }, ...prev]);
            setSelectedClass(""); setClassAmount("");
        } catch (err) {
            notify("error", err.response?.data || "Error assigning class fee.");
        } finally { setLoadingClass(false); }
    };

    const assignStudentTypeFee = async (e) => {
        e.preventDefault();
        if (!selectedStudentType || !typeAmount || !academicYear) { notify("error", "Fill all fields."); return; }
        setLoadingType(true);
        try {
            await api.post("/accounts/assign-studenttype-fees", {
                academicYearId: academicYear.id,
                fees: [{ studentTypeId: parseInt(selectedStudentType), amount: parseFloat(typeAmount) }]
            });
            notify("success", "Student type fee assigned.");
            setRecentStudentFees(prev => [{
                type: studentTypes.find(t => t.id == selectedStudentType)?.name,
                amount: parseFloat(typeAmount)
            }, ...prev]);
            setSelectedStudentType(""); setTypeAmount("");
        } catch (err) {
            notify("error", err.response?.data || "Error assigning student type fee.");
        } finally { setLoadingType(false); }
    };

    const loadAllClassFees = async () => {
        try {
            const res = await api.get(`/accounts/class-fees/${academicYear.id}`);
            setAllClassFees(res.data); setShowClassModal(true);
        } catch { notify("error", "Failed to load class fees."); }
    };

    const loadAllStudentFees = async () => {
        try {
            const res = await api.get(`/accounts/studenttype-fees/${academicYear.id}`);
            setAllStudentFees(res.data); setShowStudentModal(true);
        } catch { notify("error", "Failed to load student type fees."); }
    };

    return (
        <div className="fa-container">

            {/* Page Header */}
            <div className="fa-page-header">
                <div>
                    <h2 className="fa-page-title">Fee Assignment</h2>
                    <p className="fa-page-subtitle">Manage academic year and assign fees by class or student type</p>
                </div>
                <button className="fa-back-btn" onClick={goBack}>← Back</button>
            </div>

            {notification && (
                <div className={`fa-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            {/* Academic Year Card */}
            <div className="fa-card">
                <div className="fa-card-header">
                    <span className="fa-card-title">📅 Academic Year</span>
                    {academicYear && (
                        <span className="fa-active-badge">✅ Active: {academicYear.yearName}</span>
                    )}
                </div>
                <div className="fa-card-body">
                    <form className="fa-year-form" onSubmit={createYear}>
                        <div className="fa-field">
                            <label>Year Name <span className="req">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. 2025-2026"
                                value={yearName}
                                onChange={e => setYearName(e.target.value)}
                                required
                                disabled={!!academicYear}
                            />
                        </div>
                        <button type="submit" className="fa-create-btn"
                            disabled={!!academicYear || loadingYear}>
                            {loadingYear ? "Creating…" : academicYear ? "✅ Year Active" : "Create Year"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Tabs */}
            <div className="fa-tabs">
                <button className={`fa-tab${activeTab === "class" ? " active" : ""}`}
                    onClick={() => setActiveTab("class")}>🏫 Class Fees</button>
                <button className={`fa-tab${activeTab === "type" ? " active" : ""}`}
                    onClick={() => setActiveTab("type")}>👥 Student Type Fees</button>
            </div>

            {/* ── TAB 1: Class Fees ── */}
            {activeTab === "class" && (
                <div className="fa-tab-content">
                    <div className="fa-two-col">

                        {/* Assign Form */}
                        <div className="fa-card">
                            <div className="fa-card-header">
                                <span className="fa-card-title">➕ Assign Class Fee</span>
                            </div>
                            <form className="fa-card-body fa-form" onSubmit={assignFee}>
                                <div className="fa-field">
                                    <label>School <span className="req">*</span></label>
                                    <select value={selectedSchool}
                                        onChange={e => { setSelectedSchool(e.target.value); setSelectedClass(""); }} required>
                                        <option value="">— Select School —</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="fa-field">
                                    <label>Class <span className="req">*</span></label>
                                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required
                                        disabled={!selectedSchool}>
                                        <option value="">— Select Class —</option>
                                        {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.classCode}</option>)}
                                    </select>
                                    {selectedSchool && filteredClasses.length === 0 &&
                                        <small className="fa-hint">No classes for this school.</small>}
                                </div>
                                <div className="fa-field">
                                    <label>Academic Year</label>
                                    <input value={academicYear?.yearName || "No active year"} readOnly className="fa-readonly" />
                                </div>
                                <div className="fa-field">
                                    <label>Amount (₹) <span className="req">*</span></label>
                                    <input type="number" placeholder="e.g. 5000" value={classAmount}
                                        onChange={e => setClassAmount(e.target.value)} min="1" required />
                                </div>
                                <button type="submit" className="fa-submit-btn" disabled={loadingClass || !academicYear}>
                                    {loadingClass ? "Assigning…" : "Assign Fee"}
                                </button>
                                {!academicYear && <small className="fa-warn">⚠️ Create an academic year first.</small>}
                            </form>
                        </div>

                        {/* Recent + View All */}
                        <div className="fa-card">
                            <div className="fa-card-header">
                                <span className="fa-card-title">🕐 Recently Assigned</span>
                                <button className="fa-view-all-btn" onClick={loadAllClassFees}
                                    disabled={!academicYear}>View All →</button>
                            </div>
                            <div className="fa-card-body">
                                {recentClassFees.length === 0 ? (
                                    <div className="fa-empty">No assignments yet this session.</div>
                                ) : (
                                    <table className="fa-mini-table">
                                        <thead>
                                            <tr><th>School</th><th>Class</th><th>Amount</th></tr>
                                        </thead>
                                        <tbody>
                                            {recentClassFees.map((f, i) => (
                                                <tr key={i}>
                                                    <td>{f.school}</td>
                                                    <td><span className="fa-code-badge">{f.classCode}</span></td>
                                                    <td className="fa-amount">₹{Number(f.amount).toLocaleString("en-IN")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ── TAB 2: Student Type Fees ── */}
            {activeTab === "type" && (
                <div className="fa-tab-content">
                    <div className="fa-two-col">

                        {/* Assign Form */}
                        <div className="fa-card">
                            <div className="fa-card-header">
                                <span className="fa-card-title">➕ Assign Student Type Fee</span>
                            </div>
                            <form className="fa-card-body fa-form" onSubmit={assignStudentTypeFee}>
                                <div className="fa-field">
                                    <label>Student Type <span className="req">*</span></label>
                                    <select value={selectedStudentType}
                                        onChange={e => setSelectedStudentType(e.target.value)} required>
                                        <option value="">— Select Type —</option>
                                        {studentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="fa-field">
                                    <label>Academic Year</label>
                                    <input value={academicYear?.yearName || "No active year"} readOnly className="fa-readonly" />
                                </div>
                                <div className="fa-field">
                                    <label>Amount (₹) <span className="req">*</span></label>
                                    <input type="number" placeholder="e.g. 3000" value={typeAmount}
                                        onChange={e => setTypeAmount(e.target.value)} min="1" required />
                                </div>
                                <button type="submit" className="fa-submit-btn" disabled={loadingType || !academicYear}>
                                    {loadingType ? "Assigning…" : "Assign Fee"}
                                </button>
                                {!academicYear && <small className="fa-warn">⚠️ Create an academic year first.</small>}
                            </form>
                        </div>

                        {/* Recent + View All */}
                        <div className="fa-card">
                            <div className="fa-card-header">
                                <span className="fa-card-title">🕐 Recently Assigned</span>
                                <button className="fa-view-all-btn" onClick={loadAllStudentFees}
                                    disabled={!academicYear}>View All →</button>
                            </div>
                            <div className="fa-card-body">
                                {recentStudentFees.length === 0 ? (
                                    <div className="fa-empty">No assignments yet this session.</div>
                                ) : (
                                    <table className="fa-mini-table">
                                        <thead>
                                            <tr><th>Student Type</th><th>Amount</th></tr>
                                        </thead>
                                        <tbody>
                                            {recentStudentFees.map((f, i) => (
                                                <tr key={i}>
                                                    <td><span className="fa-type-badge">{f.type}</span></td>
                                                    <td className="fa-amount">₹{Number(f.amount).toLocaleString("en-IN")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ── Modal: All Class Fees ── */}
            {showClassModal && (
                <div className="fa-modal-overlay" onClick={() => setShowClassModal(false)}>
                    <div className="fa-modal" onClick={e => e.stopPropagation()}>
                        <div className="fa-modal-header">
                            <span>🏫 All Class Fees — {academicYear?.yearName}</span>
                            <button className="fa-modal-close" onClick={() => setShowClassModal(false)}>✖</button>
                        </div>
                        <div className="fa-modal-body">
                            {allClassFees.length === 0 ? (
                                <div className="fa-empty">No class fees assigned.</div>
                            ) : (
                                <table className="fa-mini-table">
                                    <thead><tr><th>School</th><th>Class</th><th>Amount</th></tr></thead>
                                    <tbody>
                                        {allClassFees.map((f, i) => (
                                            <tr key={i}>
                                                <td>{f.schoolName}</td>
                                                <td><span className="fa-code-badge">{f.classCode}</span></td>
                                                <td className="fa-amount">₹{Number(f.amount).toLocaleString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: All Student Type Fees ── */}
            {showStudentModal && (
                <div className="fa-modal-overlay" onClick={() => setShowStudentModal(false)}>
                    <div className="fa-modal" onClick={e => e.stopPropagation()}>
                        <div className="fa-modal-header">
                            <span>👥 All Student Type Fees — {academicYear?.yearName}</span>
                            <button className="fa-modal-close" onClick={() => setShowStudentModal(false)}>✖</button>
                        </div>
                        <div className="fa-modal-body">
                            {allStudentFees.length === 0 ? (
                                <div className="fa-empty">No student type fees assigned.</div>
                            ) : (
                                <table className="fa-mini-table">
                                    <thead><tr><th>Student Type</th><th>Amount</th></tr></thead>
                                    <tbody>
                                        {allStudentFees.map((f, i) => (
                                            <tr key={i}>
                                                <td><span className="fa-type-badge">{f.studentTypeName}</span></td>
                                                <td className="fa-amount">₹{Number(f.amount).toLocaleString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}