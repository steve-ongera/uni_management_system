import { useState, useEffect } from 'react';
import { ictAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTSemesterReports({ user }) {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter === 'pending' ? { approved: 'false' } : filter === 'approved' ? { approved: 'true' } : {};
      const { data } = await ictAPI.getSemesterReports(params);
      setReports(data.results || data);
    } catch { } finally { setLoading(false); }
  };

  const approve = async (id) => {
    try {
      await ictAPI.approveReport(id);
      setMsg('Report approved!');
      load();
    } catch { setMsg('Failed.'); }
  };

  const reject = async (id) => {
    try {
      await ictAPI.rejectReport(id);
      setMsg('Report rejected.');
      load();
    } catch { setMsg('Failed.'); }
  };

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Semester Reports</h1>
            <p className="page-subtitle">Approve students who have reported for the semester</p>
          </div>
        </div>

        {msg && <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {['pending', 'approved', 'all'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="table-wrapper">
          {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} /> : (
            <table>
              <thead>
                <tr><th>Reg. Number</th><th>Student</th><th>Semester</th><th>Reported At</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No reports found.</td></tr>
                ) : reports.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge badge-default" style={{ fontSize: '0.78rem' }}>{r.student}</span></td>
                    <td>{r.student_name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.semester_label}</td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(r.reported_at).toLocaleString()}</td>
                    <td><span className={`badge badge-${r.approved ? 'success' : 'warning'}`}>{r.approved ? 'Approved' : 'Pending'}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {!r.approved && <button className="btn btn-success btn-sm" onClick={() => approve(r.id)}>✓ Approve</button>}
                      {r.approved && <button className="btn btn-danger btn-sm" onClick={() => reject(r.id)}>✕ Reject</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}