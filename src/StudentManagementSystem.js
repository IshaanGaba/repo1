// StudentManagementSystem.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, storage } from './firbase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useParams } from 'react-router-dom';
import { auth } from './firbase';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import Header from './header';
import StudentDetails from './StudentDetails';
import MarksTab from './MarksTab';
import PerformanceTab from './Performance';
import AnswerSheetTab from './AnswerSheet';
import ConfirmDialog from './confirmDialog';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';

const StudentManagementSystem = () => {
  const [student, setStudent] = useState(null);
  const [editableMarks, setEditableMarks] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const toast = React.useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDoc = doc(db, 'student_records', id);
        const studentSnapshot = await getDoc(studentDoc);
        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();
          console.log(studentData)
          setStudent(studentData);
          setEditableMarks(studentData.Marks || {});

          if (studentData.photo_storage_path) {
            const photoRef = ref(storage, studentData.photo_storage_path);
            const url = await getDownloadURL(photoRef);
            setPhotoUrl(url);
          }
        } else {
          console.log("No such document!");
          setStudent({});
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        setStudent({});
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkChange = (value, key) => {
    setEditableMarks((prevMarks) => ({
      ...prevMarks,
      [key]: value
    }));
  };

  const handleSave = () => {
    setShowModal(true);
  };

  const confirmSave = async () => {
    try {
      const updatedMarks = { ...editableMarks };
      updatedMarks['total:'] = Object.entries(updatedMarks)
        .filter(([key]) => key !== 'total:' && editableMarks[key] !== null)
        .reduce((sum, [_, value]) => sum + value, 0);

      const studentDoc = doc(db, 'student_records', id);
      await updateDoc(studentDoc, {
        Marks: updatedMarks,
        is_approved: true
      });
      setEditableMarks(updatedMarks);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Marks updated and changes approved!', life: 3000 });
    } catch (error) {
      console.error('Error updating marks:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update marks.', life: 3000 });
    } finally {
      setShowModal(false);
    }
  };

  const romanNumeralOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  const sortedMarks = Object.entries(editableMarks)
    .sort(([a], [b]) => {
      if (a === 'total:') return 1;
      if (b === 'total:') return -1;
      return romanNumeralOrder.indexOf(a) - romanNumeralOrder.indexOf(b);
    });

  if (loading) {
    return (
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 650
      }}>
        <ProgressSpinner style={{ width: '100px', height: '100px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
      </div>
    );
  }

  if (!student) return <p>No data available.</p>;

  const menuItems = [
    { label: 'Dashboard', icon: 'pi pi-fw pi-home' },
    { label: 'Reports', icon: 'pi pi-fw pi-file' },
    { label: 'Marks', icon: 'pi pi-fw pi-check-square' },
    { label: 'Analytics', icon: 'pi pi-fw pi-chart-bar' },
    { label: 'Profile', icon: 'pi pi-fw pi-user' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Toast ref={toast} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <StudentDetails student={student} />

        <TabView>
          <TabPanel header="Marks">
            <MarksTab 
              sortedMarks={sortedMarks} 
              editableMarks={editableMarks} 
              handleMarkChange={handleMarkChange} 
              handleSave={handleSave} 
            />
          </TabPanel>
          <TabPanel header="Performance">
            <PerformanceTab editableMarks={editableMarks} />
          </TabPanel>
          <TabPanel header="Answer Sheet">
            <AnswerSheetTab photoUrl={photoUrl} />
          </TabPanel>
        </TabView>
      </motion.div>

      <ConfirmDialog 
        visible={showModal} 
        onHide={() => setShowModal(false)} 
        onConfirm={confirmSave} 
      />
    </div>
  );
};

export default StudentManagementSystem;
