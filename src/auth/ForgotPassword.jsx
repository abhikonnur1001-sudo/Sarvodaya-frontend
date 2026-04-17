import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./ForgotPassword.css";

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getStrength = (p) => {
        if (!p) return { label: "", width: "0%", cls: "" };
        if (p.length < 6) return { label: "Weak", width: "30%", cls: "fp-str-weak" };
        if (p.length < 10) return { label: "Medium", width: "65%", cls: "fp-str-medium" };
        return { label: "Strong", width: "100%", cls: "fp-str-strong" };
    };
    const str = getStrength(newPassword);

    // ── Send OTP ──────────────────────────────────────
    const sendOtp = async () => {
        setError("");
        if (!identifier.trim()) {
            setError("Please enter your Username, Email or User ID.");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/auth/forgot-password", { username: identifier });

            console.log("Response:", res.data);          // ✅ debug
            console.log("Username:", res.data.username); // ✅ debug

            // ✅ Replace email/userId with real username from backend
            if (res.data.username) {
                setIdentifier(res.data.username);
            }

            setOtpSent(true);
            setOtp(""); // ✅ clear old OTP on resend
            setSuccess("OTP sent! Check your registered email inbox.");
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setError(err.response?.data || "Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Reset Password ────────────────────────────────
    const resetPassword = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        console.log("Resetting with username:", identifier); // ✅ debug
        console.log("OTP:", otp);

        if (!otp || otp.length !== 6) { setError("Enter the 6-digit OTP."); return; }
        if (!newPassword) { setError("Enter a new password."); return; }
        if (newPassword.length < 6) { setError("Password must be at least 6 chars."); return; }
        if (newPassword !== confirmPass) { setError("Passwords do not match."); return; }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                username: identifier,
                otp,
                newPassword
            });
            setSuccess("Password reset successfully! Redirecting to login…");
            setTimeout(() => window.location.href = "/login", 2000);
        } catch (err) {
            setError(err.response?.data || "Reset failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fp-page">
            <div className="fp-card">

                {/* Header */}
                <div className="fp-card-header">
                    <div className="fp-lock-icon">🔑</div>
                    <h2>Forgot Password?</h2>
                    <p>Enter your details, request an OTP and reset your password</p>
                </div>

                <form className="fp-form-area" onSubmit={resetPassword}>

                    {/* ── Identifier ── */}
                    <div className="fp-field">
                        <label>Username / Email / User ID</label>
                        <div className="fp-input-wrap">
                            <span className="fp-input-icon">👤</span>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    setOtpSent(false); // ✅ reset if user changes input
                                    setOtp("");
                                }}
                                placeholder="e.g. john.doe or ADM001 or john@sarvodaya.edu"
                                className={`fp-input ${error && !identifier ? "error" : ""}`}
                                disabled={loading}
                            />
                        </div>
                        <small className="fp-hint">
                            Enter any one — username, registered email, or User ID
                        </small>
                    </div>

                    {/* ── Send OTP Button ── */}
                    <div className="fp-otp-row">
                        <button
                            type="button"
                            className={`fp-otp-btn ${otpSent ? "sent" : ""}`}
                            onClick={sendOtp}
                            disabled={loading} // ✅ allow resend — no otpSent block
                        >
                            {loading
                                ? "Sending…"
                                : otpSent
                                    ? "✅ OTP Sent — Resend?"
                                    : "Send OTP →"
                            }
                        </button>
                    </div>

                    {/* ── Divider ── */}
                    {otpSent && <div className="fp-divider">Enter OTP & New Password</div>}

                    {/* ── OTP + Password fields ── */}
                    {otpSent && (
                        <>
                            {/* OTP */}
                            <div className="fp-field">
                                <label>OTP Code <span className="fp-req">*</span></label>
                                <div className="fp-input-wrap">
                                    <span className="fp-input-icon">🔢</span>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                                        placeholder="Enter 6-digit OTP"
                                        className="fp-input fp-otp-input"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="fp-field">
                                <label>New Password <span className="fp-req">*</span></label>
                                <div className="fp-input-wrap">
                                    <span className="fp-input-icon">🔒</span>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="fp-input"
                                    />
                                    <button type="button" className="fp-eye"
                                        onClick={() => setShowPass(!showPass)}>
                                        {showPass ? "hide" : "👁️"}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="fp-strength">
                                        <div className="fp-strength-bar">
                                            <div className={`fp-strength-fill ${str.cls}`}
                                                style={{ width: str.width }} />
                                        </div>
                                        <span className={`fp-strength-label ${str.cls}`}>
                                            {str.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="fp-field">
                                <label>Confirm Password <span className="fp-req">*</span></label>
                                <div className="fp-input-wrap">
                                    <span className="fp-input-icon">🔒</span>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className={`fp-input ${confirmPass && confirmPass !== newPassword
                                                ? "error" : ""
                                            }`}
                                    />
                                </div>
                                {confirmPass && confirmPass !== newPassword &&
                                    <small className="fp-field-err">Passwords do not match</small>}
                                {confirmPass && confirmPass === newPassword &&
                                    <small className="fp-field-ok">✅ Passwords match</small>}
                            </div>

                            {/* Submit */}
                            <button type="submit" className="fp-btn" disabled={loading}>
                                {loading ? "Resetting…" : "Reset Password ✓"}
                            </button>
                        </>
                    )}

                    {/* Alerts */}
                    {error && <div className="fp-alert error">⚠️ {error}</div>}
                    {success && <div className="fp-alert success">✅ {success}</div>}

                    {/* Back to Login */}
                    <div className="fp-back">
                        Remember your password?
                        <Link to="/login"> Back to Login</Link>
                    </div>

                </form>
            </div>
        </div>
    );
}