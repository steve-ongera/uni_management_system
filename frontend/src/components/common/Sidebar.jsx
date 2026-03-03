import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const navConfig = {
  student: [
    { to: '/student/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/student/units', icon: '📚', label: 'Unit Registration' },
    { to: '/student/marks', icon: '📊', label: 'My Marks' },
    { to: '/student/notes', icon: '📄', label: 'Study Notes' },
    { to: '/student/fees', icon: '💳', label: 'Fee Payment' },
    { to: '/student/profile', icon: '👤', label: 'My Profile' },
  ],
  lecturer: [
    { to: '/lecturer/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/lecturer/marks', icon: '📝', label: 'Upload Marks' },
    { to: '/lecturer/notes', icon: '📤', label: 'Upload Notes' },
    { to: '/lecturer/profile', icon: '👤', label: 'My Profile' },
  ],
  ict: [
    { to: '/ict/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/ict/students', icon: '🎓', label: 'Students' },
    { to: '/ict/lecturers', icon: '🧑‍🏫', label: 'Lecturers' },
    { to: '/ict/programmes', icon: '📋', label: 'Programmes' },
    { to: '/ict/semesters', icon: '📅', label: 'Semesters' },
    { to: '/ict/allocations', icon: '🔗', label: 'Unit Allocation' },
    { to: '/ict/semester-reports', icon: '📬', label: 'Sem Reports' },
    { to: '/ict/payments', icon: '💰', label: 'Fee Payments' },
    { to: '/ict/logs', icon: '🗃️', label: 'System Logs' },
  ],
};

const roleLabel = { student: 'Student Portal', lecturer: 'Lecturer Portal', ict: 'ICT Admin' };
const roleAccent = { student: '#1e5cff', lecturer: '#7c3aed', ict: '#059669' };

export default function Sidebar({ role, user }) {
  const navigate = useNavigate();
  const links = navConfig[role] || [];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="sidebar" style={{ '--role-color': roleAccent[role] }}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span>U</span>
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-university">UniManage</div>
          <div className="sidebar-portal">{roleLabel[role]}</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{user?.username?.[0]?.toUpperCase() || '?'}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.username}</div>
          <div className="sidebar-user-role">{roleLabel[role]}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
        {links.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }>
            <span className="sidebar-link-icon">{icon}</span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span>🚪</span>
        <span>Sign Out</span>
      </button>
    </aside>
  );
}