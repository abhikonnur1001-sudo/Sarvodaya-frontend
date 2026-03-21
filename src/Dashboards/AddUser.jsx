import React, { useState } from "react";
import { api } from "../api";

const AddUser = ({ goBack }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        dateOfBirth: "",
        role: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem("token");
            const role = sessionStorage.getItem("role");

            console.log("Token:", token);
            console.log("Role:", role);

            const payload = {
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                address: formData.address,
                dateOfBirth: formData.dateOfBirth,
                role: Number(formData.role),
            };

            const response = await api.post("/auth/create-user", payload);

            alert(response.data.message || "User created successfully");
        } catch (error) {
            console.error("Full error:", error);
            console.error("Response data:", error?.response?.data);
            console.error("Response status:", error?.response?.status);
            alert(error?.response?.data || "Failed to create user");
        }
    };


    return (
        <div className="add-user-container">
            <h2>Add New User</h2>

            <form className="add-user-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="User ID will be generated automatically"
                    disabled
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="" disabled>Select Role</option>
                    <option value="0">Admin</option>
                    <option value="1">HeadMaster</option>
                    <option value="3">Faculty</option>
                    <option value="2">Accountant</option>
                </select>

                <textarea
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                ></textarea>

                <button type="submit" className="create-user-btn">
                    Create User
                </button>

                <button
                    type="button"
                    className="back-btn"
                    onClick={goBack}
                >
                    Back to Dashboard
                </button>
            </form>
        </div>
    );
};

export default AddUser;
