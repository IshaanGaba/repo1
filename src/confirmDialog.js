// ConfirmDialog.js
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ConfirmDialog = ({ visible, onHide, onConfirm }) => {
  return (
    <Dialog 
      header="Confirm Changes" 
      visible={visible} 
      onHide={onHide}
      footer={(
        <div>
          <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
          <Button label="Confirm" icon="pi pi-check" onClick={onConfirm} autoFocus className="p-button-primary" />
        </div>
      )}
    >
      <p>Are you sure you want to update the marks?</p>
    </Dialog>
  );
};

export default ConfirmDialog;
