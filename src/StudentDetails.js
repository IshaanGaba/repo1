// StudentDetails.js
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
const StudentDetails = ({ student }) => {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Student Details</h2>
        <Button label="Edit Profile" icon="pi pi-user-edit" className="p-button-outlined" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Name:</strong> {student.Name || 'N/A'}</p>
          <p><strong>Roll Number:</strong> {student['Roll No.'] || 'N/A'}</p>
          <p><strong>Class/Group:</strong> {student['Class/Group'] || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Course No:</strong> {student['Course No.'] || 'N/A'}</p>
          <p><strong>Course Name:</strong> {student['Course Name'] || 'N/A'}</p>
          <p><strong>Instructor:</strong> {student['Name of the instructor'] || 'N/A'}</p>
        </div>
      </div>
    </Card>
  );
};

export default StudentDetails;
