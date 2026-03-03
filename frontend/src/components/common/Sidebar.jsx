import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const navConfig = {
  student: [
    { to: '/student/dashboard',  icon: 'bi-grid-1x2',        label: 'Dashboard' },
    { to: '/student/units',      icon: 'bi-journal-bookmark', label: 'Unit Registration' },
    { to: '/student/marks',      icon: 'bi-bar-chart-line',   label: 'My Marks' },
    { to: '/student/notes',      icon: 'bi-file-earmark-text',label: 'Study Notes' },
    { to: '/student/fees',       icon: 'bi-credit-card',      label: 'Fee Payment' },
    { to: '/student/profile',    icon: 'bi-person',           label: 'My Profile' },
  ],
  lecturer: [
    { to: '/lecturer/dashboard', icon: 'bi-grid-1x2',         label: 'Dashboard' },
    { to: '/lecturer/marks',     icon: 'bi-pencil-square',    label: 'Upload Marks' },
    { to: '/lecturer/notes',     icon: 'bi-cloud-upload',     label: 'Upload Notes' },
    { to: '/lecturer/profile',   icon: 'bi-person',           label: 'My Profile' },
  ],
  ict: [
    { to: '/ict/dashboard',         icon: 'bi-grid-1x2',            label: 'Dashboard' },
    { to: '/ict/students',          icon: 'bi-mortarboard',         label: 'Students' },
    { to: '/ict/lecturers',         icon: 'bi-person-workspace',    label: 'Lecturers' },
    { to: '/ict/programmes',        icon: 'bi-collection',          label: 'Programmes' },
    { to: '/ict/semesters',         icon: 'bi-calendar3',           label: 'Semesters' },
    { to: '/ict/allocations',       icon: 'bi-diagram-3',           label: 'Unit Allocation' },
    { to: '/ict/semester-reports',  icon: 'bi-inbox',               label: 'Sem Reports' },
    { to: '/ict/payments',          icon: 'bi-cash-stack',          label: 'Fee Payments' },
    { to: '/ict/logs',              icon: 'bi-terminal',            label: 'System Logs' },
  ],
};

const roleLabel = {
  student: 'Student Portal',
  lecturer: 'Lecturer Portal',
  ict: 'ICT Admin',
};

const roleColor = {
  student: '#1d4ed8',
  lecturer: '#7c3aed',
  ict: '#059669',
};

export default function Sidebar({ role, user, onLogout, isOpen, onClose }) {
  const links = navConfig[role] || [];
  const color = roleColor[role] || '#1d4ed8';

  const initials = (user?.username || '?')
    .split(/[.\-_\s]/)
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''}`}
      style={{ '--role-color': color }}
      aria-label="Sidebar navigation"
    >
      {/* Mobile close button */}
      <button
        className="sidebar-close-btn"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <i className="bi bi-x" />
      </button>

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img
            src="/university_logo.png"
            alt="University Logo"
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <span className="sidebar-logo-fallback" style={{ display: 'none' }}>U</span>
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-university">UniManage</div>
          <div className="sidebar-portal">{roleLabel[role]}</div>
        </div>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-avatar" style={{ background: color }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar-user-name">{user?.username}</div>
          <div className="sidebar-user-role">{roleLabel[role]}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="sidebar-nav-label">Navigation</div>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">
              <i className={`bi ${icon}`} />
            </span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={onLogout}>
          <i className="bi bi-box-arrow-left" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}