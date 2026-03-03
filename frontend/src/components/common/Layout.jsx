import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout({ children, role, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="layout">
      {/* Mobile overlay — click to close */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <Sidebar
        role={role}
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="layout-main">
        <Navbar
          role={role}
          user={user}
          onToggleSidebar={openSidebar}
          onLogout={onLogout}
        />
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
}