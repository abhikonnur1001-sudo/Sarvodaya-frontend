import { useState } from "react";
import { api } from "../api";

export default function UpdateUser({ goBack }) {

    const [form, setForm] = useState({
        userId: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        address: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const updateUser = async () => {

        try {

            await api.put("/auth/update-user", form);

            setMessage("User updated successfully");

        } catch {

            setMessage("Error updating user");

        }

    };

    return (

        <div className="add-user-container">

            <h2>Update User</h2>

            <div className="add-user-form">

                <input
                    name="userId"
                    placeholder="User ID"
                    value={form.userId}
                    onChange={handleChange}
                />

                <input
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                />

                <input
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange}
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <textarea
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                />

                <button className="create-user-btn" onClick={updateUser}>
                    Update User
                </button>

                <button className="back-btn" onClick={goBack}>
                    Back
                </button>

                {message && <p>{message}</p>}

            </div>

        </div>

    );

}