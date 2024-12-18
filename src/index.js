import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Dashboard from './Analysis';
import StudentRecordsTable from './Analysis';
import StudentAnalyticsDashboard from './Analysis';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);