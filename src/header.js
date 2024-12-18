// Header.js
import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';

const Header = ({ menuItems, user }) => {
  const end = (
    <div className="flex items-center">
      <span className="mr-2 text-sm">{user?.email}</span>
      <Avatar icon="pi pi-user" size="large" shape="circle" />
    </div>
  );

  return (
    <Menubar model={menuItems} end={end} className="border-none shadow-md" />
  );
};

export default Header;
