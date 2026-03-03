import { useState, useEffect } from 'react';
import { ictAPI, coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTSemesters({ user }) {
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ academic_year: '', year_of_study: 1, semester_number: 1, start_date: '', end_date: '', is_active: false, registration_open: false });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const [{ data: sems }, { data: ys }, { data: progs }] = await Promise.all([
      coreAPI.getSemesters(), coreAPI.getAcademicYears(), coreAPI.getProgrammes()
    ]);
    setSemesters(sems.results || sems);
    setYears(ys.results || ys);
    setProgrammes(progs.results || progs);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await coreAPI.createSemester(form);
      setMsg({ text: 'Semester created!', type: 'success' });
      setShowForm(false);
      init();
    } catch (e) {
      setMsg({ text: 'Failed to create semester.', type: 'error' });
    } finally { setSubmitting(false); }
  };

  const toggleField = async (sem, field) => {
    await coreAPI.updateSemester(sem.id, { [field]: !sem[field] });
    init();
  };

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Semesters</h1>
            <p className="page-subtitle">Manage academic semesters and registration</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Semester'}
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>➕ Create Semester</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Academic Year *</label>
                <select className="form-select" required value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })}>
                  <option value="">Select year...</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year of Study *</label>
                <input className="form-input" type="number" min="1" max="6" required
                  value={form.year_of_study} onChange={e => setForm({ ...form, year_of_study: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Semester Number *</label>
                <input className="form-input" type="number" min="1" max="3" required
                  value={form.semester_number} onChange={e => setForm({ ...form, semester_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" required
                  value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" required
                  value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  <span style={{ fontSize: '0.9rem' }}>Active Semester</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.registration_open} onChange={e => setForm({ ...form, registration_open: e.target.checked })} />
                  <span style={{ fontSize: '0.9rem' }}>Registration Open</span>
                </label>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead><tr><th>Academic Year</th><th>Year of Study</th><th>Sem No.</th><th>Dates</th><th>Active</th><th>Reg. Open</th></tr></thead>
            <tbody>
              {semesters.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-accent">{s.academic_year_name}</span></td>
                  <td>Year {s.year_of_study}</td>
                  <td>Semester {s.semester_number}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.start_date} → {s.end_date}</td>
                  <td>
                    <button onClick={() => toggleField(s, 'is_active')}
                      className={`badge badge-${s.is_active ? 'success' : 'default'}`}
                      style={{ border: 'none', cursor: 'pointer' }}>
                      {s.is_active ? '✅ Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => toggleField(s, 'registration_open')}
                      className={`badge badge-${s.registration_open ? 'info' : 'default'}`}
                      style={{ border: 'none', cursor: 'pointer' }}>
                      {s.registration_open ? '🔓 Open' : '🔒 Closed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}