import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children, role, user }) {
  return (
    <div className="layout">
      <Sidebar role={role} user={user} />
      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
}