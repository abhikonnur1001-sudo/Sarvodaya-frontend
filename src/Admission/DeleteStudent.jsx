import React, { useState } from "react";
import { api } from "../api";

const DeleteStudent = () => {
    const [studentId, setStudentId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔍 Fetch student details
    const fetchStudent = async () => {
        if (!studentId || !firstName||!lastName) {
            alert("Please enter Student ID and Name");
            return;
        }

        try {
            setLoading(true);

            const res = await api.get("/students/verify-delete", {
                params: {
                    id: studentId,
                    firstName: firstName,
                    lastName: lastName,
                },
            });

            setStudentData(res.data);

        } catch (err) {
            console.error(err); // ✅ no ESLint warning
            alert("Student not found or name mismatch");
            setStudentData(null);
        } finally {
            setLoading(false);
        }
    };

    // ❌ Delete student
    const deleteStudent = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/students/${studentId}`);

            alert("Student deleted successfully");

            // reset form
            setStudentId("");
            setFirstName("");
            setLastName("");
            setStudentData(null);

        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Remove Student</h2>

            {/* Input Section */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="number"
                    placeholder="Enter Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    style={{ marginRight: "10px" }}
                />

                <input
                    type="text"
                    placeholder="Enter First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Enter Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                <button onClick={fetchStudent}>
                    {loading ? "Loading..." : "Fetch Details"}
                </button>
            </div>

            {/* Display Section */}
            {studentData && (
                <div style={{ border: "1px solid #ccc", padding: "15px" }}>
                    <h3>Student Details</h3>

                    <p>
                        <strong>Name:</strong>{" "}
                        {studentData.firstName} {studentData.lastName}
                    </p>

                    <p>
                        <strong>Date of Birth:</strong>{" "}
                        {new Date(studentData.dateOfBirth).toLocaleDateString()}
                    </p>

                    <h3>Parent Details</h3>

                    <p>
                        <strong>Father:</strong> {studentData.parent?.fatherName}
                    </p>

                    <p>
                        <strong>Mother:</strong> {studentData.parent?.motherName}
                    </p>

                    <p>
                        <strong>Phone:</strong> {studentData.parent?.phone}
                    </p>

                    <button
                        onClick={deleteStudent}
                        style={{
                            marginTop: "15px",
                            backgroundColor: "red",
                            color: "white",
                            padding: "10px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Delete Student
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeleteStudent;