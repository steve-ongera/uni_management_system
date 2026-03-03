import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

const gradeColor = (g) => {
  if (!g) return 'default';
  if (['A','A-'].includes(g)) return 'success';
  if (['B+','B','B-'].includes(g)) return 'info';
  if (['C+','C','C-'].includes(g)) return 'warning';
  return 'danger';
};

export default function StudentMarks({ user }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarks = useCallback(async () => {
    try {
      const { data } = await studentAPI.getMarks();
      setMarks(data.results || data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMarks(); }, [fetchMarks]);

  const gpa = marks.length > 0
    ? (marks.reduce((sum, m) => sum + (Number(m.total_score) || 0), 0) / marks.length).toFixed(1)
    : null;

  return (
    <Layout role="student" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Academic Marks</h1>
            <p className="page-subtitle">View marks for all registered units</p>
          </div>
          {gpa && <div className="stat-card" style={{ padding: '0.75rem 1.5rem' }}>
            <div><div className="stat-value">{gpa}%</div><div className="stat-label">Avg Score</div></div>
          </div>}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        ) : marks.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No marks yet</div>
            <div className="empty-state-desc">Marks will appear here once uploaded by your lecturer.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Unit Code</th>
                  <th>Unit Name</th>
                  <th>Semester</th>
                  <th>CAT (30)</th>
                  <th>Exam (70)</th>
                  <th>Total (100)</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map(m => (
                  <tr key={m.id}>
                    <td><span className="badge badge-accent">{m.unit_code}</span></td>
                    <td>{m.unit_name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.semester_label}</td>
                    <td>{m.cat_score ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{m.exam_score ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ fontWeight: 600 }}>{m.total_score ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{m.grade ? <span className={`badge badge-${gradeColor(m.grade)}`}>{m.grade}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}