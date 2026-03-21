import { useState } from "react";
import { api } from "../api";

export default function EnableUser({ goBack }) {

    const [userId, setUserId] = useState("");
    const [confirmUserId, setConfirmUserId] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [message, setMessage] = useState("");

    const enableUser = async () => {

        if (!userId || !confirmUserId || !adminPassword) {
            setMessage("Please fill all fields");
            return;
        }

        if (userId !== confirmUserId) {
            setMessage("User IDs do not match");
            return;
        }

        try {

            await api.put(`/auth/enable-user?userId=${userId}&adminPassword=${adminPassword}`);

            setMessage("User enabled successfully");

        } catch (err) {

            console.error(err);
            setMessage("Error enabling user");

        }
    };

    return (
        <div className="add-user-container">

            <h2>Enable User</h2>

            <div className="add-user-form">

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

                <button
                    className="create-user-btn"
                    onClick={enableUser}
                >
                    Enable User
                </button>

                <button
                    className="back-btn"
                    onClick={goBack}
                >
                    Back
                </button>

                {message && <p>{message}</p>}

            </div>

        </div>
    );
}