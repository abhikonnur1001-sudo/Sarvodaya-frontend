import React, { useState, useEffect } from "react";
import { api } from "../api";

const OldStudentEnrollment = () => {
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [studentData, setStudentData] = useState(null);

  const [classList, setClassList] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // 🔍 Fetch old student
  const fetchStudent = async () => {
    try {
      const res = await api.get("/api/student-enrollments/old-student", {
        params: { enrollmentNo },
      });

      setStudentData(res.data);

    } catch (err) {
      console.error(err);
      alert("Enrollment not found");
      setStudentData(null);
    }
  };

  // 📚 Load Class List (HM school filtered)
 useEffect(() => {
  const loadData = async () => {
    try {
      const classRes = await api.get("/api/classes");
      setClassList(classRes.data);

      const yearRes = await api.get("/api/academic-years");
      setAcademicYears(yearRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  loadData();
}, []);

  // 🚀 Submit Re-enrollment
  const handleSubmit = async () => {
    if (!selectedClass || !selectedYear) {
      alert("Select class and academic year");
      return;
    }

    try {
      await api.post("/api/student-enrollments", {
        studentId: studentData.studentId,
        classId: selectedClass,
        academicYearId: selectedYear,
        studentTypeId: 1 // you can make dynamic later
      });

      alert("Re-enrolled successfully");

      // reset
      setStudentData(null);
      setEnrollmentNo("");
      setSelectedClass("");
      setSelectedYear("");

    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Old Student Admission</h2>

      {/* 🔍 Search Section */}
      <div>
        <input
          type="text"
          placeholder="Enter Enrollment Number"
          value={enrollmentNo}
          onChange={(e) => setEnrollmentNo(e.target.value)}
        />

        <button onClick={fetchStudent}>Fetch</button>
      </div>

      {/* 📄 Student Details */}
      {studentData && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}>
          <h3>Student Details</h3>

          <p>
            {studentData.firstName} {studentData.middleName} {studentData.lastName}
          </p>

          <p>DOB: {new Date(studentData.dateOfBirth).toLocaleDateString()}</p>

          <p>Previous Class: {studentData.previousClass}</p>
          <p>Academic Year: {studentData.academicYear}</p>

          {/* 🎓 Class Dropdown */}
          <div>
            <label>Select New Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.classCode}
                </option>
              ))}
            </select>
          </div>

          {/* 📅 Academic Year Dropdown */}
          <div>
            <label>Select Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🚀 Submit */}
          <button
            onClick={handleSubmit}
            style={{
              marginTop: "15px",
              backgroundColor: "green",
              color: "white",
              padding: "10px",
              border: "none",
            }}
          >
            Re-Enroll Student
          </button>
        </div>
      )}
    </div>
  );
};

export default OldStudentEnrollment;