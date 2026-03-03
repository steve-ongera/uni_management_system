import { useState, useEffect, useCallback } from 'react';
import { ictAPI, coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    registration_number: '', kcse_index: '', first_name: '', last_name: '',
    middle_name: '', programme: '', current_year_of_study: 1, current_semester_number: 1,
    phone: '', id_number: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');

  const init = useCallback(async () => {
    const [{ data: studs }, { data: progs }] = await Promise.all([
      ictAPI.getAllStudents(), coreAPI.getProgrammes()
    ]);
    setStudents(studs.results || studs);
    setProgrammes(progs.results || progs);
    setLoading(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ text: '', type: '' });
    try {
      await ictAPI.createStudent(form);
      setMsg({ text: 'Student created successfully!', type: 'success' });
      setShowForm(false);
      setForm({ registration_number: '', kcse_index: '', first_name: '', last_name: '', middle_name: '', programme: '', current_year_of_study: 1, current_semester_number: 1, phone: '', id_number: '' });
      init();
    } catch (e) {
      setMsg({ text: e.response?.data?.error || 'Failed to create student.', type: 'error' });
    } finally { setSubmitting(false); }
  };

  const filtered = students.filter(s =>
    !search || s.registration_number.toLowerCase().includes(search.toLowerCase()) ||
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">{students.length} enrolled students</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Student'}
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>➕ Add New Student</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input className="form-input" required placeholder="SC211/0530/2022"
                  value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">KCSE Index (Password) *</label>
                <input className="form-input" required placeholder="0011/8278/2019"
                  value={form.kcse_index} onChange={e => setForm({ ...form, kcse_index: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Programme *</label>
                <select className="form-select" required value={form.programme}
                  onChange={e => setForm({ ...form, programme: e.target.value })}>
                  <option value="">Select programme...</option>
                  {programmes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" required value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-input" required value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input className="form-input" value={form.middle_name}
                  onChange={e => setForm({ ...form, middle_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Year</label>
                <input className="form-input" type="number" min="1" max="6"
                  value={form.current_year_of_study}
                  onChange={e => setForm({ ...form, current_year_of_study: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Semester</label>
                <input className="form-input" type="number" min="1" max="3"
                  value={form.current_semester_number}
                  onChange={e => setForm({ ...form, current_semester_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <input className="form-input" placeholder="🔍 Search by name or reg number..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 360 }} />
          </div>
          {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 8 }} /> : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Reg. Number</th>
                    <th>Name</th>
                    <th>Programme</th>
                    <th>Year/Sem</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><span className="badge badge-accent" style={{ fontSize: '0.78rem' }}>{s.registration_number}</span></td>
                      <td style={{ fontWeight: 500 }}>{s.full_name || `${s.first_name} ${s.last_name}`}</td>
                      <td style={{ fontSize: '0.85rem' }}>{s.programme_code}</td>
                      <td><span className="badge badge-default">Y{s.current_year_of_study} S{s.current_semester_number}</span></td>
                      <td><span className={`badge badge-${s.is_active ? 'success' : 'danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
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