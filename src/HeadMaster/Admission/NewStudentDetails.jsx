import React, { useState, useRef, useEffect } from "react";
import "./NewStudentDetails.css";
import { api } from "../../api";

const STEPS = [
    { id: 1, label: "Registration" },
    { id: 2, label: "Personal" },
    { id: 3, label: "Address" },
    { id: 4, label: "Parents" },
    { id: 5, label: "Prev. School" },
    { id: 6, label: "Other" },
];

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const toApiDate = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
};

const NewStudentDetails = ({ setActivePage }) => {

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [studentSaved, setStudentSaved] = useState(false);
    const [savedStudentId, setSavedStudentId] = useState(null);
    const [errors, setErrors] = useState({});
    const [photoPickerTarget, setPhotoPickerTarget] = useState(null);
    const [webcamOpen, setWebcamOpen] = useState(false);
    const [webcamTarget, setWebcamTarget] = useState(null);

    const studentPhotoRef = useRef(null);
    const fatherPhotoRef = useRef(null);
    const motherPhotoRef = useRef(null);
    const studentCameraRef = useRef(null);
    const fatherCameraRef = useRef(null);
    const motherCameraRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const cameraRefs = { studentPhoto: studentCameraRef, fatherPhoto: fatherCameraRef, motherPhoto: motherCameraRef };
    const browseRefs = { studentPhoto: studentPhotoRef, fatherPhoto: fatherPhotoRef, motherPhoto: motherPhotoRef };

    const [formData, setFormData] = useState({
        stsRegNo: "", tcNumber: "", admissionDate: "",
        studentPhoto: null, studentPhotoPreview: null,
        firstName: "", middleName: "", lastName: "",
        gender: "", dateOfBirth: "", placeOfBirth: "",
        adharNo: "", phoneNo: "", email: "",
        studentCast: "", studentCastCertNo: "",
        houseNo: "", streetName: "", locationVillage: "",
        subDistTq: "", district: "", state: "", pincode: "",
        fatherName: "", fatherAdharNo: "", fatherPhoneNo: "",
        fatherEmail: "", fatherCast: "", fatherCastCertNo: "",
        fatherPhoto: null, fatherPhotoPreview: null,
        motherName: "", motherAdharNo: "", motherPhoneNo: "",
        motherEmail: "", motherCast: "", motherCastCertNo: "",
        motherPhoto: null, motherPhotoPreview: null,
        prevSchoolName: "", prevSchoolDiceCode: "", transferLetterNo: "",
        transferLetterDate: "", prevSyllabus: "", prevSchoolCategory: "",
        motherTongue: "", teachingMedium: "", bplCardHolder: false,
        specialNeed: "", rationCardNumber: "", exploitGroup: "",
        bhagyaLaxmiBondNo: "", earlyLateAdmissionReason: "",
    });

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (_err) {
            alert(`Camera error: ${_err.message || "Access denied or camera not available."}`);
            setWebcamOpen(false);
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setWebcamOpen(false);
        setWebcamTarget(null);
    };

    const captureSnapshot = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext("2d").drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const file = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
            const preview = URL.createObjectURL(blob);
            setFormData(prev => ({
                ...prev,
                [webcamTarget]: file,
                [`${webcamTarget}Preview`]: preview,
            }));
            stopWebcam();
        }, "image/jpeg", 0.92);
    };

    useEffect(() => {
        if (webcamOpen) startWebcam();
    }, [webcamOpen]);

    const openCamera = (fieldName) => {
        setPhotoPickerTarget(null);
        if (isMobile) {
            cameraRefs[fieldName].current.click();
        } else {
            setWebcamTarget(fieldName);
            setWebcamOpen(true);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handlePhoto = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, [fieldName]: file, [`${fieldName}Preview`]: preview }));
        e.target.value = "";
    };

    const showNotif = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const validateStep = () => {
        const e = {};
        if (currentStep === 2) {
            if (!formData.firstName.trim()) e.firstName = "First name is required";
            if (!formData.lastName.trim()) e.lastName = "Last name is required";
            if (!formData.gender) e.gender = "Gender is required";
            if (!formData.dateOfBirth) e.dateOfBirth = "Date of birth is required";
        }
        if (currentStep === 3) {
            if (!formData.pincode.trim()) e.pincode = "Pincode is required";
        }
        if (currentStep === 4) {
            if (!formData.fatherName.trim()) e.fatherName = "Father name is required";
            if (!formData.motherName.trim()) e.motherName = "Mother name is required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) { setErrors({}); setCurrentStep(s => Math.min(s + 1, 6)); }
    };

    const prevStep = () => {
        setErrors({});
        setCurrentStep(s => Math.max(s - 1, 1));
    };

    // ✅ No event param — called directly via onClick only
    const handleSubmit = async () => {
        if (currentStep !== 6) return;
        try {
            setLoading(true);
            const form = new FormData();
            const fieldMap = {
                StsRegNo: formData.stsRegNo,
                TcNumber: formData.tcNumber,
                AdmissionDate: formData.admissionDate || null,
                FirstName: formData.firstName,
                MiddleName: formData.middleName,
                LastName: formData.lastName,
                Gender: formData.gender,
                DateOfBirth: toApiDate(formData.dateOfBirth),
                PlaceOfBirth: formData.placeOfBirth,
                AdharNo: formData.adharNo,
                PhoneNo: formData.phoneNo,
                Email: formData.email,
                StudentCast: formData.studentCast,
                StudentCastCertNo: formData.studentCastCertNo,
                HouseNo: formData.houseNo,
                StreetName: formData.streetName,
                LocationVillage: formData.locationVillage,
                SubDistTq: formData.subDistTq,
                District: formData.district,
                State: formData.state,
                Pincode: formData.pincode,
                FatherName: formData.fatherName,
                FatherAdharNo: formData.fatherAdharNo,
                FatherPhoneNo: formData.fatherPhoneNo,
                FatherEmail: formData.fatherEmail,
                FatherCast: formData.fatherCast,
                FatherCastCertNo: formData.fatherCastCertNo,
                MotherName: formData.motherName,
                MotherAdharNo: formData.motherAdharNo,
                MotherPhoneNo: formData.motherPhoneNo,
                MotherEmail: formData.motherEmail,
                MotherCast: formData.motherCast,
                MotherCastCertNo: formData.motherCastCertNo,
                PrevSchoolName: formData.prevSchoolName,
                PrevSchoolDiceCode: formData.prevSchoolDiceCode,
                TransferLetterNo: formData.transferLetterNo,
                TransferLetterDate: formData.transferLetterDate || null,
                PrevSyllabus: formData.prevSyllabus,
                PrevSchoolCategory: formData.prevSchoolCategory,
                MotherTongue: formData.motherTongue,
                TeachingMedium: formData.teachingMedium,
                BplCardHolder: formData.bplCardHolder,
                SpecialNeed: formData.specialNeed,
                RationCardNumber: formData.rationCardNumber,
                ExploitGroup: formData.exploitGroup,
                BhagyaLaxmiBondNo: formData.bhagyaLaxmiBondNo,
                EarlyLateAdmissionReason: formData.earlyLateAdmissionReason,
            };
            Object.entries(fieldMap).forEach(([key, val]) => {
                if (val !== null && val !== undefined && val !== "") form.append(key, val);
            });
            if (formData.studentPhoto) form.append("StudentPhoto", formData.studentPhoto);
            if (formData.fatherPhoto) form.append("FatherPhoto", formData.fatherPhoto);
            if (formData.motherPhoto) form.append("MotherPhoto", formData.motherPhoto);

            const res = await api.post("/students", form, { headers: { "Content-Type": "multipart/form-data" } });
            setSavedStudentId(res.data.id);
            setStudentSaved(true);
            showNotif(res.data.alreadyExists ? "warning" : "success", res.data.message);
        } catch (err) {
            console.error(err);
            showNotif("error", err.response?.data?.message || "Failed to create student");
        } finally {
            setLoading(false);
        }
    };

    const Err = ({ field }) =>
        errors[field] ? <span className="nsd-error">{errors[field]}</span> : null;

    const PhotoBox = ({ label, preview, fieldName }) => (
        <div className="nsd-photo-box" onClick={() => setPhotoPickerTarget(fieldName)}>
            {preview ? (
                <img src={preview} alt={label} />
            ) : (
                <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>{label}</span>
                </>
            )}
        </div>
    );

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="nsd-container">

            {/* hidden file inputs */}
            <input ref={studentPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhoto(e, "studentPhoto")} />
            <input ref={fatherPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhoto(e, "fatherPhoto")} />
            <input ref={motherPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhoto(e, "motherPhoto")} />
            <input ref={studentCameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handlePhoto(e, "studentPhoto")} />
            <input ref={fatherCameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handlePhoto(e, "fatherPhoto")} />
            <input ref={motherCameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handlePhoto(e, "motherPhoto")} />

            {/* header */}
            <div className="nsd-header">
                <div>
                    <h1 className="nsd-title">New Student Admission</h1>
                    <p className="nsd-breadcrumb">Admission / <span>New Student</span></p>
                </div>
                {studentSaved && (
                    <button type="button" className="nsd-btn nsd-btn--teal"
                        onClick={() => setActivePage("enrollment", { studentId: savedStudentId })}>
                        Proceed to Enroll →
                    </button>
                )}
            </div>

            {/* stepper */}
            <div className="nsd-stepper">
                {STEPS.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div
                            className={`nsd-step ${currentStep === step.id ? "nsd-step--active" : ""} ${currentStep > step.id ? "nsd-step--done" : ""}`}
                            onClick={() => setCurrentStep(step.id)}
                        >
                            <div className="nsd-step__circle">
                                {currentStep > step.id
                                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    : step.id}
                            </div>
                            <span className="nsd-step__label">{step.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`nsd-step__line ${currentStep > step.id ? "nsd-step__line--done" : ""}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* notification */}
            {notification && (
                <div className={`nsd-notification nsd-notification--${notification.type}`}>
                    <span className="nsd-notification__icon">
                        {notification.type === "success" && "✓"}
                        {notification.type === "warning" && "⚠"}
                        {notification.type === "error" && "✕"}
                    </span>
                    {notification.message}
                </div>
            )}

            {/* ✅ Changed <form> to <div> — no accidental submits ever */}
            <div className="nsd-form">

                {/* STEP 1 */}
                {currentStep === 1 && (
                    <div className="nsd-card">
                        <div className="nsd-card__head">
                            <span className="nsd-card__dot" style={{ background: "#006494" }}></span>
                            Step 1 — Registration Details
                        </div>
                        <div className="nsd-card__body">
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>STS Reg. No</label>
                                    <input name="stsRegNo" value={formData.stsRegNo} onChange={handleChange} placeholder="STS registration number" />
                                </div>
                                <div className="nsd-field">
                                    <label>TC Number</label>
                                    <input name="tcNumber" value={formData.tcNumber} onChange={handleChange} placeholder="Transfer certificate no." />
                                </div>
                                <div className="nsd-field">
                                    <label>Admission Date</label>
                                    <input name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} max={today} />
                                </div>
                            </div>
                            <div className="nsd-row-1" style={{ marginTop: 14 }}>
                                <div className="nsd-field">
                                    <label>Student Photo</label>
                                    <PhotoBox label="Upload Photo" preview={formData.studentPhotoPreview} fieldName="studentPhoto" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                    <div className="nsd-card">
                        <div className="nsd-card__head">
                            <span className="nsd-card__dot" style={{ background: "#01696f" }}></span>
                            Step 2 — Personal Information
                        </div>
                        <div className="nsd-card__body">
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>First Name <em>*</em></label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange}
                                        placeholder="e.g. Ravi" className={errors.firstName ? "nsd-input--error" : ""} />
                                    <Err field="firstName" />
                                </div>
                                <div className="nsd-field">
                                    <label>Middle Name</label>
                                    <input name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Father name" />
                                </div>
                                <div className="nsd-field">
                                    <label>Last Name <em>*</em></label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange}
                                        placeholder="e.g. Kumar" className={errors.lastName ? "nsd-input--error" : ""} />
                                    <Err field="lastName" />
                                </div>
                            </div>
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Date of Birth <em>*</em></label>
                                    <input name="dateOfBirth" type="date" value={formData.dateOfBirth}
                                        onChange={handleChange} max={today}
                                        className={errors.dateOfBirth ? "nsd-input--error" : ""} />
                                    <Err field="dateOfBirth" />
                                </div>
                                <div className="nsd-field">
                                    <label>Gender <em>*</em></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}
                                        className={errors.gender ? "nsd-input--error" : ""}>
                                        <option value="">Select</option>
                                        <option value="0">Male</option>
                                        <option value="1">Female</option>
                                    </select>
                                    <Err field="gender" />
                                </div>
                                <div className="nsd-field">
                                    <label>Place of Birth</label>
                                    <input name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} placeholder="City / Village" />
                                </div>
                            </div>
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Aadhar No.</label>
                                    <input name="adharNo" value={formData.adharNo} onChange={handleChange} placeholder="12-digit Aadhar" />
                                </div>
                                <div className="nsd-field">
                                    <label>Phone No.</label>
                                    <input name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="Student phone" />
                                </div>
                                <div className="nsd-field">
                                    <label>Email</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@email.com" />
                                </div>
                            </div>
                            <div className="nsd-row-2">
                                <div className="nsd-field">
                                    <label>Caste</label>
                                    <input name="studentCast" value={formData.studentCast} onChange={handleChange} placeholder="e.g. OBC, SC, ST, General" />
                                </div>
                                <div className="nsd-field">
                                    <label>Caste Certificate No.</label>
                                    <input name="studentCastCertNo" value={formData.studentCastCertNo} onChange={handleChange} placeholder="Certificate number" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                    <div className="nsd-card">
                        <div className="nsd-card__head">
                            <span className="nsd-card__dot" style={{ background: "#da7101" }}></span>
                            Step 3 — Address
                        </div>
                        <div className="nsd-card__body">
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>House No.</label>
                                    <input name="houseNo" value={formData.houseNo} onChange={handleChange} placeholder="House / Flat no." />
                                </div>
                                <div className="nsd-field">
                                    <label>Street Name</label>
                                    <input name="streetName" value={formData.streetName} onChange={handleChange} placeholder="Street / Road" />
                                </div>
                                <div className="nsd-field">
                                    <label>Location / Village</label>
                                    <input name="locationVillage" value={formData.locationVillage} onChange={handleChange} placeholder="Village / Locality" />
                                </div>
                            </div>
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Sub-District / Taluka</label>
                                    <input name="subDistTq" value={formData.subDistTq} onChange={handleChange} placeholder="Taluka / Sub-dist" />
                                </div>
                                <div className="nsd-field">
                                    <label>District</label>
                                    <input name="district" value={formData.district} onChange={handleChange} placeholder="District" />
                                </div>
                                <div className="nsd-field">
                                    <label>State</label>
                                    <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                                </div>
                            </div>
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Pincode <em>*</em></label>
                                    <input name="pincode" value={formData.pincode} onChange={handleChange}
                                        placeholder="560001" className={errors.pincode ? "nsd-input--error" : ""} />
                                    <Err field="pincode" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                    <>
                        <div className="nsd-card">
                            <div className="nsd-card__head">
                                <span className="nsd-card__dot" style={{ background: "#437a22" }}></span>
                                Father Details
                            </div>
                            <div className="nsd-card__body">
                                <div className="nsd-parent-row">
                                    <PhotoBox label="Father Photo" preview={formData.fatherPhotoPreview} fieldName="fatherPhoto" />
                                    <div className="nsd-fields">
                                        <div className="nsd-row-3">
                                            <div className="nsd-field" style={{ gridColumn: "1 / span 2" }}>
                                                <label>Father Name <em>*</em></label>
                                                <input name="fatherName" value={formData.fatherName} onChange={handleChange}
                                                    placeholder="Full name" className={errors.fatherName ? "nsd-input--error" : ""} />
                                                <Err field="fatherName" />
                                            </div>
                                            <div className="nsd-field">
                                                <label>Aadhar No.</label>
                                                <input name="fatherAdharNo" value={formData.fatherAdharNo} onChange={handleChange} placeholder="Aadhar number" />
                                            </div>
                                        </div>
                                        <div className="nsd-row-3">
                                            <div className="nsd-field">
                                                <label>Phone</label>
                                                <input name="fatherPhoneNo" value={formData.fatherPhoneNo} onChange={handleChange} placeholder="Phone number" />
                                            </div>
                                            <div className="nsd-field">
                                                <label>Email</label>
                                                <input name="fatherEmail" type="email" value={formData.fatherEmail} onChange={handleChange} placeholder="Email" />
                                            </div>
                                            <div className="nsd-field">
                                                <label>Caste</label>
                                                <input name="fatherCast" value={formData.fatherCast} onChange={handleChange} placeholder="Caste" />
                                            </div>
                                        </div>
                                        <div className="nsd-row-1">
                                            <div className="nsd-field">
                                                <label>Caste Certificate No.</label>
                                                <input name="fatherCastCertNo" value={formData.fatherCastCertNo} onChange={handleChange} placeholder="Certificate number" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="nsd-card">
                            <div className="nsd-card__head">
                                <span className="nsd-card__dot" style={{ background: "#a12c7b" }}></span>
                                Mother Details
                            </div>
                            <div className="nsd-card__body">
                                <div className="nsd-parent-row">
                                    <PhotoBox label="Mother Photo" preview={formData.motherPhotoPreview} fieldName="motherPhoto" />
                                    <div className="nsd-fields">
                                        <div className="nsd-row-3">
                                            <div className="nsd-field" style={{ gridColumn: "1 / span 2" }}>
                                                <label>Mother Name <em>*</em></label>
                                                <input name="motherName" value={formData.motherName} onChange={handleChange}
                                                    placeholder="Full name" className={errors.motherName ? "nsd-input--error" : ""} />
                                                <Err field="motherName" />
                                            </div>
                                            <div className="nsd-field">
                                                <label>Aadhar No.</label>
                                                <input name="motherAdharNo" value={formData.motherAdharNo} onChange={handleChange} placeholder="Aadhar number" />
                                            </div>
                                        </div>
                                        <div className="nsd-row-3">
                                            <div className="nsd-field">
                                                <label>Phone</label>
                                                <input name="motherPhoneNo" value={formData.motherPhoneNo} onChange={handleChange} placeholder="Phone number" />
                                            </div>
                                            <div className="nsd-field">
                                                <label>Email</label>
                                                <input name="motherEmail" type="email" value={formData.motherEmail} onChange={handleChange} placeholder="Email" />
                                            </div>
                                            <div className="nsd-field">
                                                <label>Caste</label>
                                                <input name="motherCast" value={formData.motherCast} onChange={handleChange} placeholder="Caste" />
                                            </div>
                                        </div>
                                        <div className="nsd-row-1">
                                            <div className="nsd-field">
                                                <label>Caste Certificate No.</label>
                                                <input name="motherCastCertNo" value={formData.motherCastCertNo} onChange={handleChange} placeholder="Certificate number" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                    <div className="nsd-card">
                        <div className="nsd-card__head">
                            <span className="nsd-card__dot" style={{ background: "#d19900" }}></span>
                            Step 5 — Previous School
                        </div>
                        <div className="nsd-card__body">
                            <div className="nsd-row-2">
                                <div className="nsd-field">
                                    <label>School Name</label>
                                    <input name="prevSchoolName" value={formData.prevSchoolName} onChange={handleChange} placeholder="Previous school name" />
                                </div>
                                <div className="nsd-field">
                                    <label>DICE Code</label>
                                    <input name="prevSchoolDiceCode" value={formData.prevSchoolDiceCode} onChange={handleChange} placeholder="DICE / UDISE code" />
                                </div>
                            </div>
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Transfer Letter No.</label>
                                    <input name="transferLetterNo" value={formData.transferLetterNo} onChange={handleChange} placeholder="TC letter number" />
                                </div>
                                <div className="nsd-field">
                                    <label>Transfer Letter Date</label>
                                    <input name="transferLetterDate" type="date" value={formData.transferLetterDate} onChange={handleChange} max={today} />
                                </div>
                                <div className="nsd-field">
                                    <label>Syllabus</label>
                                    <input name="prevSyllabus" value={formData.prevSyllabus} onChange={handleChange} placeholder="e.g. CBSE, State Board" />
                                </div>
                            </div>
                            <div className="nsd-row-2">
                                <div className="nsd-field">
                                    <label>School Category</label>
                                    <input name="prevSchoolCategory" value={formData.prevSchoolCategory} onChange={handleChange} placeholder="e.g. Govt, Private, Aided" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 6 */}
                {currentStep === 6 && (
                    <div className="nsd-card">
                        <div className="nsd-card__head">
                            <span className="nsd-card__dot" style={{ background: "#7a39bb" }}></span>
                            Step 6 — Other Details
                        </div>
                        <div className="nsd-card__body">
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Mother Tongue</label>
                                    <input name="motherTongue" value={formData.motherTongue} onChange={handleChange} placeholder="e.g. Kannada, Hindi" />
                                </div>
                                <div className="nsd-field">
                                    <label>Teaching Medium</label>
                                    <input name="teachingMedium" value={formData.teachingMedium} onChange={handleChange} placeholder="e.g. Kannada, English" />
                                </div>
                                <div className="nsd-field">
                                    <label>Ration Card No.</label>
                                    <input name="rationCardNumber" value={formData.rationCardNumber} onChange={handleChange} placeholder="Ration card number" />
                                </div>
                            </div>
                            <div className="nsd-row-3">
                                <div className="nsd-field">
                                    <label>Special Need</label>
                                    <input name="specialNeed" value={formData.specialNeed} onChange={handleChange} placeholder="If any disability / CWSN" />
                                </div>
                                <div className="nsd-field">
                                    <label>Exploit Group</label>
                                    <input name="exploitGroup" value={formData.exploitGroup} onChange={handleChange} placeholder="Social group" />
                                </div>
                                <div className="nsd-field">
                                    <label>Bhagya Laxmi Bond No.</label>
                                    <input name="bhagyaLaxmiBondNo" value={formData.bhagyaLaxmiBondNo} onChange={handleChange} placeholder="Bond number" />
                                </div>
                            </div>
                            <div className="nsd-row-1">
                                <div className="nsd-field">
                                    <label>Early / Late Admission Reason</label>
                                    <input name="earlyLateAdmissionReason" value={formData.earlyLateAdmissionReason}
                                        onChange={handleChange} placeholder="Reason if admission is early or late" />
                                </div>
                            </div>
                            <div className="nsd-checkbox-row">
                                <input type="checkbox" id="bplCard" name="bplCardHolder"
                                    checked={formData.bplCardHolder} onChange={handleChange} />
                                <label htmlFor="bplCard">BPL Card Holder</label>
                            </div>
                        </div>
                    </div>
                )}

                {/* navigation */}
                <div className="nsd-actions">
                    <button
                        type="button"
                        className="nsd-btn nsd-btn--ghost"
                        onClick={currentStep === 1 ? () => setActivePage("dashboard") : prevStep}
                    >
                        {currentStep === 1 ? "Cancel" : "← Back"}
                    </button>
                    <div className="nsd-actions__right">
                        {currentStep < 6 ? (
                            <button type="button" className="nsd-btn nsd-btn--primary" onClick={nextStep}>
                                Next →
                            </button>
                        ) : (
                            // ✅ type="button" + onClick — never auto-submits
                            <button
                                type="button"
                                className="nsd-btn nsd-btn--primary"
                                onClick={handleSubmit}
                                disabled={loading || studentSaved}
                            >
                                {loading ? "Saving…" : studentSaved ? "Saved ✓" : "Save Student"}
                            </button>
                        )}
                    </div>
                </div>

            </div>{/* end nsd-form div */}

            {/* photo picker popup */}
            {photoPickerTarget && (
                <div className="nsd-picker-overlay" onClick={() => setPhotoPickerTarget(null)}>
                    <div className="nsd-picker" onClick={(e) => e.stopPropagation()}>
                        <p className="nsd-picker__title">Choose Photo Source</p>
                        <button type="button" className="nsd-picker__btn" onClick={() => openCamera(photoPickerTarget)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                            Take Photo (Camera)
                        </button>
                        <button type="button" className="nsd-picker__btn" onClick={() => {
                            browseRefs[photoPickerTarget].current.click();
                            setPhotoPickerTarget(null);
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                            Browse from Files
                        </button>
                        <button type="button" className="nsd-picker__cancel" onClick={() => setPhotoPickerTarget(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* webcam popup (desktop) */}
            {webcamOpen && (
                <div className="nsd-picker-overlay" onClick={stopWebcam}>
                    <div className="nsd-webcam" onClick={(e) => e.stopPropagation()}>
                        <p className="nsd-picker__title">Take Photo</p>
                        <div className="nsd-webcam__viewport">
                            <video ref={videoRef} autoPlay playsInline muted className="nsd-webcam__video" />
                        </div>
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        <div className="nsd-webcam__actions">
                            <button type="button" className="nsd-btn nsd-btn--primary" onClick={captureSnapshot}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                </svg>
                                Capture
                            </button>
                            <button type="button" className="nsd-btn nsd-btn--ghost" onClick={stopWebcam}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NewStudentDetails;