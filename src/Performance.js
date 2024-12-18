// PerformanceTab.js
import React from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';

const PerformanceTab = ({ editableMarks }) => {
  const data = {
    labels: Object.keys(editableMarks).filter(key => key !== 'total:'),
    datasets: [
      {
        label: 'Student Performance',
        data: Object.entries(editableMarks)
          .filter(([key]) => key !== 'total:')
          .map(([, value]) => value !== null ? value : 0),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  };

  return (
    <Card>
      <Chart type="bar" data={data} options={options} />
    </Card>
  );
};

export default PerformanceTab;
