import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPasswordForm({ onSuccess }) {
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");

        if (!identifier.trim()) {
            setError("Please enter your Username, Email or User ID.");
            return;
        }

        setLoading(true);
        try {
            await axios.post("/api/auth/forgot-password", { username: identifier });
            setInfo("OTP sent successfully! Check your registered email inbox.");
            setTimeout(() => onSuccess(identifier), 1800);
        } catch (err) {
            setError(err.response?.data || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="fp-form" onSubmit={handleSubmit}>

            <div className="fp-field">
                <label>Username / Email / User ID</label>
                <div className="fp-input-wrap">
                    <span className="fp-input-icon">👤</span>
                    <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. john.doe or ADM001 or john@sarvodaya.edu"
                        className={error ? "fp-input error" : "fp-input"}
                    />
                </div>
                <small className="fp-hint">
                    Enter any one — your username, registered email, or User ID
                </small>
            </div>

            {error && <div className="fp-alert error">⚠️ {error}</div>}
            {info && <div className="fp-alert success">✅ {info}</div>}

            <button type="submit" className="fp-btn" disabled={loading}>
                {loading
                    ? <span className="fp-spinner">Sending OTP…</span>
                    : "Send OTP →"
                }
            </button>

            <div className="fp-back">
                Remember your password?
                <Link to="/login"> Back to Login</Link>
            </div>

        </form>
    );
}