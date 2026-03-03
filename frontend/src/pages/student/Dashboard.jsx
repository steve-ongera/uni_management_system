import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function StudentDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: d } = await studentAPI.getDashboard();
      setData(d);
    } catch {
      setMsg({ text: 'Failed to load dashboard.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleReport = async () => {
    if (!data?.active_semester_id) return;
    setReporting(true);
    try {
      await studentAPI.reportSemester(data.active_semester_id);
      setMsg({ text: 'Semester reported! Awaiting approval from ICT.', type: 'success' });
      fetchDashboard();
    } catch (e) {
      setMsg({
        text: e.response?.data?.error || e.response?.data?.detail || 'Failed to report.',
        type: 'error'
      });
    } finally {
      setReporting(false);
    }
  };

  if (loading) return (
    <Layout role="student" user={user} onLogout={onLogout}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
        <div className="skeleton" style={{ height: 64, width: '55%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 88 }} />)}
        </div>
        <div className="skeleton" style={{ height: 260, marginTop: '0.5rem' }} />
      </div>
    </Layout>
  );

  const st = data?.student;
  const feeBalance = data?.fee_balance;
  const registeredUnits = data?.registered_units || [];
  const balanceNum = feeBalance ? Number(feeBalance.balance) : null;

  return (
    <Layout role="student" user={user} onLogout={onLogout}>
      <div className="animate-fade">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Welcome back, {st?.first_name}
            </h1>
            <p className="page-subtitle">
              {st?.programme_name} &nbsp;·&nbsp; {st?.registration_number}
            </p>
          </div>
          <span className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', alignSelf: 'flex-start' }}>
            <i className="bi bi-mortarboard" />
            Year {st?.current_year_of_study} &nbsp;·&nbsp; Sem {st?.current_semester_number}
          </span>
        </div>

        {/* Alert message */}
        {msg.text && (
          <div className={`alert alert-${msg.type === 'error' ? 'error' : msg.type === 'success' ? 'success' : 'info'}`}
            style={{ marginBottom: '1.25rem' }}>
            <i className={`bi ${msg.type === 'error' ? 'bi-exclamation-circle' : msg.type === 'success' ? 'bi-check-circle' : 'bi-info-circle'}`} />
            {msg.text}
          </div>
        )}

        {/* Semester Reporting Banner */}
        {!data?.has_reported && data?.active_semester_id && (
          <div style={{
            background: 'linear-gradient(120deg, #1d4ed8 0%, #4f46e5 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 16px rgba(29,78,216,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <i className="bi bi-megaphone-fill" style={{ fontSize: '1.25rem', marginTop: 2, opacity: 0.9 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                  Report for {data.active_semester}
                </div>
                <div style={{ opacity: 0.75, fontSize: '0.8125rem', marginTop: 3 }}>
                  You must report before you can register units this semester.
                </div>
              </div>
            </div>
            <button
              onClick={handleReport}
              disabled={reporting}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                transition: 'background 0.18s',
                flexShrink: 0,
              }}
            >
              {reporting
                ? <><span className="spinner" style={{ width: 15, height: 15, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.25)' }} /> Reporting...</>
                : <><i className="bi bi-send" /> Report Now</>
              }
            </button>
          </div>
        )}

        {/* Reported confirmation */}
        {data?.has_reported && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-patch-check-fill" />
            <span>
              Reported for <strong>{data.active_semester}</strong>.&nbsp;
              {data.registration_open
                ? 'Unit registration is currently open.'
                : 'Unit registration is not yet open.'}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {/* Fee Balance */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: balanceNum > 0 ? '#fef2f2' : '#f0fdf4' }}>
              <i className="bi bi-credit-card" style={{ color: balanceNum > 0 ? 'var(--danger)' : 'var(--success)' }} />
            </div>
            <div>
              <div className="stat-value" style={{
                color: balanceNum > 0 ? 'var(--danger)' : 'var(--success)',
                fontSize: balanceNum !== null && balanceNum >= 100000 ? '1.15rem' : '1.5rem'
              }}>
                {balanceNum !== null ? `KES ${balanceNum.toLocaleString()}` : '—'}
              </div>
              <div className="stat-label">Fee Balance</div>
            </div>
          </div>

          {/* Registered Units */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff' }}>
              <i className="bi bi-journal-bookmark" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="stat-value">{registeredUnits.length}</div>
              <div className="stat-label">Registered Units</div>
            </div>
          </div>

          {/* Programme */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fefce8' }}>
              <i className="bi bi-collection" style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: 3 }}>
                {st?.programme_code || '—'}
              </div>
              <div className="stat-label">Programme</div>
            </div>
          </div>

          {/* Active Semester */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f5f3ff' }}>
              <i className="bi bi-calendar3" style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '0.9rem', paddingTop: 4, lineHeight: 1.3 }}>
                {data?.active_semester || '—'}
              </div>
              <div className="stat-label">Active Semester</div>
            </div>
          </div>
        </div>

        {/* Registered Units Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.125rem 1.375rem',
            borderBottom: '1px solid var(--border)',
          }}>
            <div className="section-title">
              <i className="bi bi-journal-bookmark-fill" />
              Registered Units
              {data?.active_semester && (
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: 4 }}>
                  — {data.active_semester}
                </span>
              )}
            </div>
            <a href="/student/units" className="btn btn-secondary btn-sm">
              <i className="bi bi-pencil-square" />
              Manage
            </a>
          </div>

          {registeredUnits.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-journal-x" />
              <div className="empty-state-title">No units registered</div>
              <div className="empty-state-desc">
                {data?.has_reported
                  ? 'Go to Unit Registration to register your units.'
                  : 'You must report for the semester before registering units.'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Unit Code</th>
                    <th>Unit Name</th>
                    <th>Credit Hrs</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUnits.map(r => (
                    <tr key={r.id}>
                      <td>
                        <span className="badge badge-accent">{r.unit_code}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{r.unit_name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.unit_credit_hours}</td>
                      <td>
                        <span className={`badge badge-${r.status === 'registered' ? 'success' : 'default'}`}>
                          <i className={`bi ${r.status === 'registered' ? 'bi-check-circle' : 'bi-clock'}`} />
                          {r.status}
                        </span>
                      </td>
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