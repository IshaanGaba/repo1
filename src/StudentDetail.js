import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, storage } from './firbase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useParams } from 'react-router-dom';
import { auth } from './firbase';

// PrimeReact Components
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Avatar } from 'primereact/avatar';
import { Chart } from 'primereact/chart';
import { Menubar } from 'primereact/menubar';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';

const StudentManagementSystem = () => {
  const [student, setStudent] = useState(null);
  const [editableMarks, setEditableMarks] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [user, setUser] = useState(null);

  // Fetch student data (existing logic remains the same)
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDoc = doc(db, 'student_records', id);
        const studentSnapshot = await getDoc(studentDoc);
        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();
          setStudent(studentData);
          setEditableMarks(studentData.Marks || {});

          if (studentData.photo_storage_path) {
            const photoRef = ref(storage, studentData.photo_storage_path);
            const url = await getDownloadURL(photoRef);
            setPhotoUrl(url);
          }
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  // Authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Existing mark change and save logic remains the same
  const handleMarkChange = (value, key) => {
    setEditableMarks((prevMarks) => ({
      ...prevMarks,
      [key]: value
    }));
  };

  const confirmSave = async () => {
    try {
      const updatedMarks = { ...editableMarks };
      updatedMarks['total:'] = Object.entries(updatedMarks)
        .filter(([key, value]) => key !== 'total:' && value !== null)
        .reduce((sum, [_, value]) => sum + value, 0);

      const studentDoc = doc(db, 'student_records', id);
      await updateDoc(studentDoc, {
        Marks: updatedMarks,
        is_approved: true
      });
      
      setShowModal(false);
    } catch (error) {
      console.error('Error updating marks:', error);
    }
  };

  // Performance Chart Configuration
  const performanceChartData = {
    labels: Object.keys(editableMarks).filter(key => key !== 'total:'),
    datasets: [{
      label: 'Subject Performance',
      data: Object.entries(editableMarks)
        .filter(([key, _]) => key !== 'total:')
        .map(([_, value]) => value !== null ? value : 0),
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1
    }]
  };

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Subject Performance Analysis' }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: 'Marks' }
      }
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="card flex justify-content-center align-items-center" style={{ height: '100vh', background: 'linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%)' }}>
        <div className="text-center">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#3b82f6' }}></i>
          <p className="mt-3 text-xl text-gray-600">Loading Student Details...</p>
        </div>
      </div>
    );
  }

  if (!student) return <p>No data available.</p>;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%)' }}>
      <div className="container mx-auto p-6">
        {/* Header with User and Student Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Avatar 
              image={photoUrl} 
              icon="pi pi-user" 
              shape="circle" 
              size="large" 
              className="shadow-md"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{student.Name}</h1>
              <Tag value={student['Class/Group'] || 'Student'} severity="info" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar 
              label={user?.email?.[0].toUpperCase()} 
              shape="circle" 
              size="large" 
              className="shadow-md"
            />
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </div>

        {/* Student Details Card */}
        <Card className="mb-6 shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-700">Personal Details</h2>
              <div className="space-y-2">
                <p><strong>Roll Number:</strong> {student['Roll No.'] || 'N/A'}</p>
                <p><strong>Course:</strong> {student['Course Name'] || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-700">Academic Details</h2>
              <div className="space-y-2">
                <p><strong>Course Nos:</strong> {student['Course No.'] || 'N/A'}</p>
                <p><strong>Instructor:</strong> {student['Name of the instructor'] || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <TabView>
          <TabPanel header="Marks">
            <Card>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  {Object.entries(editableMarks)
                    .filter(([key]) => key !== 'total:')
                    .map(([subject, mark]) => (
                      <div key={subject} className="mb-3 flex items-center justify-between">
                        <span className="mr-4 text-gray-600">{subject}</span>
                        <InputNumber 
                          value={mark || 0} 
                          onValueChange={(e) => handleMarkChange(e.value, subject)}
                          min={0} 
                          max={10} 
                          showButtons
                          className="w-full" 
                        />
                      </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-semibold mb-2">Total Marks</h3>
                    <p className="text-3xl font-bold text-blue-600">{editableMarks['total:'] || 0}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  label="Save Marks" 
                  icon="pi pi-save" 
                  onClick={() => setShowModal(true)} 
                  className="w-full"
                />
              </div>
            </Card>
          </TabPanel>

          <TabPanel header="Performance">
            <Card>
              <Chart 
                type="bar" 
                data={performanceChartData} 
                options={performanceChartOptions} 
              />
            </Card>
          </TabPanel>

          <TabPanel header="Answer Sheet">
            <Card>
              {photoUrl ? (
                <Image 
                  src={photoUrl} 
                  alt="Answer Sheet" 
                  width="100%" 
                  preview 
                />
              ) : (
                <div className="text-center text-gray-500">
                  <i className="pi pi-times-circle text-4xl mb-3"></i>
                  <p>No answer sheet available</p>
                </div>
              )}
            </Card>
          </TabPanel>
        </TabView>

        {/* Confirmation Dialog */}
        <Dialog 
          header="Confirm Marks Update" 
          visible={showModal} 
          style={{ width: '450px' }}
          modal 
          onHide={() => setShowModal(false)}
          footer={
            <div>
              <Button 
                label="Cancel" 
                icon="pi pi-times" 
                onClick={() => setShowModal(false)} 
                className="p-button-text" 
              />
              <Button 
                label="Confirm" 
                icon="pi pi-check" 
                onClick={confirmSave} 
                autoFocus 
              />
            </div>
          }
        >
          <p>Are you sure you want to save these marks? This action cannot be undone.</p>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentManagementSystem;