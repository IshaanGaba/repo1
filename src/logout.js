// Logout.js
import React from 'react';
import { Button } from 'primereact/button';
import { auth } from './firbase';
import { signOut } from 'firebase/auth';

const Logout = ({ setUser }) => {
  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };

  return (
    <Button label="Logout" icon="pi pi-sign-out" onClick={handleLogout} />
  );
};

export default Logout;
