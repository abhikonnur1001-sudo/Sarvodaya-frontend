import { useState, useEffect } from "react";
import { api } from "../api";

export default function AddSchool() {

    const [schools, setSchools] = useState([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [headmasters, setHeadmasters] = useState([]);
    const [selectedHM, setSelectedHM] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [assignMessage, setAssignMessage] = useState("");

    // -----------------------------
    // LOAD SCHOOLS
    // -----------------------------
    const loadSchools = async () => {
        try {
            const res = await api.get("/schools");

            console.log("API Response:", res.data); // 🔥 ADD THIS

            setSchools(res.data);
        } catch (error) {
            console.error(error);
        }
    };
    const loadHeadmasters = async () => {
        try {
            const res = await api.get("/users/headmasters");
            setHeadmasters(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await loadSchools();
            await loadHeadmasters();
        };

        fetchData();
    }, []);

    // -----------------------------
    // ADD SCHOOL
    // -----------------------------
    const addSchool = async (e) => {
        e.preventDefault();

        try {

            await api.post("/schools", {
                code: code,
                name: name
            });

            alert("School Added Successfully");

            setCode("");
            setName("");

            loadSchools();

        } catch (error) {
            console.error(error);
            alert("Error adding school");
        }
    };

    // -----------------------------
    // UPDATE SCHOOL
    // -----------------------------
    const updateSchool = async (school) => {

        const newCode = prompt("Enter new school code", school.code);
        const newName = prompt("Enter new school name", school.name);

        if (!newCode || !newName) return;

        try {

            await api.put(`/schools/${school.id}`, {
                code: newCode,
                name: newName
            });

            alert("School Updated");

            loadSchools();

        } catch (error) {
            console.error(error);
            alert("Update failed");
        }
    };
    const handleAssign = async () => {
        if (!selectedHM || !selectedSchool) {
            setAssignMessage("Please select Headmaster and School");
            return;
        } try {
            await api.post("/assign-hm", {
                userId: Number(selectedHM),
                schoolId: Number(selectedSchool)
            });
            setAssignMessage("Headmaster assigned successfully ✓");
        } catch (error) {
            const msg = error.response?.data?.message || "Assignment failed";
            setAssignMessage(msg);
        }
    };

    return (
        <div style={{ display: "flex", gap: "40px" }}>
            {/* LEFT SIDE - SCHOOL MANAGEMENT */}
            <div>
                <h2>School Management</h2>
                <h3>Add New School</h3>
                <form onSubmit={addSchool}>
                    <input type="text"
                        placeholder="School Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                        }
                        required
                    />
                    <input type="text"
                        placeholder="School Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)
                        }
                        required
                    />
                    <button type="submit">Add School</button>
                </form>
                <hr />
                <h3>Existing Schools</h3> 
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map((school) => (
                            <tr key={school.id}>
                                <td>{school.id}</td>
                                <td>{school.code}</td>
                                <td>{school.name}</td>
                                <td>
                                    <button onClick={() => updateSchool(school)}>
                                        Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* RIGHT SIDE - ASSIGN HM */}
            <div>
                <h3>Assign school to headmaster</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                    {/* HM Dropdown */}
                    <select value={selectedHM}
                        onChange={(e) => setSelectedHM(e.target.value)} >
                        <option value="">Select Headmaster</option>
                        {headmasters.map(h => (
                            <option key={h.id} value={h.id}>
                                {h.fullName}
                            </option>
                        ))}
                    </select>
                    {/* School Dropdown */}
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                    >
                        <option value="">Select School</option>
                        {schools.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.code} - {s.name}
                            </option>
                        ))}
                    </select>
                    {/* Assign Button */}
                    <button onClick={handleAssign}>
                        Assign
                    </button>
                </div>
                {assignMessage && (
                    <p style={{ marginTop: "10px", color: "green" }}>
                        {assignMessage}
                    </p>
                )}
            </div>
        </div >
    );
}