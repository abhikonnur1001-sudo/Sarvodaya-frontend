import { useEffect, useState } from "react";
import { api } from "../api";
import "./UpdateCollection.css";
import FeeCollection from "./FeeCollection";

export default function UpdateCollection() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    const load = async () => {
        setLoading(true); setError("");
        try {
            const res = await api.get("/accounts/assigned-students");
            // Only students who paid at least once but still have balance
            setStudents(res.data.filter(s => (s.paidAmount ?? 0) > 0 && (s.balance ?? 0) > 0));
        } catch { setError("Failed to load students."); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    if (selected) {
        return (
            <FeeCollection
                prefillEnrollment={selected.enrollmentNumber}
                goBack={() => { setSelected(null); load(); }}
            />
        );
    }

    const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    const rows = students.filter(s =>
        s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        s.enrollmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
        s.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
        s.className?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPending = students.reduce((a, s) => a + (s.balance ?? 0), 0);
    const totalCollected = students.reduce((a, s) => a + (s.paidAmount ?? 0), 0);

    return (
        <div className="uc-container">

            {/* Page Header */}
            <div className="uc-page-header">
                <div>
                    <h2 className="uc-title">Update Collection</h2>
                    <p className="uc-subtitle">
                        Students with partial payments — collect remaining balance
                    </p>
                </div>
                <button className="uc-refresh-btn" onClick={load}>🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div className="uc-stats-row">
                <div className="uc-stat">
                    <div className="uc-stat-value">{students.length}</div>
                    <div className="uc-stat-label">Students</div>
                </div>
                <div className="uc-stat green">
                    <div className="uc-stat-value">₹{fmt(totalCollected)}</div>
                    <div className="uc-stat-label">Already Collected</div>
                </div>
                <div className="uc-stat red">
                    <div className="uc-stat-value">₹{fmt(totalPending)}</div>
                    <div className="uc-stat-label">Remaining Balance</div>
                </div>
            </div>

            {/* Search */}
            <div className="uc-toolbar">
                <input
                    className="uc-search"
                    placeholder="Search name, enrollment, school, class…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="uc-count">
                    {rows.length} student{rows.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="uc-table-wrap">
                {loading ? (
                    <div className="uc-state">⏳ Loading…</div>
                ) : error ? (
                    <div className="uc-state error">❌ {error}</div>
                ) : rows.length === 0 ? (
                    <div className="uc-state">✅ No pending students found.</div>
                ) : (
                    <table className="uc-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Enrollment No.</th>
                                <th>School</th>
                                <th>Class</th>
                                <th>Total Fee</th>
                                <th>Concession</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((s, i) => {
                                const concession = s.concessionAmount ?? 0;
                                return (
                                    <tr key={s.assignmentId}>
                                        <td className="uc-sl">{i + 1}</td>
                                        <td className="uc-name">{s.studentName}</td>
                                        <td className="uc-enroll">{s.enrollmentNumber ?? "—"}</td>
                                        <td className="uc-school">{s.schoolName ?? "—"}</td>
                                        <td>{s.className}</td>
                                        <td className="uc-num">₹{fmt(s.totalFee)}</td>
                                        <td className="uc-num concession">
                                            {concession > 0 ? `−₹${fmt(concession)}` : "—"}
                                        </td>
                                        <td className="uc-num paid">₹{fmt(s.paidAmount)}</td>
                                        <td className="uc-num">
                                            <span className="uc-bal-due">₹{fmt(s.balance)}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="uc-action-btn"
                                                onClick={() => setSelected(s)}
                                            >
                                                🔄 Update Collect
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}