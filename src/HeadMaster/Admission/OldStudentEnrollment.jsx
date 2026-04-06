import { useState } from "react";
import { api } from "../../api";
import "./OldStudentEnrollment.css";

export default function OldStudentEnrollment({ setActivePage }) {
    const [step, setStep] = useState(1);
    const [enrollmentNumber, setEnrollmentNumber] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    const [studentData, setStudentData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [studentTypes, setStudentTypes] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudentType, setSelectedStudentType] = useState("");
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollError, setEnrollError] = useState("");

    const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    // ── Step 1: Search ───────────────────────────────────────────────────────
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!enrollmentNumber.trim()) return;
        setSearchLoading(true);
        setSearchError("");
        setStudentData(null);
        try {
            // Step 1: get student preview + active year in parallel
            const [studentRes, activeYearRes] = await Promise.all([
                api.get(`/student-enrollments/re-enroll-preview/${enrollmentNumber.trim()}`),
                api.get("/academicyears/active"),
            ]);

            const activeYearId = activeYearRes.data.id;

            // Step 2: get classes + student types using active year id
            const [classRes, typeRes] = await Promise.all([
                api.get(`/accounts/class-fees/${activeYearId}`),
                api.get(`/accounts/studenttype-fees/${activeYearId}`),
            ]);

            setStudentData(studentRes.data);

            // Map to shape the dropdowns expect: { id, classCode, fee }
            setClasses(classRes.data.map(c => ({
                id: c.id,
                classCode: c.classCode,
                fee: c.amount,
            })));

            // Map to shape the dropdowns expect: { id, name, fee }
            setStudentTypes(typeRes.data.map(t => ({
                id: t.id,
                name: t.studentTypeName,
                fee: t.amount,
            })));

            setStep(2);
        } catch (err) {
            setSearchError(err.response?.data?.error || "Student not found.");
        } finally {
            setSearchLoading(false);
        }
    };

    // ── Step 2: Re-enroll ────────────────────────────────────────────────────
    const handleReEnroll = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedStudentType) {
            setEnrollError("Please select both class and student type.");
            return;
        }
        setEnrollLoading(true);
        setEnrollError("");
        try {
            await api.post("/student-enrollments/re-enroll", {
                enrollmentNumber: enrollmentNumber.trim(),
                classId: parseInt(selectedClass),
                studentTypeId: parseInt(selectedStudentType),
            });
            setStep(3);
        } catch (err) {
            setEnrollError(err.response?.data?.error || "Re-enrollment failed.");
        } finally {
            setEnrollLoading(false);
        }
    };

    const selectedClassLabel = classes.find(c => c.id === parseInt(selectedClass))?.classCode ?? "";
    const selectedTypeLabel = studentTypes.find(t => t.id === parseInt(selectedStudentType))?.name ?? "";
    const newClassFee = classes.find(c => c.id === parseInt(selectedClass))?.fee ?? 0;
    const newStudentTypeFee = studentTypes.find(t => t.id === parseInt(selectedStudentType))?.fee ?? 0;
    const totalNewFee = newClassFee + newStudentTypeFee + (studentData?.overdueAmount ?? 0);

    const resetAll = () => {
        setStep(1);
        setEnrollmentNumber("");
        setStudentData(null);
        setSelectedClass("");
        setSelectedStudentType("");
        setEnrollError("");
        setSearchError("");
    };

    return (
        <div className="ose-container">

            {/* Header */}
            <div className="ose-header">
                <div>
                    <h2 className="ose-title">Old Student Re-Enrollment</h2>
                    <p className="ose-subtitle">Re-enroll a returning student into the new academic year</p>
                </div>
                <button className="ose-back-btn" onClick={() => setActivePage("dashboard")}>← Back</button>
            </div>

            {/* ══════════ STEP 1 — Search ══════════ */}
            {step === 1 && (
                <div className="ose-card">
                    <div className="ose-card-header">
                        <span className="ose-card-title">🔍 Search Student by Enrollment Number</span>
                    </div>
                    <div className="ose-card-body">
                        <form className="ose-search-row" onSubmit={handleSearch}>
                            <input
                                className="ose-search-input"
                                type="text"
                                placeholder="e.g. SAR00042"
                                value={enrollmentNumber}
                                onChange={e => setEnrollmentNumber(e.target.value.toUpperCase())}
                                required
                            />
                            <button type="submit" className="ose-search-btn" disabled={searchLoading}>
                                {searchLoading ? "Searching…" : "Search"}
                            </button>
                        </form>
                        {searchError && <div className="ose-error">❌ {searchError}</div>}
                    </div>
                </div>
            )}

            {/* ══════════ STEP 2 — Review + Form ══════════ */}
            {step === 2 && studentData && (
                <>
                    {/* Student Info Card */}
                    <div className="ose-card">
                        <div className="ose-card-header">
                            <span className="ose-card-title">👤 Student Details</span>
                            <span className="ose-enroll-no">{studentData.enrollmentNumber}</span>
                        </div>
                        <div className="ose-card-body">
                            <div className="ose-detail-grid">
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Full Name</span>
                                    <span className="ose-dv">{studentData.studentName}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Date of Birth</span>
                                    <span className="ose-dv">{studentData.dateOfBirth}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Gender</span>
                                    <span className="ose-dv">{studentData.gender}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Aadhar Number</span>
                                    <span className="ose-dv">{studentData.aadharNumber || "—"}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Parent / Guardian</span>
                                    <span className="ose-dv">{studentData.parentName}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Contact</span>
                                    <span className="ose-dv">{studentData.contact}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Previous Class</span>
                                    <span className="ose-dv">{studentData.previousClass}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">Previous Academic Year</span>
                                    <span className="ose-dv">{studentData.previousAcademicYear}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">School</span>
                                    <span className="ose-dv">{studentData.schoolName}</span>
                                </div>
                                <div className="ose-detail-pair">
                                    <span className="ose-dk">New Academic Year</span>
                                    <span className="ose-dv ose-highlight">{studentData.newAcademicYear}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overdue Fee Card */}
                    <div className={`ose-card ${studentData.overdueAmount > 0 ? "ose-card-warn" : "ose-card-ok"}`}>
                        <div className="ose-card-header">
                            <span className="ose-card-title">
                                {studentData.overdueAmount > 0
                                    ? "⚠️ Overdue Fees from Previous Year"
                                    : "✅ No Overdue Fees"}
                            </span>
                            {studentData.overdueAmount > 0 && (
                                <span className="ose-overdue-badge">₹{fmt(studentData.overdueAmount)} Pending</span>
                            )}
                        </div>
                        {studentData.overdueAmount > 0 && (
                            <div className="ose-card-body">
                                <div className="ose-overdue-row">
                                    <span>Last year total fee</span>
                                    <span>₹{fmt(studentData.previousTotalFee)}</span>
                                </div>
                                <div className="ose-overdue-row">
                                    <span>Amount paid</span>
                                    <span className="ose-paid">₹{fmt(studentData.previousPaid)}</span>
                                </div>
                                <div className="ose-overdue-divider" />
                                <div className="ose-overdue-row ose-overdue-total">
                                    <span>Overdue carried forward</span>
                                    <span className="ose-due">₹{fmt(studentData.overdueAmount)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* New Enrollment Form */}
                    <form onSubmit={handleReEnroll}>
                        <div className="ose-card">
                            <div className="ose-card-header">
                                <span className="ose-card-title">📋 New Enrollment Details</span>
                                <span className="ose-year-badge">{studentData.newAcademicYear}</span>
                            </div>
                            <div className="ose-card-body">
                                <div className="ose-form-grid">
                                    <div className="ose-field">
                                        <label>New Class <span className="req">*</span></label>
                                        <select
                                            value={selectedClass}
                                            onChange={e => setSelectedClass(e.target.value)}
                                            required
                                        >
                                            <option value="">— Select Class —</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.classCode} {c.fee ? `(₹${fmt(c.fee)})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="ose-field">
                                        <label>Student Type <span className="req">*</span></label>
                                        <select
                                            value={selectedStudentType}
                                            onChange={e => setSelectedStudentType(e.target.value)}
                                            required
                                        >
                                            <option value="">— Select Type —</option>
                                            {studentTypes.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} {t.fee ? `(₹${fmt(t.fee)})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Fee Preview */}
                                {selectedClass && selectedStudentType && (
                                    <div className="ose-fee-preview">
                                        <div className="ose-fee-preview-title">
                                            📊 Fee Preview for {studentData.newAcademicYear}
                                        </div>
                                        <div className="ose-fee-row">
                                            <span>Class Fee ({selectedClassLabel})</span>
                                            <span>₹{fmt(newClassFee)}</span>
                                        </div>
                                        <div className="ose-fee-row">
                                            <span>Student Type Fee ({selectedTypeLabel})</span>
                                            <span>₹{fmt(newStudentTypeFee)}</span>
                                        </div>
                                        {studentData.overdueAmount > 0 && (
                                            <div className="ose-fee-row ose-fee-overdue">
                                                <span>⚠️ Overdue from {studentData.previousAcademicYear}</span>
                                                <span>₹{fmt(studentData.overdueAmount)}</span>
                                            </div>
                                        )}
                                        <div className="ose-fee-divider" />
                                        <div className="ose-fee-row ose-fee-total">
                                            <span>Total Fee Assigned</span>
                                            <span>₹{fmt(totalNewFee)}</span>
                                        </div>
                                    </div>
                                )}

                                {enrollError && (
                                    <div className="ose-error" style={{ marginTop: "0.75rem" }}>
                                        ❌ {enrollError}
                                    </div>
                                )}

                                <div className="ose-actions">
                                    <button type="button" className="ose-cancel-btn" onClick={resetAll}>
                                        ← Search Again
                                    </button>
                                    <button
                                        type="submit"
                                        className="ose-enroll-btn"
                                        disabled={enrollLoading || !selectedClass || !selectedStudentType}
                                    >
                                        {enrollLoading ? "Processing…" : "✅ Re-Enroll Student"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </>
            )}

            {/* ══════════ STEP 3 — Success ══════════ */}
            {step === 3 && (
                <div className="ose-card ose-card-success">
                    <div className="ose-success-body">
                        <div className="ose-success-icon">🎉</div>
                        <h3>Re-Enrollment Successful!</h3>
                        <p>
                            <strong>{studentData?.studentName}</strong> has been re-enrolled into{" "}
                            <strong>{selectedClassLabel}</strong> for{" "}
                            <strong>{studentData?.newAcademicYear}</strong>.
                        </p>
                        {studentData?.overdueAmount > 0 && (
                            <p className="ose-success-note">
                                ₹{fmt(studentData.overdueAmount)} overdue from{" "}
                                {studentData.previousAcademicYear} has been included in the fee assignment.
                            </p>
                        )}
                        <p className="ose-success-note">
                            Total fee assigned: <strong>₹{fmt(totalNewFee)}</strong>
                        </p>
                        <div className="ose-success-actions">
                            <button className="ose-enroll-btn" onClick={resetAll}>
                                Re-Enroll Another Student
                            </button>
                            <button className="ose-cancel-btn" onClick={() => setActivePage("dashboard")}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}