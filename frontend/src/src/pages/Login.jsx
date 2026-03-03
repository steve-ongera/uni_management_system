import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('user_id', data.user_id);
      onLogin(data);
      const redirects = { student: '/student/dashboard', lecturer: '/lecturer/dashboard', ict: '/ict/dashboard' };
      navigate(redirects[data.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-logo">U</div>
            <h1 className="login-heading">UniManage</h1>
            <p className="login-tagline">Integrated University Management System</p>
            <div className="login-features">
              <div className="login-feature">
                <span className="login-feature-icon">🎓</span>
                <span>Student Portal — Register units, view marks & pay fees</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">🧑‍🏫</span>
                <span>Lecturer Portal — Upload marks & share study notes</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">🛠️</span>
                <span>ICT Admin — Manage all academic operations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your portal</p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Username / Registration Number</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. SC211/0530/2022 or STAFF001"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password / KCSE Index Number</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Students: your KCSE index e.g. 0011/8278/2019"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div className="login-hint">
                <div className="login-hint-item">
                  <strong>Student:</strong> Username = Reg No. &nbsp;|&nbsp; Password = KCSE Index
                </div>
                <div className="login-hint-item">
                  <strong>Lecturer/ICT:</strong> Username = Staff ID &nbsp;|&nbsp; Password as set
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
                {loading ? <><span className="spinner" style={{width:18,height:18}} /> Signing In...</> : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}