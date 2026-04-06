import React, { useState, useEffect } from "react";
import "./StudentPage.css";
import { api } from "../../api";

const StudentPage = ({ setActivePage }) => {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/students/unenrolled");
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to load students", err);
            setError("Failed to load students. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (studentId) => {
        setDeletingId(studentId);
        try {
            await api.delete("/students/" + studentId);
            setStudents(prev => prev.filter(s => s.studentId !== studentId));
            showNotification("success", "Student deleted successfully.");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete student.";
            showNotification("error", msg);
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    const filtered = students.filter(s => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const full = [s.firstName, s.middleName, s.lastName]
            .filter(Boolean).join(" ").toLowerCase();
        return full.includes(q) ||
            String(s.studentId).includes(q) ||
            (s.locationVillage || "").toLowerCase().includes(q);
    });

    const fullName = (s) =>
        [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-GB") : "--";

    return (
        <div className="sp-container">

            {/* Header */}
            <div className="sp-header">
                <div>
                    <h2 className="sp-title">Students</h2>
                    <p className="sp-subtitle">
                        {loading
                            ? "Loading..."
                            : filtered.length + " student(s) not yet enrolled this year"}
                    </p>
                </div>
                <button
                    type="button"
                    className="sp-btn-primary"
                    onClick={() => setActivePage("newStudent")}
                >
                    + Add New Student
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={"sp-notification sp-notification--" + notification.type}>
                    {notification.type === "success" ? "Deleted successfully." : notification.message}
                </div>
            )}

            {/* Search */}
            <div className="sp-search-wrap">
                <input
                    type="text"
                    className="sp-search"
                    placeholder="Search by name, ID or village..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        type="button"
                        className="sp-search-clear"
                        onClick={() => setSearch("")}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Error */}
            {error && <div className="sp-error">{error}</div>}

            {/* Skeleton */}
            {loading && (
                <div className="sp-table-wrap">
                    <table className="sp-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Student</th><th>ID</th>
                                <th>Date of Birth</th><th>Gender</th>
                                <th>Phone</th><th>Village</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                                        <td key={j}><div className="sp-skeleton"></div></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <>
                    {filtered.length === 0 ? (
                        <div className="sp-empty">
                            <div className="sp-empty-icon">&#128100;</div>
                            <h3>
                                {search
                                    ? "No students match your search"
                                    : "All students are enrolled!"}
                            </h3>
                            <p>
                                {search
                                    ? "Try a different name or village."
                                    : "Every student has been enrolled for the current academic year."}
                            </p>
                            {search && (
                                <button
                                    type="button"
                                    className="sp-btn-ghost"
                                    onClick={() => setSearch("")}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="sp-table-wrap">
                            <table className="sp-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student</th>
                                        <th>ID</th>
                                        <th>Date of Birth</th>
                                        <th>Gender</th>
                                        <th>Phone</th>
                                        <th>Village</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s, index) => (
                                        <tr key={s.studentId}>
                                            <td className="sp-td-num">{index + 1}</td>

                                            <td>
                                                <div className="sp-name-cell">
                                                    <div className="sp-avatar">
                                                        {s.firstName
                                                            ? s.firstName[0].toUpperCase()
                                                            : "S"}
                                                    </div>
                                                    <span className="sp-name">{fullName(s)}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="sp-id-tag">#{s.studentId}</span>
                                            </td>

                                            <td>{formatDate(s.dateOfBirth)}</td>

                                            <td>
                                                <span className={"sp-gender sp-gender--" +
                                                    (s.gender === 0 ? "male" : "female")}>
                                                    {s.gender === 0 ? "Male" : "Female"}
                                                </span>
                                            </td>

                                            <td>{s.phoneNumber || "--"}</td>
                                            <td>{s.locationVillage || "--"}</td>

                                            <td>
                                                <div className="sp-actions">

                                                    {/* Proceed to Enrollment */}
                                                    <button
                                                        type="button"
                                                        className="sp-enroll-btn"
                                                        onClick={() =>
                                                            setActivePage("enrollment", {
                                                                studentId: s.studentId
                                                            })
                                                        }
                                                    >
                                                        Enroll
                                                    </button>

                                                    {/* Delete — show confirm inline */}
                                                    {confirmId === s.studentId ? (
                                                        <div className="sp-confirm-row">
                                                            <span className="sp-confirm-text">Sure?</span>
                                                            <button
                                                                type="button"
                                                                className="sp-confirm-yes"
                                                                disabled={deletingId === s.studentId}
                                                                onClick={() => handleDelete(s.studentId)}
                                                            >
                                                                {deletingId === s.studentId
                                                                    ? "Deleting..."
                                                                    : "Yes, Delete"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="sp-confirm-no"
                                                                onClick={() => setConfirmId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="sp-delete-btn"
                                                            onClick={() => setConfirmId(s.studentId)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="sp-footer">
                            Showing {filtered.length} of {students.length} unenrolled students
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentPage;