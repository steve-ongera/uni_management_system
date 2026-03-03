import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function StudentNotes({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getNotes().then(({ data }) => {
      setNotes(data.results || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const grouped = notes.reduce((acc, n) => {
    const key = n.unit_name || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <Layout role="student" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Study Notes</h1>
            <p className="page-subtitle">Notes uploaded by your lecturers</p>
          </div>
          <div className="badge badge-default">{notes.length} files</div>
        </div>

        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 12 }} />)
        ) : notes.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No notes available</div>
            <div className="empty-state-desc">Your lecturers haven't uploaded any notes yet.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([unitName, unitNotes]) => (
            <div key={unitName} className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                📚 {unitName}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {unitNotes.map(note => (
                  <div key={note.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)', background: 'var(--surface)', gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{
                        width: 40, height: 40, background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                      }}>📄</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{note.title}</div>
                        {note.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{note.description}</div>}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          By {note.lecturer_name} • {new Date(note.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {note.file && (
                      <a href={`http://localhost:8000${note.file}`} target="_blank" rel="noreferrer"
                        className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                        ⬇ Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}