import { useLocation } from 'react-router-dom';
import './Navbar.css';

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

// Map path segments to readable labels
const pathLabels = {
  dashboard: 'Dashboard',
  units: 'Unit Registration',
  marks: 'My Marks',
  notes: 'Study Notes',
  fees: 'Fee Payment',
  profile: 'My Profile',
  lecturers: 'Lecturers',
  students: 'Students',
  programmes: 'Programmes',
  semesters: 'Semesters',
  allocations: 'Unit Allocation',
  'semester-reports': 'Semester Reports',
  payments: 'Fee Payments',
  logs: 'System Logs',
  student: 'Student',
  lecturer: 'Lecturer',
  ict: 'ICT',
};

export default function Navbar({ role, user, onToggleSidebar, onLogout }) {
  const location = useLocation();

  // Build breadcrumb from path segments
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map(s => pathLabels[s] || s);

  const initials = (user?.username || '?')
    .split(/[.\-_\s]/)
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  const color = roleColor[role] || '#1d4ed8';

  return (
    <header className="navbar">
      {/* Left */}
      <div className="navbar-left">
        <button
          className="navbar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list" />
        </button>

        <nav className="navbar-breadcrumb" aria-label="Breadcrumb">
          <span className="navbar-breadcrumb-item">UniManage</span>
          {crumbs.map((crumb, idx) => (
            <span key={idx} style={{ display: 'contents' }}>
              <i className="bi bi-chevron-right navbar-breadcrumb-sep" />
              <span className={`navbar-breadcrumb-item ${idx === crumbs.length - 1 ? 'current' : ''}`}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="navbar-right">
        {/* Help link */}
        <a
          href="#"
          className="navbar-icon-btn"
          title="Help"
          aria-label="Help"
        >
          <i className="bi bi-question-circle" />
        </a>

        {/* User pill */}
        <div className="navbar-user" title={user?.username}>
          <div
            className="navbar-avatar"
            style={{ background: color }}
          >
            {initials}
          </div>
          <div className="navbar-user-info">
            <div className="navbar-user-name">{user?.username}</div>
            <div className="navbar-user-role">{roleLabel[role]}</div>
          </div>
          <div
            className="navbar-role-dot"
            style={{ background: color }}
            title={roleLabel[role]}
          />
        </div>

        {/* Logout */}
        <button
          className="navbar-icon-btn"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <i className="bi bi-box-arrow-right" />
        </button>
      </div>
    </header>
  );
}