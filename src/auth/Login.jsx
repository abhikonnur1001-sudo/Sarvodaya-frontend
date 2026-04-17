import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ single import
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "./authService";
import { enterFullscreen } from "../utils/fullscreen";
import "./Login.css";

export default function Login() {
    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        let text = "";
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return text;
    };

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [captchaInput, setCaptchaInput] = useState("");
    const [error, setError] = useState("");
    const [captcha, setCaptcha] = useState(() => generateCaptcha());

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim() || !captchaInput.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        if (captchaInput.trim().toLowerCase() !== captcha.toLowerCase()) {
            setError("Invalid captcha.");
            refreshCaptcha();
            return;
        }

        try {
            const role = await login(username, password);
            await enterFullscreen();

            if (role === "Administrator") navigate("/administrator", { replace: true });
            else if (role === "HeadMaster") navigate("/headmaster", { replace: true });
            else if (role === "Accounts") navigate("/accounts", { replace: true });
            else if (role === "Faculty") navigate("/faculty", { replace: true });
            else {
                setError("Unknown role. Contact admin.");
                refreshCaptcha();
            }

        } catch {
            setError("Invalid username or password.");
            refreshCaptcha();
        }
    };

    return (
        <div className="login-page">
            <div className="login-shell">
                <div className="login-left">
                    <div className="brand-badge">🎓</div>
                    <img src="/logo.png" alt="Sarvodaya logo" className="school-logo" />
                    <h1>Sarvodaya Group of Institutions</h1>
                    <p className="brand-text">
                        Manage students, teachers, attendance, fees, reports, and academic
                        activities from one secure portal.
                    </p>
                    <div className="motto-box">Knowledge is power</div>
                    <ul className="feature-list">
                        <li>Student and staff record management</li>
                        <li>Attendance and academic monitoring</li>
                        <li>Role-based secure access</li>
                    </ul>
                </div>

                <div className="login-right">
                    <form className="login-card" onSubmit={submit}>
                        <p className="welcome-tag">School ERP Portal</p>
                        <h2>Welcome back</h2>
                        <p className="login-subtext">Please sign in to continue</p>

                        {error && <div className="error-box">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                className="login-input"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="login-input password-input"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Captcha</label>
                            <div className="captcha-row">
                                <div className="captcha-box">{captcha}</div>
                                <button
                                    type="button"
                                    className="refresh-btn"
                                    onClick={refreshCaptcha}
                                    aria-label="Refresh captcha"
                                >
                                    ↻
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="captchaInput">Enter Captcha</label>
                            <input
                                id="captchaInput"
                                type="text"
                                className="login-input"
                                placeholder="Type captcha"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                            />
                        </div>

                        <div className="login-actions">
                            <button type="submit" className="login-btn">
                                Login
                            </button>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div> {/* ✅ closes login-actions only */}

                        <p className="contact-text">New user? Contact admin</p>
                    </form>
                </div>
            </div>
        </div>
    );
}