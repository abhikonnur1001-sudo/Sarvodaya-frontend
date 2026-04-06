import { useEffect, useState } from "react";
import { api } from "../api";
import "./NewCollection.css";
import FeeCollection from "./FeeCollection";

export default function NewCollection() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    const load = async () => {
        setLoading(true); setError("");
        try {
            const res = await api.get("/accounts/assigned-students");
            // Only students who have NEVER paid and still have balance
            setStudents(res.data.filter(s => (s.paidAmount ?? 0) === 0 && (s.balance ?? 0) > 0));
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

    return (
        <div className="nc-container">

            <div className="nc-page-header">
                <div>
                    <h2 className="nc-title">New Collection</h2>
                    <p className="nc-subtitle">Students with no payments yet — collect first installment</p>
                </div>
                <button className="nc-refresh-btn" onClick={load}>🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div className="nc-stats-row">
                <div className="nc-stat">
                    <div className="nc-stat-value">{students.length}</div>
                    <div className="nc-stat-label">Students</div>
                </div>
                <div className="nc-stat red">
                    <div className="nc-stat-value">
                        ₹{fmt(students.reduce((a, s) => a + (s.balance ?? 0), 0))}
                    </div>
                    <div className="nc-stat-label">Total Pending</div>
                </div>
            </div>

            {/* Search */}
            <div className="nc-toolbar">
                <input
                    className="nc-search"
                    placeholder="Search name, enrollment, school, class…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="nc-count">{rows.length} student{rows.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Table */}
            <div className="nc-table-wrap">
                {loading ? (
                    <div className="nc-state">⏳ Loading…</div>
                ) : error ? (
                    <div className="nc-state error">❌ {error}</div>
                ) : rows.length === 0 ? (
                    <div className="nc-state">✅ No students found.</div>
                ) : (
                    <table className="nc-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Enrollment No.</th>
                                <th>School</th>
                                <th>Class</th>
                                <th>Total Fee</th>
                                <th>Concession</th>
                                <th>Balance</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((s, i) => {
                                const concession = s.concessionAmount ?? 0;
                                return (
                                    <tr key={s.assignmentId}>
                                        <td className="nc-sl">{i + 1}</td>
                                        <td className="nc-name">{s.studentName}</td>
                                        <td className="nc-enroll">{s.enrollmentNumber ?? "—"}</td>
                                        <td className="nc-school">{s.schoolName ?? "—"}</td>
                                        <td>{s.className}</td>
                                        <td className="nc-num">₹{fmt(s.totalFee)}</td>
                                        <td className="nc-num concession">
                                            {concession > 0 ? `−₹${fmt(concession)}` : "—"}
                                        </td>
                                        <td className="nc-num">
                                            <span className="nc-bal-due">₹{fmt(s.balance)}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="nc-action-btn active"
                                                onClick={() => setSelected(s)}
                                            >
                                                💰 Collect Now
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