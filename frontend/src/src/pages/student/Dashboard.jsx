import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function StudentDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await studentAPI.getDashboard();
      setData(d);
    } catch (e) {
      setMsg('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!data?.active_semester_id) return;
    setReporting(true);
    try {
      await studentAPI.reportSemester(data.active_semester_id);
      setMsg('Semester reported! Awaiting approval from ICT.');
      fetchDashboard();
    } catch (e) {
      setMsg(e.response?.data?.error || e.response?.data?.detail || 'Failed to report.');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return (
    <Layout role="student" user={user}>
      <div style={{ padding: '2rem' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />)}
      </div>
    </Layout>
  );

  const st = data?.student;
  const feeBalance = data?.fee_balance;
  const registeredUnits = data?.registered_units || [];

  return (
    <Layout role="student" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {st?.first_name} 👋</h1>
            <p className="page-subtitle">{st?.programme_name} • {st?.registration_number}</p>
          </div>
          <div className="badge badge-accent" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            Year {st?.current_year_of_study} • Sem {st?.current_semester_number}
          </div>
        </div>

        {msg && <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}><span>ℹ️</span> {msg}</div>}

        {/* Semester Reporting Banner */}
        {!data?.has_reported && data?.active_semester_id && (
          <div style={{
            background: 'linear-gradient(135deg, #1e5cff 0%, #7c3aed 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
                📢 Report for Semester
              </div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: 4 }}>
                You must report for {data.active_semester} before registering units.
              </div>
            </div>
            <button onClick={handleReport} disabled={reporting}
              style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', borderRadius: 'var(--radius-md)', padding: '0.625rem 1.5rem',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
              }}>
              {reporting ? <><span className="spinner" style={{width:16,height:16,borderTopColor:'white',borderColor:'rgba(255,255,255,0.3)'}} /> Reporting...</> : 'Report Now →'}
            </button>
          </div>
        )}

        {data?.has_reported && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <span>✅</span> You have reported for {data.active_semester}. {data.registration_open ? 'Unit registration is open.' : 'Registration not yet open.'}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff' }}>💳</div>
            <div>
              <div className="stat-value" style={{ color: feeBalance?.balance > 0 ? 'var(--danger)' : 'var(--success)', fontSize: '1.4rem' }}>
                {feeBalance ? `KES ${Number(feeBalance.balance).toLocaleString()}` : 'N/A'}
              </div>
              <div className="stat-label">Fee Balance</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4' }}>📚</div>
            <div>
              <div className="stat-value">{registeredUnits.length}</div>
              <div className="stat-label">Registered Units</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>🎓</div>
            <div>
              <div className="stat-value">{st?.programme_code || '—'}</div>
              <div className="stat-label">Programme</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f5f3ff' }}>📅</div>
            <div>
              <div className="stat-value" style={{ fontSize: '0.9rem', paddingTop: 4 }}>{data?.active_semester || '—'}</div>
              <div className="stat-label">Active Semester</div>
            </div>
          </div>
        </div>

        {/* Registered Units */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)' }}>📚 Registered Units — {data?.active_semester}</h3>
            <a href="/student/units" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>Manage →</a>
          </div>
          {registeredUnits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No units registered</div>
              <div className="empty-state-desc">
                {data?.has_reported ? 'Go to Unit Registration to register your units.' : 'Report for the semester first.'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Unit Code</th>
                    <th>Unit Name</th>
                    <th>Credit Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUnits.map(r => (
                    <tr key={r.id}>
                      <td><span className="badge badge-accent">{r.unit_code}</span></td>
                      <td>{r.unit_name}</td>
                      <td>{r.unit_credit_hours}</td>
                      <td><span className={`badge badge-${r.status === 'registered' ? 'success' : 'default'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}