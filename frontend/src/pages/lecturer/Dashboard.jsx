import { useState, useEffect } from 'react';
import { lecturerAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function LecturerDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lecturerAPI.getDashboard().then(({ data: d }) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout role="lecturer" user={user}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '2rem' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
      </div>
    </Layout>
  );

  const allocations = data?.allocations || [];

  return (
    <Layout role="lecturer" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {data?.lecturer?.first_name} 👋</h1>
            <p className="page-subtitle">Staff ID: {data?.lecturer?.staff_id}</p>
          </div>
          <div className="badge badge-accent">{allocations.length} Allocated Units</div>
        </div>

        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f5f3ff' }}>📚</div>
            <div>
              <div className="stat-value">{allocations.length}</div>
              <div className="stat-label">Units This Semester</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5' }}>📝</div>
            <div>
              <div className="stat-value">{new Set(allocations.map(a => a.programme_name)).size}</div>
              <div className="stat-label">Programmes</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>
            📋 My Allocated Units
          </h3>
          {allocations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎓</div>
              <div className="empty-state-title">No units allocated</div>
              <div className="empty-state-desc">Contact ICT Admin to allocate units to you.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Unit Code</th>
                    <th>Unit Name</th>
                    <th>Programme</th>
                    <th>Year/Sem</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(a => (
                    <tr key={a.id}>
                      <td><span className="badge badge-accent">{a.unit_code}</span></td>
                      <td>{a.unit_name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.programme_name}</td>
                      <td><span className="badge badge-default">Y{a.year_of_study} S{a.semester_number}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.semester_label}</td>
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