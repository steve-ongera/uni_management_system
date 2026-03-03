import { useState, useEffect } from 'react';
import { ictAPI, coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTAllocations({ user }) {
  const [allocations, setAllocations] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [units, setUnits] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lecturer: '', unit: '', semester: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const [{ data: allocs }, { data: lecs }, { data: u }, { data: sems }] = await Promise.all([
      ictAPI.getAllocations(), ictAPI.getAllLecturers(), coreAPI.getUnits(), coreAPI.getSemesters(),
    ]);
    setAllocations(allocs.results || allocs);
    setLecturers(lecs.results || lecs);
    setUnits(u.results || u);
    setSemesters(sems.results || sems);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ictAPI.createAllocation(form);
      setMsg({ text: 'Unit allocated!', type: 'success' });
      setShowForm(false);
      setForm({ lecturer: '', unit: '', semester: '' });
      init();
    } catch (e) {
      setMsg({ text: e.response?.data?.detail || 'Failed.', type: 'error' });
    } finally { setSubmitting(false); }
  };

  const deleteAlloc = async (id) => {
    if (!window.confirm('Remove this allocation?')) return;
    await ictAPI.deleteAllocation(id);
    init();
  };

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Unit Allocation</h1>
            <p className="page-subtitle">Assign units to lecturers per semester</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Allocate Unit'}
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>➕ New Allocation</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Lecturer *</label>
                <select className="form-select" required value={form.lecturer} onChange={e => setForm({ ...form, lecturer: e.target.value })}>
                  <option value="">Select lecturer...</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.staff_id} — {l.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select className="form-select" required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option value="">Select unit...</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Semester *</label>
                <select className="form-select" required value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                  <option value="">Select semester...</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.__str__ || `Y${s.year_of_study}S${s.semester_number} (${s.academic_year_name})`}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Allocating...' : 'Allocate'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead><tr><th>Lecturer</th><th>Unit</th><th>Programme</th><th>Yr/Sem</th><th>Semester</th><th></th></tr></thead>
            <tbody>
              {allocations.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.lecturer_name}</td>
                  <td><span className="badge badge-accent" style={{ fontSize: '0.78rem' }}>{a.unit_code}</span> {a.unit_name}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{a.programme_name}</td>
                  <td><span className="badge badge-default">Y{a.year_of_study} S{a.semester_number}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.semester_label}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteAlloc(a.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}