import { useState, useEffect, useCallback } from 'react';
import { ictAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTLecturers({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staff_id: '', first_name: '', last_name: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchLecturers = useCallback(async () => {
    const { data } = await ictAPI.getAllLecturers();
    setLecturers(data.results || data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLecturers(); }, [fetchLecturers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ictAPI.createLecturer(form);
      setMsg({ text: 'Lecturer created!', type: 'success' });
      setShowForm(false);
      setForm({ staff_id: '', first_name: '', last_name: '', phone: '', password: '' });
      fetchLecturers();
    } catch (e) {
      setMsg({ text: e.response?.data?.error || 'Failed.', type: 'error' });
    } finally { setSubmitting(false); }
  };

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Lecturers</h1>
            <p className="page-subtitle">{lecturers.length} lecturers</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Lecturer'}
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>➕ Add Lecturer</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { field: 'staff_id', label: 'Staff ID *', required: true, placeholder: 'e.g. LEC001' },
                { field: 'password', label: 'Password *', required: true, type: 'password' },
                { field: 'first_name', label: 'First Name *', required: true },
                { field: 'last_name', label: 'Last Name *', required: true },
                { field: 'phone', label: 'Phone' },
              ].map(({ field, label, required, type, placeholder }) => (
                <div key={field} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type || 'text'} required={required} placeholder={placeholder || ''}
                    value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Lecturer'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-wrapper">
          {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
            <table>
              <thead>
                <tr><th>Staff ID</th><th>Name</th><th>Phone</th><th>Status</th></tr>
              </thead>
              <tbody>
                {lecturers.map(l => (
                  <tr key={l.id}>
                    <td><span className="badge badge-accent">{l.staff_id}</span></td>
                    <td style={{ fontWeight: 500 }}>{l.full_name}</td>
                    <td>{l.phone || '—'}</td>
                    <td><span className={`badge badge-${l.is_active ? 'success' : 'danger'}`}>{l.is_active ? 'Active' : 'Inactive'}</span></td>
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