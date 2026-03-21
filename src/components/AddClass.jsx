import { useState, useEffect } from "react";
import { api } from "../api";

export default function AddClass() {

    const [classes, setClasses] = useState([]);
    const [classCode, setClassCode] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [schools, setSchools] = useState([]);

    // -----------------------------
    // LOAD CLASSES
    // -----------------------------
    const loadClasses = async () => {
        try {
            const res = await api.get("/classes");
            setClasses(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // -----------------------------
    // LOAD SCHOOLS
    // -----------------------------
    const loadSchools = async () => {
        try {
            const res = await api.get("/schools");
            setSchools(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {

        const fetchData = async () => {
            await loadClasses();
            await loadSchools();
        };

        fetchData();

    }, []);

    // -----------------------------
    // ADD CLASS
    // -----------------------------
    const addClass = async (e) => {

        e.preventDefault();

        try {

            await api.post("/classes", {
                classCode: classCode,
                schoolId: schoolId
            });

            alert("Class Added Successfully");

            setClassCode("");
            setSchoolId("");

            loadClasses();

        } catch (error) {

            console.error(error);
            alert("Error adding class");

        }

    };

    // -----------------------------
    // UPDATE CLASS
    // -----------------------------
    const updateClass = async (cls) => {

        const newSchool = prompt("Enter new school ID", cls.schoolId);

        if (!newSchool) return;

        try {

            await api.put(`/classes/${cls.id}`, {
                schoolId: newSchool
            });

            alert("Class Updated");

            loadClasses();

        } catch (error) {

            console.error(error);
            alert("Update failed");

        }

    };

    return (

        <div className="container">

            <h2>Class Management</h2>

            {/* ---------------- ADD CLASS ---------------- */}

            <h3>Add New Class</h3>

            <form onSubmit={addClass}>

                <input
                    type="text"
                    placeholder="Class Code (1A, 2B)"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                    required
                />

                <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    required
                >

                    <option value="">
                        Select School
                    </option>

                    {schools.map((school) => (

                        <option key={school.id} value={school.id}>
                            {school.name}
                        </option>

                    ))}

                </select>

                <button type="submit">
                    Add Class
                </button>

            </form>

            <hr />

            {/* ---------------- CLASS LIST ---------------- */}

            <h3>Existing Classes</h3>

            <table border="1" cellPadding="10">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Class Code</th>
                        <th>School</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>

                    {classes.map((cls) => (

                        <tr key={cls.id}>

                            <td>{cls.id}</td>
                            <td>{cls.classCode}</td>
                            <td>{cls.school?.name}</td>

                            <td>

                                <button onClick={() => updateClass(cls)}>
                                    Update
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );
}