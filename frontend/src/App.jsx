import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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

function ProtectedRoute({ children, allowedRole, userRole }) {
  if (!localStorage.getItem('access_token')) return <Navigate to="/login" replace />;
  if (allowedRole && userRole !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    return {
      role: localStorage.getItem('role'),
      username: localStorage.getItem('username'),
      user_id: localStorage.getItem('user_id'),
    };
  });

  const handleLogin = (data) => setAuthUser(data);

  const role = authUser?.role;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          authUser ? <Navigate to={`/${role}/dashboard`} replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/" element={<Navigate to={authUser ? `/${role}/dashboard` : '/login'} replace />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student" userRole={role}>
            <StudentDashboard user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/student/units" element={
          <ProtectedRoute allowedRole="student" userRole={role}>
            <UnitRegistration user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/student/marks" element={
          <ProtectedRoute allowedRole="student" userRole={role}>
            <StudentMarks user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/student/notes" element={
          <ProtectedRoute allowedRole="student" userRole={role}>
            <StudentNotes user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/student/fees" element={
          <ProtectedRoute allowedRole="student" userRole={role}>
            <StudentFees user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRole="student" userRole={role}>
            <StudentProfile user={authUser} />
          </ProtectedRoute>
        } />

        {/* Lecturer Routes */}
        <Route path="/lecturer/dashboard" element={
          <ProtectedRoute allowedRole="lecturer" userRole={role}>
            <LecturerDashboard user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/marks" element={
          <ProtectedRoute allowedRole="lecturer" userRole={role}>
            <LecturerMarks user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/notes" element={
          <ProtectedRoute allowedRole="lecturer" userRole={role}>
            <LecturerNotes user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/profile" element={
          <ProtectedRoute allowedRole="lecturer" userRole={role}>
            <LecturerProfile user={authUser} />
          </ProtectedRoute>
        } />

        {/* ICT Routes */}
        <Route path="/ict/dashboard" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTDashboard user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/students" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTStudents user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/lecturers" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTLecturers user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/programmes" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTProgrammes user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/semesters" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTSemesters user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/allocations" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTAllocations user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/semester-reports" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTSemesterReports user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/payments" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTPayments user={authUser} />
          </ProtectedRoute>
        } />
        <Route path="/ict/logs" element={
          <ProtectedRoute allowedRole="ict" userRole={role}>
            <ICTLogs user={authUser} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}