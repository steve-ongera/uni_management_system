import { useState, useEffect, useCallback } from 'react';
import { coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTProgrammes({ user }) {
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', department: '', duration_years: 4, semesters_per_year: '2', description: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const init = useCallback(async () => {
    const [{ data: progs }, { data: depts }] = await Promise.all([coreAPI.getProgrammes(), coreAPI.getDepartments()]);
    setProgrammes(progs.results || progs);
    setDepartments(depts.results || depts);
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await coreAPI.createProgramme(form);
      setMsg({ text: 'Programme created!', type: 'success' });
      setShowForm(false);
      init();
    } catch { setMsg({ text: 'Failed.', type: 'error' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div><h1 className="page-title">Programmes</h1><p className="page-subtitle">{programmes.length} programmes</p></div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕' : '+ Add Programme'}</button>
        </div>
        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>➕ Create Programme</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Programme Name *</label><input className="form-input" required placeholder="e.g. Bachelor of Science in IT" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Code *</label><input className="form-input" required placeholder="e.g. BSCIT" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department *</label>
                <select className="form-select" required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Duration (Years)</label><input className="form-input" type="number" min="1" max="6" value={form.duration_years} onChange={e => setForm({ ...form, duration_years: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Semesters per Year</label>
                <select className="form-select" value={form.semesters_per_year} onChange={e => setForm({ ...form, semesters_per_year: e.target.value })}>
                  <option value="2">2 semesters/year (e.g. BSc IT)</option>
                  <option value="3">3 semesters/year (e.g. Nursing)</option>
                </select>
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
            <thead><tr><th>Code</th><th>Programme Name</th><th>Department</th><th>Duration</th><th>Semesters/Year</th><th>Total Sem</th></tr></thead>
            <tbody>
              {programmes.map(p => (
                <tr key={p.id}>
                  <td><span className="badge badge-accent">{p.code}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.department_name}</td>
                  <td>{p.duration_years} Years</td>
                  <td>{p.semesters_per_year} / year</td>
                  <td><span className="badge badge-info">{p.total_semesters} semesters</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}