import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="login-card animate-fade">

        {/* Logo + branding */}
        <div className="login-brand">
          <div className="login-logo">
            <img
              src="/university_logo.png"
              alt="University Logo"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span className="login-logo-fallback">U</span>
          </div>
          <div>
            <div className="login-title">UniManage</div>
            <div className="login-subtitle">University Management System</div>
          </div>
        </div>

        <div className="login-divider" />

        <div className="login-card-header">
          <h2 className="login-heading">Sign in</h2>
          <p className="login-tagline">Access your portal using your credentials below.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-exclamation-circle" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Username */}
          <div className="form-group">
            <label className="form-label">Username / Registration Number</label>
            <div className="login-input-wrap">
              <i className="bi bi-person login-input-icon" />
              <input
                className="form-input login-input-padded"
                type="text"
                placeholder="e.g. SC211/0530/2022 or STAFF001"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password / KCSE Index Number</label>
            <div className="login-input-wrap">
              <i className="bi bi-lock login-input-icon" />
              <input
                className="form-input login-input-padded login-input-padded-right"
                type={showPassword ? 'text' : 'password'}
                placeholder="Students: KCSE index e.g. 0011/8278/2019"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>

          {/* Credential hint */}
          <div className="login-hint">
            <div className="login-hint-row">
              <i className="bi bi-mortarboard" />
              <span><strong>Student:</strong> Reg No. &amp; KCSE Index Number</span>
            </div>
            <div className="login-hint-row">
              <i className="bi bi-person-workspace" />
              <span><strong>Lecturer / ICT:</strong> Staff ID &amp; assigned password</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing In...</>
              : <><i className="bi bi-box-arrow-in-right" /> Sign In</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}