import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firbase"; // Adjust the path as needed
import * as XLSX from "xlsx";
import { Avatar } from "primereact/avatar";
import "./header.css";
import { useNavigate } from "react-router-dom";

// Header Component
const Header = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log("User logged out");
        navigate("/"); // Redirect to the login or homepage
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvewNgIOqUFDbN2T49CFw9yPOzIXtshC-ydw&s"
          alt="SmartScan Logo"
          className="logo"
        />
        <h1 className="company-name">SmartScan</h1>
      </div>
      <div className="user-info">
        {user && (
          <>
            <Avatar
              label={user.email[0].toUpperCase()}
              className="user-avatar"
              shape="circle"
            />
            <span className="user-email">{user.email}</span>
          </>
        )}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

const SmartScanDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState({
    average: 0,
    highest: 0,
    secondLowest: 0,
    median: 0,
    mode: 0,
  });

  const [markRangeChart, setMarkRangeChart] = useState({});
  const [questionPerformanceChart, setQuestionPerformanceChart] = useState({});
  const [courseAnalysisChart, setCourseAnalysisChart] = useState({});

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentsCollection = collection(db, "student_records");
        const snapshot = await getDocs(studentsCollection);

        const studentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentData);

        calculatePerformanceStats(studentData);
        generateCharts(studentData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const calculatePerformanceStats = (data) => {
    const marks = data.map((student) => calculateTotalMarks(student.Marks));

    const calculateMedian = (nums) => {
      const sorted = nums.slice().sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
    };

    const calculateMode = (nums) => {
      const frequency = {};
      nums.forEach((num) => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      return parseInt(
        Object.keys(frequency).find((key) => frequency[key] === maxFreq)
      );
    };

    setClassStats({
      average: marks.reduce((a, b) => a + b, 0) / marks.length,
      highest: Math.max(...marks),
      secondLowest: calculateSecondMinMarks(marks),
      median: calculateMedian(marks),
      mode: calculateMode(marks),
    });
  };

  const generateCharts = (data) => {
    const markRanges = {
      "0-40": data.filter((s) => calculateTotalMarks(s.Marks) < 40).length,
      "40-60": data.filter(
        (s) =>
          calculateTotalMarks(s.Marks) >= 40 &&
          calculateTotalMarks(s.Marks) < 60
      ).length,
      "60-80": data.filter(
        (s) =>
          calculateTotalMarks(s.Marks) >= 60 &&
          calculateTotalMarks(s.Marks) < 80
      ).length,
      "80-100": data.filter((s) => calculateTotalMarks(s.Marks) >= 80).length,
    };

    setMarkRangeChart({
      labels: Object.keys(markRanges),
      datasets: [
        {
          data: Object.values(markRanges),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    });

    const questions = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    const questionMeans = questions.map((q) =>
      data.reduce((sum, student) => sum + (student.Marks[q] || 0), 0) / data.length
    );

    setQuestionPerformanceChart({
      labels: questions,
      datasets: [
        {
          label: "Average Marks per Question",
          data: questionMeans,
          fill: false,
          borderColor: "#42A5F5",
          tension: 0.4,
        },
      ],
    });

    const courseCounts = data.reduce((acc, student) => {
      const course = student["Course Name"];
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    }, {});

    setCourseAnalysisChart({
      labels: Object.keys(courseCounts),
      datasets: [
        {
          data: Object.values(courseCounts),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
        },
      ],
    });
  };

  const exportTotalMarksToExcel = () => {
    const totalMarksData = students.map((student) => ({
      "Roll No.": student["Roll No."],
      Name: student.Name,
      "Total Marks": calculateTotalMarks(student.Marks),
    }));

    const worksheet = XLSX.utils.json_to_sheet(totalMarksData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Total Marks");
    XLSX.writeFile(workbook, "SmartScan_Total_Marks.xlsx");
  };

  const exportQuestionWiseToExcel = () => {
    const questionOrder = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

    const questionWiseData = students.map((student) => {
      const orderedMarks = questionOrder.reduce((acc, question) => {
        acc[question] = student.Marks[question] || 0;
        return acc;
      }, {});

      return {
        "Roll No.": student["Roll No."],
        Name: student.Name,
        ...orderedMarks,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(questionWiseData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Question Wise Marks");
    XLSX.writeFile(workbook, "SmartScan_Question_Wise_Marks.xlsx");
  };

  const calculateTotalMarks = (marks) => {
    return Object.values(marks || {})
      .filter((mark) => mark !== null)
      .reduce((sum, mark) => sum + mark, 0);
  };

  const calculateSecondMinMarks = (marks) => {
    const validMarks = marks.filter((mark) => mark !== null && mark > 0);
    return validMarks.length > 1
      ? validMarks.sort((a, b) => a - b)[1]
      : null;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Header />
      <div style={{ padding: "2rem" }}>
        <h2>Smart Scan Dashboard</h2>
        <Panel header="Class Performance Summary">
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Card title="Average Marks">{classStats.average.toFixed(2)}</Card>
            <Card title="Highest Marks">{classStats.highest}</Card>
            <Card title="Lowest Marks">{classStats.secondLowest}</Card>
            <Card title="Median Marks">{classStats.median}</Card>
            <Card title="Mode Marks">{classStats.mode}</Card>
          </div>
        </Panel>

        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "2rem" }}>
          <div style={{ width: "30%" }}>
            <h3>Mark Range Distribution</h3>
            <Chart type="pie" data={markRangeChart} />
          </div>
          <div style={{ width: "30%" }}>
            <h3>Question Performance</h3>
            <Chart type="bar" data={questionPerformanceChart} />
          </div>
          <div style={{ width: "30%" }}>
            <h3>Course Analysis</h3>
            <Chart type="pie" data={courseAnalysisChart} />
          </div>
        </div>

        <Divider />

        <DataTable value={students} responsiveLayout="scroll">
          <Column field="Roll No." header="Roll No." />
          <Column field="Name" header="Name" />
          <Column field="Course Name" header="Course Name" />
          <Column
            header="Total Marks"
            body={(rowData) => calculateTotalMarks(rowData.Marks)}
          />
        </DataTable>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Button
            label="Export Excel (Total Marks)"
            icon="pi pi-file-excel"
            onClick={exportTotalMarksToExcel}
            style={{ marginRight: "1rem" }}
          />
          <Button
            label="Export Excel (Question Wise)"
            icon="pi pi-file-excel"
            onClick={exportQuestionWiseToExcel}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartScanDashboard;
