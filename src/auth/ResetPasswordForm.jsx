import { useState } from "react";
import axios from "axios";

export default function ResetPasswordForm({ username, onSuccess }) {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showPass, setShowPass] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        if (!otp || otp.length !== 6) { setError("Enter the 6-digit OTP."); return; }
        if (!newPassword) { setError("Enter a new password."); return; }
        if (newPassword.length < 6) { setError("Password must be at least 6 chars."); return; }
        if (newPassword !== confirmPass) { setError("Passwords do not match."); return; }

        setLoading(true);
        try {
            await axios.post("/api/auth/reset-password", { username, otp, newPassword });
            setSuccess("Password reset successfully! Redirecting to login…");
            setTimeout(onSuccess, 2000);
        } catch (err) {
            setError(err.response?.data || "Reset failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="fp-form" onSubmit={handleSubmit}>

            {/* OTP */}
            <div className="fp-field">
                <label>OTP Code</label>
                <div className="fp-input-wrap">
                    <span className="fp-input-icon">🔢</span>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                        placeholder="Enter 6-digit OTP"
                        className="fp-input fp-otp"
                    />
                </div>
            </div>

            {/* New Password */}
            <div className="fp-field">
                <label>New Password</label>
                <div className="fp-input-wrap">
                    <span className="fp-input-icon">🔒</span>
                    <input
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="fp-input"
                    />
                    <button type="button" className="fp-eye" onClick={() => setShowPass(!showPass)}>
                        {showPass ? "🙈" : "👁️"}
                    </button>
                </div>
                {newPassword && (
                    <div className="fp-strength">
                        <div className="fp-strength-bar">
                            <div className={`fp-strength-fill ${str.cls}`} style={{ width: str.width }} />
                        </div>
                        <span className={`fp-strength-label ${str.cls}`}>{str.label}</span>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="fp-field">
                <label>Confirm Password</label>
                <div className="fp-input-wrap">
                    <span className="fp-input-icon">🔒</span>
                    <input
                        type={showPass ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`fp-input ${confirmPass && confirmPass !== newPassword ? "error" : ""}`}
                    />
                </div>
                {confirmPass && confirmPass !== newPassword &&
                    <small className="fp-field-err">Passwords do not match</small>}
                {confirmPass && confirmPass === newPassword &&
                    <small className="fp-field-ok">✅ Passwords match</small>}
            </div>

            {error && <div className="fp-alert error">⚠️ {error}</div>}
            {success && <div className="fp-alert success">✅ {success}</div>}

            <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? "Resetting…" : "Reset Password ✓"}
            </button>

        </form>
    );
}