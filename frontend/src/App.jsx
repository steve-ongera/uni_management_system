import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

// Auth
import Login from './pages/Login';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import UnitRegistration from './pages/student/UnitRegistration';
import StudentMarks from './pages/student/Marks';
import StudentNotes from './pages/student/Notes';
import StudentFees from './pages/student/Fees';
import StudentProfile from './pages/student/Profile';

// Lecturer pages
import LecturerDashboard from './pages/lecturer/Dashboard';
import LecturerMarks from './pages/lecturer/UploadMarks';
import LecturerNotes from './pages/lecturer/UploadNotes';
import LecturerProfile from './pages/lecturer/Profile';

// ICT pages
import ICTDashboard from './pages/ict/Dashboard';
import ICTStudents from './pages/ict/Students';
import ICTLecturers from './pages/ict/Lecturers';
import ICTProgrammes from './pages/ict/Programmes';
import ICTSemesters from './pages/ict/Semesters';
import ICTAllocations from './pages/ict/Allocations';
import ICTSemesterReports from './pages/ict/SemesterReports';
import ICTPayments from './pages/ict/Payments';
import ICTLogs from './pages/ict/Logs';

// ProtectedRoute: pure redirect logic, no side-effects
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('access_token');
  const storedRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && storedRole !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

// Read auth state once from localStorage — called only as a lazy initializer
function readAuthFromStorage() {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const user_id = localStorage.getItem('user_id');

  // Return null if no valid session exists
  if (!token || !role) return null;

  return { role, username, user_id };
}

export default function App() {
  // () => readAuthFromStorage() ensures this runs ONCE on mount, not on every render
  const [authUser, setAuthUser] = useState(() => readAuthFromStorage());

  // useCallback ensures handleLogin reference is stable — safe to pass as prop
  const handleLogin = useCallback((data) => {
    setAuthUser({
      role: data.role,
      username: data.username,
      user_id: data.user_id,
    });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    setAuthUser(null);
  }, []);

  const role = authUser?.role;

  // Guard: only redirect to dashboard if role is a known valid value
  const dashboardPath = role ? `/${role}/dashboard` : '/login';

  return (
    <BrowserRouter>
      <Routes>
        {/* Login route: redirect to dashboard if already authenticated */}
        <Route
          path="/login"
          element={
            authUser && role
              ? <Navigate to={dashboardPath} replace />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* Root: redirect based on auth state */}
        <Route
          path="/"
          element={<Navigate to={authUser && role ? dashboardPath : '/login'} replace />}
        />

        {/* ── Student Routes ── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/units" element={
          <ProtectedRoute allowedRole="student">
            <UnitRegistration user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/marks" element={
          <ProtectedRoute allowedRole="student">
            <StudentMarks user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/notes" element={
          <ProtectedRoute allowedRole="student">
            <StudentNotes user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/fees" element={
          <ProtectedRoute allowedRole="student">
            <StudentFees user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRole="student">
            <StudentProfile user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* ── Lecturer Routes ── */}
        <Route path="/lecturer/dashboard" element={
          <ProtectedRoute allowedRole="lecturer">
            <LecturerDashboard user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/marks" element={
          <ProtectedRoute allowedRole="lecturer">
            <LecturerMarks user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/notes" element={
          <ProtectedRoute allowedRole="lecturer">
            <LecturerNotes user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/profile" element={
          <ProtectedRoute allowedRole="lecturer">
            <LecturerProfile user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* ── ICT Routes ── */}
        <Route path="/ict/dashboard" element={
          <ProtectedRoute allowedRole="ict">
            <ICTDashboard user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/students" element={
          <ProtectedRoute allowedRole="ict">
            <ICTStudents user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/lecturers" element={
          <ProtectedRoute allowedRole="ict">
            <ICTLecturers user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/programmes" element={
          <ProtectedRoute allowedRole="ict">
            <ICTProgrammes user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/semesters" element={
          <ProtectedRoute allowedRole="ict">
            <ICTSemesters user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/allocations" element={
          <ProtectedRoute allowedRole="ict">
            <ICTAllocations user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/semester-reports" element={
          <ProtectedRoute allowedRole="ict">
            <ICTSemesterReports user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/payments" element={
          <ProtectedRoute allowedRole="ict">
            <ICTPayments user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/ict/logs" element={
          <ProtectedRoute allowedRole="ict">
            <ICTLogs user={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Catch-all: redirect to root which handles auth logic */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}