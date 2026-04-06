import React, { useState, useEffect } from "react";
import "./StudentList.css";
import { api } from "../../api";

const StudentList = ({ setActivePage }) => {

    const [enrollments, setEnrollments] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchEnrollment, setSearchEnrollment] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterClass, setFilterClass] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const enrRes = await api.get("/student-enrollments");
                const data = enrRes.data;
                setEnrollments(data);

                // Build unique schools list from enrollment data
                const schoolMap = {};
                data.forEach(e => {
                    if (e.schoolId && e.schoolName) {
                        schoolMap[e.schoolId] = e.schoolName;
                    }
                });
                setSchools(
                    Object.entries(schoolMap).map(([id, name]) => ({
                        id: Number(id),
                        name
                    }))
                );

                // Build unique classes list from enrollment data
                const classMap = {};
                data.forEach(e => {
                    if (e.classId && e.className) {
                        classMap[e.classId] = {
                            id: e.classId,
                            name: e.className,
                            schoolId: e.schoolId
                        };
                    }
                });
                setClasses(Object.values(classMap));

            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load student list. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // When school filter changes, reset class filter
    const handleSchoolChange = (e) => {
        setFilterSchool(e.target.value);
        setFilterClass("");
    };

    // Classes filtered by selected school
    const filteredClasses = filterSchool
        ? classes.filter(c => String(c.schoolId) === String(filterSchool))
        : classes;

    // Student rows filtered
    const filtered = enrollments.filter(e => {
        const matchEnrollment = searchEnrollment.trim() === "" ||
            (e.enrollmentNumber || "").toLowerCase()
                .includes(searchEnrollment.trim().toLowerCase());

        const matchSchool = filterSchool === "" ||
            String(e.schoolId) === String(filterSchool);

        const matchClass = filterClass === "" ||
            String(e.classId) === String(filterClass);

        return matchEnrollment && matchSchool && matchClass;
    });

    const handleClearFilters = () => {
        setSearchEnrollment("");
        setFilterSchool("");
        setFilterClass("");
    };

    const hasActiveFilter = searchEnrollment || filterSchool || filterClass;

    const fullName = (e) =>
        [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-GB") : "--";

    return (
        <div className="sl-container">

            {/* Header */}
            <div className="sl-header">
                <div>
                    <h2 className="sl-title">Students</h2>
                    <p className="sl-subtitle">
                        {loading ? "Loading..." : filtered.length + " student(s) found"}
                    </p>
                </div>
                <button
                    type="button"
                    className="sl-btn-primary"
                    onClick={() => setActivePage("newStudent")}
                >
                    + Add New Student
                </button>
            </div>

            {/* Filters */}
            <div className="sl-filters">

                {/* Search */}
                <div className="sl-filter-field">
                    <label>Search Enrollment No.</label>
                    <input
                        type="text"
                        placeholder="e.g. SAR00001"
                        value={searchEnrollment}
                        onChange={e => setSearchEnrollment(e.target.value)}
                    />
                </div>

                {/* School dropdown */}
                <div className="sl-filter-field">
                    <label>School</label>
                    <select value={filterSchool} onChange={handleSchoolChange}>
                        <option value="">All Schools</option>
                        {schools.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Class dropdown — filtered by selected school */}
                <div className="sl-filter-field">
                    <label>Class</label>
                    <select
                        value={filterClass}
                        onChange={e => setFilterClass(e.target.value)}
                        disabled={filteredClasses.length === 0}
                    >
                        <option value="">
                            {filterSchool
                                ? filteredClasses.length === 0
                                    ? "No classes found"
                                    : "All Classes"
                                : "All Classes"}
                        </option>
                        {filteredClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Clear */}
                {hasActiveFilter && (
                    <div className="sl-filter-field sl-filter-clear">
                        <label>&nbsp;</label>
                        <button type="button" className="sl-btn-ghost" onClick={handleClearFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}

            </div>

            {/* Error */}
            {error && <div className="sl-error">{error}</div>}

            {/* Skeleton */}
            {loading && (
                <div className="sl-table-wrap">
                    <table className="sl-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Name</th><th>Enrollment No.</th>
                                <th>Class</th><th>School</th><th>Gender</th>
                                <th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                                        <td key={j}><div className="sl-skeleton"></div></td>
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
                        <div className="sl-empty">
                            <div className="sl-empty-icon">&#128100;</div>
                            <h3>No students found</h3>
                            <p>
                                {hasActiveFilter
                                    ? "No students match your filters. Try clearing them."
                                    : "No students have been enrolled yet."}
                            </p>
                            {hasActiveFilter && (
                                <button type="button" className="sl-btn-ghost" onClick={handleClearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="sl-table-wrap">
                            <table className="sl-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Enrollment No.</th>
                                        <th>Class</th>
                                        <th>School</th>
                                        <th>Gender</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((e, index) => (
                                        <tr key={e.enrollmentId}>
                                            <td className="sl-td-num">{index + 1}</td>

                                            <td>
                                                <div className="sl-name-cell">
                                                    <div className="sl-avatar">
                                                        {e.firstName ? e.firstName[0].toUpperCase() : "S"}
                                                    </div>
                                                    <div>
                                                        <div className="sl-name">{fullName(e)}</div>
                                                        <div className="sl-dob">{formatDate(e.dateOfBirth)}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="sl-enroll-tag">
                                                    {e.enrollmentNumber}
                                                </span>
                                            </td>

                                            <td>{e.className || "--"}</td>
                                            <td>{e.schoolName || "--"}</td>

                                            <td>
                                                <span className={"sl-gender sl-gender--" +
                                                    (e.gender === 0 ? "male" : "female")}>
                                                    {e.gender === 0 ? "Male" : "Female"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={"sl-status sl-status--" +
                                                    (e.status || "pending").toLowerCase()}>
                                                    {e.status || "Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="sl-actions">
                                                    <button
                                                        type="button"
                                                        className="sl-action-btn sl-action-view"
                                                        onClick={() => setActivePage("viewStudent", { studentId: e.studentId })}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={"sl-action-btn " +
                                                            (e.status === "Authenticated"
                                                                ? "sl-action-authenticated"
                                                                : "sl-action-enroll")}
                                                        disabled={e.status === "Authenticated"}
                                                        onClick={() => {
                                                            if (e.status !== "Authenticated") {
                                                                setActivePage("authenticateEnrollment", {
                                                                    enrollmentId: e.enrollmentId
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {e.status === "Authenticated" ? "Verified" : "Authenticate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="sl-footer">
                            Showing {filtered.length} of {enrollments.length} students
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentList;