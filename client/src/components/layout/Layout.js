import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import Topbar from './Topbar.js';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Topbar />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
