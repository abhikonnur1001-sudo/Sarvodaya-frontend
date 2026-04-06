import React, { useState, useEffect, useRef } from "react";
import "./EnrollmentForm.css";
import { api } from "../../api";

const SCHOOL_NAME = "Sarvodaya Social Welfare and Education Foundation";
const SCHOOL_PLACE = "Bellubbi, Babaleshwer, Vijayapur Karnataka 586113";

const EnrollmentForm = ({ studentId, setActivePage }) => {

    const [academicYear, setAcademicYear] = useState(null);
    const [classes, setClasses] = useState([]);
    const [studentTypes, setStudentTypes] = useState([]);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [result, setResult] = useState(null);
    const [notification, setNotification] = useState(null);
    const [lang, setLang] = useState("en");
    const [letterPrinted, setLetterPrinted] = useState(false);
    const [showLetter, setShowLetter] = useState(false);
    const [prevClassManual, setPrevClassManual] = useState("");

    const letterRef = useRef(null);

    const schoolId = sessionStorage.getItem("schoolId");
    const schoolName = sessionStorage.getItem("school") || SCHOOL_NAME;

    const [formData, setFormData] = useState({
        studentId: studentId || "",
        academicYearId: "",
        schoolId: schoolId || "",
        classId: "",
        studentTypeId: "",
    });

    useEffect(() => {
        if (studentId) setFormData(prev => ({ ...prev, studentId }));
    }, [studentId]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get("/academicyears/active");
                setAcademicYear(res.data);
                setFormData(prev => ({ ...prev, academicYearId: res.data.id }));
            } catch {
                showNotification("error", "Could not load active academic year.");
            }
            try {
                const res = await api.get("/classes");
                setClasses(res.data);
            } catch (err) { console.error("Classes load failed", err); }
            try {
                const res = await api.get("/admin/student-types");
                setStudentTypes(res.data);
            } catch (err) { console.error("Student types load failed", err); }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!studentId) return;
        api.get(`/students/${studentId}`)
            .then(res => setStudentDetails(res.data))
            .catch(err => console.error("Student fetch failed", err));
    }, [studentId]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fullName = (s) =>
        s ? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") : "--";


    // ── getLetter: returns plain HTML strings (no JSX) ─────────────────────
    const getLetter = () => {
        const studentName = [
            studentDetails?.firstName,
            studentDetails?.middleName,
            studentDetails?.lastName,
        ].filter(Boolean).join(" ");

        const school = sessionStorage.getItem("school") || "School Name";
        const prevSch = studentDetails?.prevSchoolName || "[Previous School Name]";
        const prevAddr = studentDetails?.prevSchoolDiceCode || "[Previous School Address]";
        const guardian = studentDetails?.guardianName || "--";
        const satsId = studentDetails?.stsRegNo || "--";
        const ayear = academicYear?.yearName || "--";
        const gender = studentDetails?.gender === 0 ? "his" : "her";
        const genderKn = studentDetails?.gender === 0 ? "ಅವನ" : "ಅವಳ";
        const dateStr = new Date().toLocaleDateString("en-GB");

        if (lang === "kn") {
            return {
                foundationName: "ಸರ್ವೋದಯ ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಮತ್ತು ಶಿಕ್ಷಣ ಪ್ರತಿಷ್ಠಾನ - ಜೈನಾಪುರ",
                tq: "ತಾ: ಬಾಬಲೇಶ್ವರ",
                village: "ಬೆಳ್ಳುಬ್ಬಿ - 586113",
                dist: "ಜಿ: ವಿಜಯಪುರ",
                dateLabel: `ದಿನಾಂಕ: ${dateStr}`,
                to: `<strong>ಗೆ,</strong><br/>ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು/ಪ್ರಾಂಶುಪಾಲರು,<br/>${prevSch},<br/>${prevAddr},<br/>ಕರ್ನಾಟಕ.`,
                subject: `ವಿಷಯ: ${studentName} ಅವರಿಗೆ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ ನೀಡುವ ಕುರಿತು - ವಿನಂತಿ.`,
                body: `<p>ಗೌರವಾನ್ವಿತ ಸರ್/ಮೇಡಂ,</p>
                       <p><strong>${studentName}</strong> ಅವರಿಗೆ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ (TC) ನೀಡಬೇಕೆಂದು ವಿನಂತಿಸುತ್ತೇನೆ. ಅವರು ನಿಮ್ಮ ಸಂಸ್ಥೆಯಲ್ಲಿ <strong>${prevClassManual}</strong> ತರಗತಿಯಲ್ಲಿ ಅಧ್ಯಯನ ಮಾಡಿದ್ದರು.</p>
                       <p>ಈ ವಿದ್ಯಾರ್ಥಿಯು ನಮ್ಮ ಶಾಲೆಯಾದ <strong>${school}</strong> ನಲ್ಲಿ ಪ್ರವೇಶಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದು, ${genderKn} ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ. ಪ್ರವೇಶ ಔಪಚಾರಿಕತೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಮೂಲ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರದ ಅಗತ್ಯವಿದೆ.</p>
                       <p><strong>ವಿದ್ಯಾರ್ಥಿಯ ವಿವರಗಳು:</strong></p>
                       <table class="student-details"><tbody>
                         <tr><td>ಹೆಸರು</td><td>: ${studentName}</td></tr>
                         <tr><td>SATS ID</td><td>: ${satsId}</td></tr>
                         <tr><td>ಶೈಕ್ಷಣಿಕ ವರ್ಷ</td><td>: ${ayear}</td></tr>
                       </tbody></table>
                       <p>ದಯವಿಟ್ಟು ಶೀಘ್ರದಲ್ಲೇ ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರವನ್ನು ನಮ್ಮ ಶಾಲೆಯ ವಿಳಾಸಕ್ಕೆ ಕಳುಹಿಸಿ ಅಥವಾ ಪೋಷಕರು/ಅಧಿಕೃತ ವ್ಯಕ್ತಿ <strong>${guardian}</strong> ಅವರಿಗೆ ನೀಡಿ.</p>
                       <p>ನಿಮ್ಮ ಸಹಕಾರಕ್ಕೆ ಧನ್ಯವಾದಗಳು.</p>`,
                closing: `<p>ವಂದನೆಗಳೊಂದಿಗೆ,</p>
                          <div class="sig"><p>_____________________</p><p><strong>ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು,</strong></p><p>${school},</p><p>ಜೈನಾಪುರ, ಬೆಳಗಾವಿ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ</p></div>`,
            };
        }

        return {
            foundationName: "Sarvodaya Social Welfare and Education Foundation - Jainapur",
            tq: "TQ-Babaleshwer",
            village: "Bellubbi - 586113",
            dist: "DIST:-Vijayapura",
            dateLabel: `Date: ${dateStr}`,
            to: `<strong>To,</strong><br/>The Headmaster/Principal,<br/>${prevSch},<br/>${prevAddr},<br/>Karnataka.`,
            subject: `Subject: Request for issuance of Transfer Certificate for ${studentName} - Reg.`,
            body: `<p>Respected Sir/Madam,</p>
                   <p>I am writing to request the transfer certificate (TC) for <strong>${studentName}</strong>, who was a student in Class <strong>${prevClassManual}</strong> in your esteemed institution.</p>
                   <p>The student has applied for admission to our school, <strong>${school}</strong>, and ${gender} application is currently being processed. To complete the admission formalities and update the student's records, we require the original Transfer Certificate.</p>
                   <p><strong>Student Details:</strong></p>
                   <table class="student-details"><tbody>
                     <tr><td>Name</td><td>: ${studentName}</td></tr>
                     <tr><td>SATS ID</td><td>: ${satsId}</td></tr>
                     <tr><td>Academic Year</td><td>: ${ayear}</td></tr>
                   </tbody></table>
                   <p>Kindly issue the Transfer Certificate at the earliest and send it to our school address or hand it over to the parent/authorized person, <strong>${guardian}</strong>, who is assisting with the admission process.</p>
                   <p>Thank you for your cooperation.</p>`,
            closing: `<p>Sincerely,</p>
                      <div class="sig"><p>_____________________</p><p><strong>Headmaster,</strong></p><p>${school},</p><p>Jainapur, Belagavi District, Karnataka</p></div>`,
        };
    };

    // ── handlePrint ─────────────────────────────────────────────────────────
    const handlePrint = async () => {
        const getBase64FromDomImg = () => new Promise((resolve) => {
            const domImg = document.querySelector(".tc-letter-preview .logo");
            if (domImg && domImg.complete && domImg.naturalWidth > 0) {
                try {
                    const c = document.createElement("canvas");
                    c.width = domImg.naturalWidth;
                    c.height = domImg.naturalHeight;
                    c.getContext("2d").drawImage(domImg, 0, 0);
                    return resolve(c.toDataURL("image/png"));
                } catch { /* tainted canvas, fall through */ }
            }
            const img = new Image();
            img.onload = () => {
                try {
                    const c = document.createElement("canvas");
                    c.width = img.naturalWidth || 200;
                    c.height = img.naturalHeight || 200;
                    c.getContext("2d").drawImage(img, 0, 0);
                    resolve(c.toDataURL("image/png"));
                } catch { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = "/logo.png?" + Date.now();
        });

        const logoBase64 = await getBase64FromDomImg();
        const logoTag = logoBase64
            ? `<img class="logo" src="${logoBase64}" alt="School Logo" />`
            : `<div style="width:72px;height:72px;flex-shrink:0"></div>`;

        const watermark = logoBase64
            ? `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:0;pointer-events:none;">
                 <img src="${logoBase64}" style="width:500px;height:500px;object-fit:contain;opacity:0.10;" />
               </div>`
            : "";

        const l = getLetter();
        const isKannada = lang === "kn";
        const fontImport = isKannada
            ? `@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Kannada:wght@400;700&display=swap');`
            : "";
        const fontFamily = isKannada
            ? `"Noto Serif Kannada", "Times New Roman", serif`
            : `"Times New Roman", serif`;

        const html = `<!DOCTYPE html>
<html>
<head><title>TC Request Letter</title>
<style>
${fontImport}
@page{size:A4;margin:12mm 18mm 12mm 18mm;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:${fontFamily};font-size:12px;color:#000;line-height:1.55;}
.content{position:relative;z-index:1;}
.letter-header{display:flex;align-items:center;gap:14px;margin-bottom:6px;}
.letter-header .logo{width:72px;height:72px;object-fit:contain;flex-shrink:0;}
.letter-header-text{flex:1;}
.foundation-name{font-size:13px;font-weight:bold;margin-bottom:2px;}
.school-name{font-size:20px;font-weight:900;line-height:1.2;margin-bottom:4px;}
.address-row{display:flex;justify-content:space-between;font-size:12px;font-weight:bold;}
.letter-divider{border:none;border-top:3px solid #000;margin:4px 0 10px;}
.letter-date{text-align:right;margin-bottom:12px;}
.letter-to{margin-bottom:10px;line-height:1.7;}
.letter-subject{font-weight:bold;text-decoration:underline;margin-bottom:10px;}
p{margin:0 0 8px;text-align:justify;}
.student-details{margin:4px 0 8px 20px;border-collapse:collapse;}
.student-details td{padding:1px 6px 1px 0;vertical-align:top;}
.student-details td:first-child{font-weight:bold;width:130px;white-space:nowrap;}
.letter-closing{margin-top:12px;}
.sig{margin-top:36px;line-height:1.6;}
.sig p{margin:0;}
</style>
</head>
<body>
${watermark}
<div class="content">
  <div class="letter-header">
    ${logoTag}
    <div class="letter-header-text">
      <div class="foundation-name">${l.foundationName}</div>
      <div class="school-name">${schoolName}</div>
      <div class="address-row">
        <span>${l.tq}</span><span>${l.village}</span><span>${l.dist}</span>
      </div>
    </div>
  </div>
  <div class="letter-divider"></div>
  <div class="letter-date">${l.dateLabel}</div>
  <div class="letter-to">${l.to}</div>
  <div class="letter-subject">${l.subject}</div>
  <div class="letter-body">${l.body}</div>
  <div class="letter-closing">${l.closing}</div>
</div>
</body>
</html>`;

        const win = window.open("", "_blank", "width=850,height=1100");
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.onload = () => { win.focus(); win.print(); win.close(); };
        setTimeout(() => { try { win.focus(); win.print(); win.close(); } catch {_e } }, 1400);

        setLetterPrinted(true);
        showNotification("success", "Letter sent to printer.");
    };

    // ── handleSubmit ────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.classId || !formData.studentTypeId) {
            showNotification("error", "Please select Class and Student Type.");
            return;
        }
        if (!formData.academicYearId) {
            showNotification("error", "Active academic year not loaded. Please refresh.");
            return;
        }
        if (!letterPrinted) {
            showNotification("error", "Please generate and print the TC Request Letter first.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                studentId: Number(formData.studentId),
                academicYearId: Number(formData.academicYearId),
                schoolId: Number(formData.schoolId),
                classId: Number(formData.classId),
                studentTypeId: Number(formData.studentTypeId),
            };
            const res = await api.post("/student-enrollments", payload);
            setResult(res.data);
            setEnrolled(true);
            setNotification({
                type: "success",
                message: res.data.message || "Student enrolled successfully!"
            });
            setTimeout(() => setActivePage("dashboard"), 6000);
        } catch (error) {
            const msg = error.response?.data?.message || "Enrollment failed. Please try again.";
            showNotification("error", msg);
        } finally {
            setLoading(false);
        }
    };

    // ── RENDER ──────────────────────────────────────────────────────────────
    return (
        <div className="enroll-container">

            {/* Page Header */}
            <div className="enroll-header">
                <div>
                    <h2 className="enroll-title">Student Enrollment</h2>
                    <p className="enroll-subtitle">
                        Assign student to a class for the active academic year
                    </p>
                </div>
                <div className="enroll-badge">
                    Status: <span>{enrolled ? (result?.status ?? "Pending") : "Pending"}</span>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`enroll-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* ── Card 1: Student & Academic Year ── */}
                <div className="enroll-card">
                    <div className="enroll-card-title">
                        <span className="card-icon">🎓</span> Student &amp; Academic Year
                    </div>
                    <div className="enroll-row-two">
                        <div className="enroll-field">
                            <label>Student</label>
                            <div className="info-box">
                                {studentDetails ? (
                                    <>
                                        <strong>{fullName(studentDetails)}</strong>
                                        <br />ID: {studentId}
                                        <br />DOB: {studentDetails.dateOfBirth
                                            ? new Date(studentDetails.dateOfBirth).toLocaleDateString("en-GB")
                                            : "—"}
                                    </>
                                ) : (
                                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                                        Loading student…
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="enroll-field">
                            <label>Academic Year</label>
                            <input
                                value={academicYear?.yearName ?? "Loading…"}
                                readOnly tabIndex={-1}
                                style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Card 2: School & Class ── */}
                <div className="enroll-card">
                    <div className="enroll-card-title">
                        <span className="card-icon">🏫</span> School &amp; Class
                    </div>
                    <div className="enroll-row-three">
                        <div className="enroll-field">
                            <label>School</label>
                            <div className="info-box">{schoolName || "—"}</div>
                        </div>
                        <div className="enroll-field">
                            <label>Class / Standard <span className="req">*</span></label>
                            <select
                                name="classId" value={formData.classId}
                                onChange={handleChange} disabled={enrolled} required
                            >
                                <option value="">— Select Class —</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.classCode}</option>
                                ))}
                            </select>
                        </div>
                        <div className="enroll-field">
                            <label>Student Type <span className="req">*</span></label>
                            <select
                                name="studentTypeId" value={formData.studentTypeId}
                                onChange={handleChange} disabled={enrolled} required
                            >
                                <option value="">— Select Type —</option>
                                {studentTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Card 3: TC Request Letter ── */}
                {!enrolled && (
                    <div className="enroll-card tc-letter-card">
                        <div className="enroll-card-title">
                            <span className="card-icon">📄</span> TC Request Letter
                            {letterPrinted && (
                                <span className="tc-printed-badge">✅ Printed</span>
                            )}
                        </div>

                        <p className="tc-hint">
                            Enter the student's last attended class at previous school,
                            then generate and print the letter before confirming enrollment.
                        </p>

                        {/* Previous class input */}
                        <div className="enroll-row-two" style={{ marginBottom: "14px" }}>
                            <div className="enroll-field">
                                <label>
                                    Last Class at Previous School <span className="req">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 5th Standard / Class V"
                                    value={prevClassManual}
                                    onChange={e => setPrevClassManual(e.target.value)}
                                    disabled={letterPrinted}
                                />
                            </div>
                        </div>

                        {/* Generate button */}
                        {!showLetter ? (
                            <button
                                type="button"
                                className="tc-generate-btn"
                                onClick={() => {
                                    if (!prevClassManual.trim()) {
                                        showNotification("error",
                                            "Please enter last class at previous school.");
                                        return;
                                    }
                                    setShowLetter(true);
                                }}
                            >
                                Generate Letter
                            </button>
                        ) : (
                            <>
                                {/* Language Toggle */}
                                <div className="lang-toggle-row">
                                    <span className="lang-label">Letter Language:</span>
                                    <div className="lang-toggle">
                                        <button
                                            type="button"
                                            className={`lang-btn${lang === "en" ? " active" : ""}`}
                                            onClick={() => { setLang("en"); setLetterPrinted(false); }}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            className={`lang-btn${lang === "kn" ? " active" : ""}`}
                                            onClick={() => { setLang("kn"); setLetterPrinted(false); }}
                                        >
                                            ಕನ್ನಡ
                                        </button>
                                    </div>
                                </div>

                                {/* Letter Preview */}
                                {(() => {
                                    const l = getLetter();
                                    return (
                                        <div className="tc-letter-preview" ref={letterRef}>
                                            <div className="letter-header">
                                                <img
                                                    className="logo"
                                                    src="/logo.png"
                                                    alt="School Logo"
                                                    onError={e => e.target.style.display = "none"}
                                                />
                                                <div className="letter-header-text">
                                                    <div className="foundation-name">
                                                        {l.foundationName}
                                                    </div>
                                                    <div className="school-name">
                                                        {schoolName || "School Name"}
                                                    </div>
                                                    <div className="address-row">
                                                        <span>{l.tq}</span>
                                                        <span>{l.village}</span>
                                                        <span>{l.dist}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="letter-divider"></div>

                                            <div className="letter-date">{l.dateLabel}</div>

                                            <div
                                                className="letter-to"
                                                dangerouslySetInnerHTML={{ __html: l.to }}
                                            />
                                            <div
                                                className="letter-subject"
                                                dangerouslySetInnerHTML={{ __html: l.subject }}
                                            />
                                            <div
                                                className="letter-body"
                                                dangerouslySetInnerHTML={{ __html: l.body }}
                                            />
                                            <div
                                                className="letter-closing"
                                                dangerouslySetInnerHTML={{ __html: l.closing }}
                                            />
                                        </div>
                                    );
                                })()}

                                {/* Print & Edit buttons */}
                                <div className="tc-letter-actions">
                                    <button
                                        type="button"
                                        className="tc-print-btn"
                                        onClick={handlePrint}
                                    >
                                        🖨️ Print Letter
                                    </button>
                                    {!letterPrinted && (
                                        <button
                                            type="button"
                                            className="tc-edit-btn"
                                            onClick={() => setShowLetter(false)}
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Result Card ── */}
                {enrolled && result && (
                    <div className="enroll-card enroll-info-card">
                        <div className="enroll-card-title">
                            <span className="card-icon">✅</span> Enrollment Confirmed
                        </div>
                        <div className="enroll-row-three">
                            <div className="enroll-field">
                                <label>Enrollment No.</label>
                                <div className="info-box">
                                    <strong style={{ fontSize: "15px", color: "#166534" }}>
                                        {result.enrollmentNumber}
                                    </strong>
                                </div>
                            </div>
                            <div className="enroll-field">
                                <label>Status</label>
                                <div className="info-box status-pending">
                                    <strong>{result.status}</strong>
                                </div>
                            </div>
                            <div className="enroll-field">
                                <label>Total Fee Assigned</label>
                                <div className="info-box">
                                    <strong style={{ fontSize: "15px", color: "#166534" }}>
                                        ₹ {Number(result.totalFee).toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            </div>
                        </div>
                        <p style={{
                            fontSize: "12px", color: "#94a3b8",
                            textAlign: "right", margin: "10px 0 0"
                        }}>
                            Redirecting to dashboard in a few seconds…
                        </p>
                    </div>
                )}

                {/* ── Actions ── */}
                <div className="enroll-actions">
                    <button
                        type="button"
                        className="enroll-back-btn"
                        onClick={() => setActivePage("students")}
                        disabled={loading}
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        className={`enroll-confirm-btn${!letterPrinted && !enrolled ? " enroll-confirm-disabled" : ""}`}
                        disabled={loading || enrolled || !letterPrinted}
                        title={!letterPrinted ? "Print TC Request Letter first" : ""}
                    >
                        {loading
                            ? "Enrolling…"
                            : enrolled
                                ? "Enrolled ✓"
                                : !letterPrinted
                                    ? "🔒 Print Letter to Unlock"
                                    : "Confirm Enrollment"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EnrollmentForm;