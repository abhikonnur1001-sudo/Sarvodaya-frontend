import { useState } from "react";
import { api } from "../api";

export default function AddStudent() {
    const [form, setForm] = useState({
        admissionNumber: "",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: 1,
        dateOfBirth: "",
        previousSchoolName: "",
        previousClassStandard: "",
        addressLine1: "",
        pincode: ""
    });

    const submit = async () => {
        await api.post("/students", form);
        alert("Student created successfully");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Add Student</h2>

            <input placeholder="Admission Number"
                onChange={e => setForm({ ...form, admissionNumber: e.target.value })} />

            <input placeholder="First Name"
                onChange={e => setForm({ ...form, firstName: e.target.value })} />

            <input placeholder="Last Name"
                onChange={e => setForm({ ...form, lastName: e.target.value })} />

            <input type="date"
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />

            <input placeholder="Address"
                onChange={e => setForm({ ...form, addressLine1: e.target.value })} />

            <input placeholder="Pincode"
                onChange={e => setForm({ ...form, pincode: e.target.value })} />

            <button onClick={submit}>Save</button>
        </div>
    );
}