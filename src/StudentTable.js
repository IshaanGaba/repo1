import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import { db } from './firbase';
import { collection, getDocs, deleteDoc, doc, where, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'primereact/skeleton';
import { motion } from 'framer-motion';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './StudentTable.css';
import Logout from './logout';
import logo from './logo.png';
import "./sc.css"

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalUnapproved, setTotalUnapproved] = useState(0);
  const [sortField, setSortField] = useState('is_approved');
  const [sortOrder, setSortOrder] = useState(-1);
  const navigate = useNavigate();
  const cm = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsCollection = collection(db, 'student_records');
        const studentSnapshot = await getDocs(studentsCollection);
        const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

        const totalStudentsQuery = query(studentsCollection);
        const totalStudentsSnapshot = await getDocs(totalStudentsQuery);
        setTotalStudents(totalStudentsSnapshot.size);

        const coursesSet = new Set(studentList.map(student => student['Course No.']));
        setTotalCourses(coursesSet.size);

        const approvedStudentsQuery = query(studentsCollection, where('is_approved', '==', true));
        const approvedStudentsSnapshot = await getDocs(approvedStudentsQuery);
        setTotalApproved(approvedStudentsSnapshot.size);

        const unapprovedStudentsQuery = query(studentsCollection, where('is_approved', '==', false));
        const unapprovedStudentsSnapshot = await getDocs(unapprovedStudentsQuery);
        setTotalUnapproved(unapprovedStudentsSnapshot.size);
      } catch (error) {
        console.error("Error fetching students: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleRowClick = (student) => {
    navigate(`/student/${student.id}`);
  };

  const handleAnalysisRedirect = () => {
    navigate('/analysis');
  };

  const approvalBodyTemplate = (rowData) => {
    return (
      <div className="approval-indicator">
        {rowData.is_approved ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <i className="pi pi-check" style={{ color: 'green' }}></i>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <i className="pi pi-times" style={{ color: 'red' }}></i>
          </motion.div>
        )}
      </div>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.date.seconds * 1000).toLocaleDateString();
  };

  const onSelectionChange = (e) => {
    setSelectedStudents(e.value);
  };

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
    setSearchLoading(true);
    setTimeout(() => {
      setSearchLoading(false);
    }, 500);
  };

  const onSort = (e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
  };

  const deleteStudent = async () => {
    if (selectedStudent) {
      try {
        await deleteDoc(doc(db, 'student_records', selectedStudent.id));
        setStudents(students.filter(student => student.id !== selectedStudent.id));
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Student deleted successfully', life: 3000 });
      } catch (error) {
        console.error("Error deleting student: ", error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete student', life: 3000 });
      }
    }
  };

  const menuModel = [
    { label: 'Delete Student', icon: 'pi pi-fw pi-trash', command: deleteStudent }
  ];

  const filteredStudents = students.filter(student =>
    student.Name.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
    student['Roll No.'].toString().includes(globalFilterValue)
  ).sort((a, b) => {
    if (a[sortField] === b[sortField]) {
      return 0;
    }
    return a[sortField] > b[sortField] ? sortOrder : -sortOrder;
  });

  return (
    <div className="student-table-container">
      <Toast ref={toast} />
      <ContextMenu model={menuModel} ref={cm} />
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Smart Scan" className="logo" />
          <h1 className="title">Student Records</h1>
        </div>
        <button
          className="analysis-button"
          onClick={handleAnalysisRedirect}
        >
          Go to Analysis
        </button>
        <Logout />
      </header>
      <main>
        <div className="stats-container">
          <div className="stat-box">
            <i className="pi pi-users"></i>
            <span>Total Students: {totalStudents}</span>
          </div>
          <div className="stat-box">
            <i className="pi pi-book"></i>
            <span>Total Courses: {totalCourses}</span>
          </div>
          <div className="stat-box">
            <i className="pi pi-check" style={{ color: 'green' }}></i>
            <span>Total Approved: {totalApproved}</span>
          </div>
          <div className="stat-box">
            <i className="pi pi-times" style={{ color: 'red' }}></i>
            <span>Total Unapproved: {totalUnapproved}</span>
          </div>
        </div>
        <div className="search-container">
          <span className="p-input-icon-left">
            <i className="pi pi-search icon" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search by name or roll number"
              className="search-input"
            />
          </span>
          {searchLoading && (
            <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s" />
          )}
        </div>
        <div className="table-container">
          {loading ? (
            <div className="loading-indicator">
              <Skeleton width="100%" height="50px" className="p-mb-2" />
              <Skeleton width="100%" height="50px" className="p-mb-2" />
              <Skeleton width="100%" height="50px" className="p-mb-2" />
              <Skeleton width="100%" height="50px" className="p-mb-2" />
            </div>
          ) : (
            <DataTable
              value={filteredStudents}
              paginator
              rows={15}
              onRowClick={({ data }) => handleRowClick(data)}
              scrollable
              scrollHeight="flex"
              className="p-datatable-striped"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
              selection={selectedStudents}
              onSelectionChange={onSelectionChange}
              selectionMode="checkbox"
              responsiveLayout="scroll"
              contextMenuSelection={selectedStudent}
              onContextMenuSelectionChange={(e) => setSelectedStudent(e.value)}
              onContextMenu={(e) => cm.current.show(e.originalEvent)}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
              <Column field="Name" header="Name" sortable />
              <Column field="Roll No." header="Roll Number" sortable />
              <Column field="Course No." header="Course Number" sortable />
              <Column field="Course Name" header="Course Name" sortable />
              <Column field="date" header="Date" body={dateBodyTemplate} sortable />
              <Column field="is_approved" header="Approval" body={approvalBodyTemplate} sortable />
            </DataTable>
          )}
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2024 Smart Scan. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentTable;
