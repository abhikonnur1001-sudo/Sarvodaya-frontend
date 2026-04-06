import React, { useState, useEffect } from "react";
import { api } from "../../api";
import "./UpdateAdditionalFee.css";

const UpdateAdditionalFee = ({ userRole }) => {
    const canAssign = ["Administrator", "HeadMaster"].includes(userRole);

    const [students, setStudents]           = useState([]);
    const [feeTypes, setFeeTypes]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [notification, setNotification]   = useState(null);

    // fee count per enrollment — { [enrollmentNumber]: count }
    const [feeCounts, setFeeCounts]         = useState({});

    // Search / filter
    const [search, setSearch]               = useState("");
    const [filterClass, setFilterClass]     = useState("");
    const [filterSchool, setFilterSchool]   = useState("");

    // Selected student panel
    const [selected, setSelected]           = useState(null);
    const [feeSelections, setFeeSelections] = useState({});
    const [saving, setSaving]               = useState(false);

    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3500);
    };

    // ── Load students + fee types + fee counts on mount ───────────────────
    useEffect(() => {
        Promise.all([
            api.get("/additional-fees/enrolled-students"),
            api.get("/additional-fees"),
        ])
            .then(async ([sRes, fRes]) => {
                setStudents(sRes.data);
                setFeeTypes(fRes.data);

                // Load fee count for each student
                const counts = {};
                await Promise.all(
                    sRes.data.map(async (s) => {
                        try {
                            const r = await api.get(
                                `/additional-fees/student/${s.enrollmentNumber}`
                            );
                            counts[s.enrollmentNumber] = r.data.length;
                        } catch {
                            counts[s.enrollmentNumber] = 0;
                        }
                    })
                );
                setFeeCounts(counts);
            })
            .catch(() => notify("error", "Failed to load data."))
            .finally(() => setLoading(false));
    }, []);

    // ── Open panel for a student ──────────────────────────────────────────
    const openPanel = async (student) => {
        // Toggle close
        if (selected?.enrollmentNumber === student.enrollmentNumber) {
            setSelected(null);
            setFeeSelections({});
            return;
        }
        try {
            const aRes = await api.get(
                `/additional-fees/student/${student.enrollmentNumber}`
            );
            const assigned = aRes.data;

            const sel = {};
            feeTypes.forEach(ft => {
                const existing = assigned.find(a => a.additionalFeeId === ft.id);
                sel[ft.id] = {
                    checked:      !!existing,
                    amount:       existing ? existing.amount : ft.amount,
                    remarks:      existing ? (existing.remarks || "") : "",
                    isPaid:       existing?.isPaid || false,
                    assignmentId: existing?.id || null,
                };
            });

            setFeeSelections(sel);
            setSelected(student);
        } catch {
            notify("error", "Could not load student fees.");
        }
    };

    const toggleFee = (feeId) => {
        if (feeSelections[feeId]?.isPaid) return;
        setFeeSelections(prev => ({
            ...prev,
            [feeId]: { ...prev[feeId], checked: !prev[feeId].checked },
        }));
    };

    const updateField = (feeId, field, value) => {
        setFeeSelections(prev => ({
            ...prev,
            [feeId]: { ...prev[feeId], [field]: value },
        }));
    };

    // ── Save ──────────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (!selected) return;
        setSaving(true);
        const toAssign = feeTypes.filter(ft => {
            const s = feeSelections[ft.id];
            return s.checked && !s.assignmentId;
        });
        const toRemove = feeTypes.filter(ft => {
            const s = feeSelections[ft.id];
            return !s.checked && s.assignmentId && !s.isPaid;
        });
        try {
            for (const ft of toAssign) {
                const s = feeSelections[ft.id];
                await api.post("/additional-fees/assign", {
                    enrollmentNumber: selected.enrollmentNumber,
                    additionalFeeId:  ft.id,
                    customAmount:     s.amount ? Number(s.amount) : null,
                    remarks:          s.remarks || null,
                });
            }
            for (const ft of toRemove) {
                await api.delete(
                    `/additional-fees/assignment/${feeSelections[ft.id].assignmentId}`
                );
            }

            // Update fee count badge locally
            const newCount = Object.values({
                ...feeSelections,
                ...Object.fromEntries(
                    toAssign.map(ft => [ft.id, { ...feeSelections[ft.id], assignmentId: true, checked: true }])
                ),
                ...Object.fromEntries(
                    toRemove.map(ft => [ft.id, { ...feeSelections[ft.id], assignmentId: null, checked: false }])
                )
            }).filter(s => s.checked).length;

            setFeeCounts(prev => ({
                ...prev,
                [selected.enrollmentNumber]: newCount,
            }));

            notify("success",
                toAssign.length + toRemove.length === 0
                    ? "No changes to save."
                    : `Updated: ${toAssign.length} assigned, ${toRemove.length} removed.`
            );

            // Refresh panel
            await openPanel(selected);
        } catch (err) {
            notify("error", err.response?.data?.message || "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────
    const classes = [...new Set(students.map(s => s.classCode))].sort();
    const schools = [...new Set(students.map(s => s.schoolName))].sort();

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return (
            (!q || s.enrollmentNumber.toLowerCase().includes(q) ||
                   s.studentName.toLowerCase().includes(q)) &&
            (!filterClass  || s.classCode  === filterClass) &&
            (!filterSchool || s.schoolName === filterSchool)
        );
    });

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="uaf-container">

            <div className="uaf-header">
                <h2 className="uaf-title">📋 Additional Fee Assignment</h2>
                <p className="uaf-subtitle">
                    Select a student to assign or update their additional fees.
                </p>
            </div>

            {notification && (
                <div className={`uaf-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.msg}
                </div>
            )}

            {/* Filters */}
            <div className="uaf-filters">
                <input
                    className="uaf-search"
                    type="text"
                    placeholder="🔍 Search name or enrollment…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="uaf-select" value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="uaf-select" value={filterSchool}
                    onChange={e => setFilterSchool(e.target.value)}>
                    <option value="">All Schools</option>
                    {schools.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Student Table */}
            {loading ? (
                <div className="uaf-loading">Loading students…</div>
            ) : filtered.length === 0 ? (
                <div className="uaf-empty">No students found.</div>
            ) : (
                <div className="uaf-table-wrap">
                    <table className="uaf-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Enrollment No.</th>
                                <th>Student Name</th>
                                <th>Class</th>
                                <th>School</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, idx) => {
                                const count      = feeCounts[s.enrollmentNumber] ?? 0;
                                const hasAny     = count > 0;
                                const isOpen     = selected?.enrollmentNumber === s.enrollmentNumber;

                                return (
                                    <React.Fragment key={s.enrollmentNumber}>
                                        <tr className={`uaf-row${isOpen ? " uaf-row-active" : ""}`}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <span className="uaf-enroll-badge">
                                                    {s.enrollmentNumber}
                                                </span>
                                            </td>
                                            <td>{s.studentName}</td>
                                            <td>{s.classCode}</td>
                                            <td>{s.schoolName}</td>
                                            <td className="uaf-action-cell">
                                                {/* ONE conditional button */}
                                                {canAssign && (
                                                    isOpen ? (
                                                        <button
                                                            className="uaf-btn uaf-btn-close"
                                                            onClick={() => openPanel(s)}
                                                        >
                                                            ▲ Close
                                                        </button>
                                                    ) : hasAny ? (
                                                        <button
                                                            className="uaf-btn uaf-btn-addfee"
                                                            onClick={() => openPanel(s)}
                                                            title={`${count} fee(s) already assigned`}
                                                        >
                                                            ➕ Add Fee
                                                            <span className="uaf-count-badge">{count}</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="uaf-btn uaf-btn-assign"
                                                            onClick={() => openPanel(s)}
                                                        >
                                                            🎯 Assign Fee
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>

                                        {/* Inline Fee Panel */}
                                        {isOpen && (
                                            <tr className="uaf-panel-row">
                                                <td colSpan={6}>
                                                    <div className="uaf-panel">
                                                        <div className="uaf-panel-title">
                                                            Additional Fees for{" "}
                                                            <strong>{s.studentName}</strong>
                                                            <span className="uaf-enroll-badge" style={{ marginLeft: 10 }}>
                                                                {s.enrollmentNumber}
                                                            </span>
                                                        </div>

                                                        {feeTypes.length === 0 ? (
                                                            <div className="uaf-empty">
                                                                No fee types created yet. Go to Fee Types tab first.
                                                            </div>
                                                        ) : (
                                                            <table className="uaf-fee-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Assign</th>
                                                                        <th>Code</th>
                                                                        <th>Fee Name</th>
                                                                        <th>Amount (₹)</th>
                                                                        <th>Remarks</th>
                                                                        <th>Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {feeTypes.map(ft => {
                                                                        const sel = feeSelections[ft.id] || {};
                                                                        return (
                                                                            <tr
                                                                                key={ft.id}
                                                                                className={sel.isPaid ? "uaf-paid-row" : ""}
                                                                            >
                                                                                <td>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="uaf-checkbox"
                                                                                        checked={!!sel.checked}
                                                                                        onChange={() => toggleFee(ft.id)}
                                                                                        disabled={sel.isPaid}
                                                                                        title={sel.isPaid ? "Already paid — cannot remove" : ""}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <span className="fee-code-badge">
                                                                                        {ft.code}
                                                                                    </span>
                                                                                </td>
                                                                                <td>{ft.name}</td>
                                                                                <td>
                                                                                    <input
                                                                                        type="number"
                                                                                        className="uaf-amount-input"
                                                                                        value={sel.amount ?? ft.amount}
                                                                                        min="1"
                                                                                        onChange={e => updateField(ft.id, "amount", e.target.value)}
                                                                                        disabled={!sel.checked || sel.isPaid}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="uaf-remarks-input"
                                                                                        placeholder="Optional"
                                                                                        value={sel.remarks ?? ""}
                                                                                        onChange={e => updateField(ft.id, "remarks", e.target.value)}
                                                                                        disabled={!sel.checked || sel.isPaid}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    {sel.assignmentId ? (
                                                                                        <span className={`status-badge ${sel.isPaid ? "paid" : "pending"}`}>
                                                                                            {sel.isPaid ? "✅ Paid" : "⏳ Pending"}
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="status-badge new">— New</span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        )}

                                                        {canAssign && feeTypes.length > 0 && (
                                                            <div className="uaf-panel-footer">
                                                                <button
                                                                    className="uaf-update-btn"
                                                                    onClick={handleUpdate}
                                                                    disabled={saving}
                                                                >
                                                                    {saving ? "Saving…" : "💾 Update Fees"}
                                                                </button>
                                                                <span className="uaf-hint">
                                                                    ✅ Paid fees cannot be removed.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UpdateAdditionalFee;