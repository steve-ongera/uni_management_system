import { useState, useEffect, useRef, useCallback } from 'react';
import { lecturerAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function LecturerNotes({ user }) {
  const [allocations, setAllocations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', unit: '', semester: '', file: null });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const fileRef = useRef();

  const init = useCallback(async () => {
    try {
      const [{ data: dash }, { data: notesData }] = await Promise.all([
        lecturerAPI.getDashboard(),
        lecturerAPI.getNotes(),
      ]);
      setAllocations(dash.allocations || []);
      setNotes(notesData.results || notesData);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ text: '', type: '' });
    try {
      await lecturerAPI.uploadNote(form);
      setMsg({ text: 'Note uploaded successfully!', type: 'success' });
      setShowForm(false);
      setForm({ title: '', description: '', unit: '', semester: '', file: null });
      if (fileRef.current) fileRef.current.value = '';
      init();
    } catch {
      setMsg({ text: 'Failed to upload note.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await lecturerAPI.deleteNote(id);
      init();
    } catch { setMsg({ text: 'Failed to delete.', type: 'error' }); }
  };

  return (
    <Layout role="lecturer" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Study Notes</h1>
            <p className="page-subtitle">Upload notes for your students</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Upload Note'}
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>📤 Upload New Note</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" required value={form.unit}
                  onChange={e => {
                    const alloc = allocations.find(a => a.unit == e.target.value);
                    setForm({ ...form, unit: e.target.value, semester: alloc?.semester || '' });
                  }}>
                  <option value="">Select unit...</option>
                  {allocations.map(a => (
                    <option key={a.id} value={a.unit}>{a.unit_code} — {a.unit_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description (optional)</label>
                <textarea className="form-textarea" rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">File (PDF/DOC/PPT)</label>
                <input ref={fileRef} type="file" className="form-input"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={e => setForm({ ...form, file: e.target.files[0] })} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Uploading...' : '⬆ Upload'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>
            📚 Uploaded Notes
          </h3>
          {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} /> :
            notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-title">No notes uploaded yet</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Unit</th>
                      <th>Semester</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(n => (
                      <tr key={n.id}>
                        <td style={{ fontWeight: 500 }}>{n.title}</td>
                        <td><span className="badge badge-accent">{n.unit_code}</span></td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{n.semester_label}</td>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(n.uploaded_at).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          {n.file && (
                            <a href={`http://localhost:8000${n.file}`} target="_blank" rel="noreferrer"
                              className="btn btn-secondary btn-sm">⬇</a>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => deleteNote(n.id)}>🗑</button>
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