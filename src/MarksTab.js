// MarksTab.js
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';

const MarksTab = ({ sortedMarks, handleMarkChange, handleSave }) => {
  const marksWithoutTotal = sortedMarks.filter(mark => mark[0] !== 'total:');
  const totalMarks = marksWithoutTotal.reduce((total, mark) => total + (mark[1] || 0), 0);

  return (
    <Card>
      <DataTable value={[...marksWithoutTotal, ['total:', totalMarks.toFixed(2)]]} className="mb-4">
        <Column field="0" header="Subject" />
        <Column field="1" header="Marks" body={(rowData) => (
          rowData[0] === 'total:' ? (
            <strong>{rowData[1]}</strong>
          ) : (
            <InputNumber
              value={rowData[1]}
              onValueChange={(e) => handleMarkChange(e.value, rowData[0])}
              min={0}
              max={10}
              step={0.25} // Allow decimal increments
              showButtons
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              mode="decimal"
              minFractionDigits={1} // Ensures at least one decimal place
              maxFractionDigits={2} // Limits to two decimal places
            />
          )
        )} />
      </DataTable>
      <Button label="Approve Changes" icon="pi pi-save" onClick={handleSave} className="p-button-raised p-button-success" />
    </Card>
  );
};

export default MarksTab;
