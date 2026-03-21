import { useState, useEffect } from "react";
import { api } from "../api";

export default function FeeAssign() {

    const [yearName, setYearName] = useState("");
    const [academicYear, setAcademicYear] = useState(null);

    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);

    const [selectedSchool, setSelectedSchool] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    const [studentTypes, setStudentTypes] = useState([]);
    const [selectedStudentType, setSelectedStudentType] = useState("");

    const [amount, setAmount] = useState("");

    // -----------------------------
    // LOAD ACTIVE ACADEMIC YEAR
    // -----------------------------
    const loadActiveYear = async () => {
        try {
            const res = await api.get("/academicyears/active");
            setAcademicYear(res.data);
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

    useEffect(() => {
        loadActiveYear();
        loadSchools();
        loadClasses();
        loadStudentTypes();
    }, []);
    const loadStudentTypes = async () => {
        try {

            const res = await api.get("/studenttypes");

            setStudentTypes(res.data);

        } catch (error) {

            console.error(error);

        }
    };

    // -----------------------------
    // CREATE ACADEMIC YEAR
    // -----------------------------
    const createYear = async (e) => {

        e.preventDefault();

        try {

            await api.post("/academicyears", {
                name: yearName
            });

            alert("Academic year created");

            setYearName("");
            loadActiveYear();

        } catch (error) {

            console.error(error);
            alert("Error creating academic year");

        }

    };

    // -----------------------------
    // ASSIGN FEE
    // -----------------------------
    const assignFee = async (e) => {

        e.preventDefault();

        if (!academicYear) {
            alert("Create an academic year first");
            return;
        }

        try {

            await api.post("/accounts/assign-class-fees", {

                classId: parseInt(selectedClass),
                academicYearId: academicYear.id,
                amount: parseFloat(amount)

            });

            alert("Fees assigned successfully");

            setSelectedSchool("");
            setSelectedClass("");
            setAmount("");

        } catch (error) {

            console.error(error);
            alert(error.response?.data?.message || "Error assigning fees");

        }

    };

    // Filter classes by school
    const filteredClasses = classes.filter(
        (c) => c.schoolId === parseInt(selectedSchool)
    );
    const assignStudentTypeFee = async (e) => {

        e.preventDefault();

        try {

            await api.post("/accounts/assign-studenttype-fees", {

                classId: parseInt(selectedClass),
                studentTypeId: parseInt(selectedStudentType),
                academicYearId: academicYear.id,
                amount: parseFloat(amount)

            });

            alert("Student type fee assigned");

            setSelectedStudentType("");
            setAmount("");

        } catch (error) {

            console.error(error);
            alert(error.response?.data || "Error assigning student type fee");

        }

    };

    return (

        <div className="container">

            <h2>Academic Year Management</h2>

            <form onSubmit={createYear}>

                <input
                    placeholder="Year Name (2025-2026)"
                    value={yearName}
                    onChange={(e) => setYearName(e.target.value)}
                    required
                />

                <button type="submit">
                    Create Academic Year
                </button>

            </form>

            <hr />

            <h2>Assign Class Fees</h2>

            <form onSubmit={assignFee}>

                <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    required
                >
                    <option value="">Select School</option>

                    {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}

                </select>

                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                >
                    <option value="">Select Class</option>

                    {filteredClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.classCode}
                        </option>
                    ))}

                </select>

                <input
                    value={academicYear?.name || "No Academic Year"}
                    readOnly
                />

                <input
                    type="number"
                    placeholder="Fee Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />

                <button type="submit">
                    Assign Fee
                </button>

            </form>
            <hr />

            <h2>Assign Student Type Fees</h2>

            <form onSubmit={assignStudentTypeFee}>

                <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    required
                >
                    <option value="">Select School</option>

                    {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}

                </select>


                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                >
                    <option value="">Select Class</option>

                    {filteredClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.classCode}
                        </option>
                    ))}

                </select>


                <select
                    value={selectedStudentType}
                    onChange={(e) => setSelectedStudentType(e.target.value)}
                    required
                >

                    <option value="">Select Student Type</option>

                    {studentTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}

                </select>


                <input
                    value={academicYear?.name || ""}
                    readOnly
                />

                <input
                    type="number"
                    placeholder="Fee Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />

                <button type="submit">
                    Assign Student Type Fee
                </button>

            </form>

        </div>

    );
}