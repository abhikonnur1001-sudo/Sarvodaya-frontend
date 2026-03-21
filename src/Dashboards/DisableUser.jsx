import React, { useState } from "react";
import { api } from "../api";

export default function DisableUser({ goBack }) {
    const [userId, setUserId] = useState("");
    const [confirmUserId, setConfirmUserId] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleDisableUser = async () => {
        setMessage("");

        if (userId !== confirmUserId) {
            setMessage("User IDs do not match");
            return;
        }

        try {
            await api.put("/auth/disable-user", {
                userId: userId,
                adminPassword: adminPassword
            });

            setMessage("User disabled successfully");
            setUserId("");
            setConfirmUserId("");
            setAdminPassword("");

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to disable user"
            );
        }
    };

    return (
        <div className="form-container">
            <h2>Disable User</h2>

            <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />

            <input
                type="text"
                placeholder="Confirm User ID"
                value={confirmUserId}
                onChange={(e) => setConfirmUserId(e.target.value)}
            />

            <input
                type="password"
                placeholder="Enter Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
            />

            <button className="danger-btn" onClick={handleDisableUser}>
                Disable User
            </button>

            <button className="secondary-btn" onClick={goBack}>
                Back
            </button>

            {message && <p className="message">{message}</p>}
        </div>
    );
}