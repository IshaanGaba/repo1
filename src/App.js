import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import Login from './login';
import StudentTable from './StudentTable';
import StudentDetail from './StudentDetail';
import { auth } from './firbase'; 
import StudentDetails from './StudentDetails';
import StudentManagementSystem from './StudentManagementSystem';
import SmartScanDashboard from './Analysis';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user ? (
          <div>
            <Routes>
              <Route path="/students" element={<StudentTable />} />
              <Route path="/student/:id" element={<StudentManagementSystem />} />
              <Route path="/analysis" element={<SmartScanDashboard />} /> 
              <Route path="/" element={<StudentTable />} />
            </Routes>
          </div>
        ) : (
          <Login setUser={setUser} />
        )}
      </div>
    </Router>
  );
};

export default App;