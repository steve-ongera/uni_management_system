import { useState, useEffect, useCallback } from 'react';
import { ictAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: d } = await ictAPI.getDashboard();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <Layout role="ict" user={user}><div style={{ padding: '2rem' }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />)}</div></Layout>;

  const stats = [
    { icon: '🎓', label: 'Total Students', value: data?.total_students, bg: '#eff6ff' },
    { icon: '🧑‍🏫', label: 'Total Lecturers', value: data?.total_lecturers, bg: '#f5f3ff' },
    { icon: '📬', label: 'Pending Reports', value: data?.pending_reports, bg: '#fef3c7' },
    { icon: '💰', label: 'Pending Payments', value: data?.pending_payments, bg: '#fef2f2' },
  ];

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">ICT Admin Dashboard</h1>
            <p className="page-subtitle">
              Active Year: <strong>{data?.active_year?.name || 'Not set'}</strong>
            </p>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value ?? 0}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>
            🗃️ Recent System Activity
          </h3>
          {(data?.recent_logs || []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No activity yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data?.recent_logs || []).map(log => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)', border: '1px solid var(--border)'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 }}>
                    {log.action === 'create' ? '➕' : log.action === 'approve' ? '✅' : log.action === 'update' ? '✏️' : '🗑️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem' }}>{log.description}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      by {log.performed_by_name} • {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <span className={`badge badge-${log.action === 'create' ? 'success' : log.action === 'approve' ? 'info' : 'default'}`}>
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}