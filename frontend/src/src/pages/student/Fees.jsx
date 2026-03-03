import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function StudentFees({ user }) {
  const [payments, setPayments] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount_paid: '', transaction_code: '', semester: '' });
  const [semesters, setSemesters] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const [{ data: pays }, { data: bals }, { data: dash }] = await Promise.all([
        studentAPI.getFeePayments(),
        studentAPI.getFeeBalance(),
        studentAPI.getDashboard(),
      ]);
      setPayments(pays.results || pays);
      setBalances(bals.results || bals);
      if (dash.active_semester_id) {
        setForm(f => ({ ...f, semester: dash.active_semester_id }));
        setSemesters([{ id: dash.active_semester_id, label: dash.active_semester }]);
      }
    } catch { } finally { setLoading(false); }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ text: '', type: '' });
    try {
      await studentAPI.submitPayment(form);
      setMsg({ text: 'Payment submitted! Awaiting confirmation from ICT.', type: 'success' });
      setShowForm(false);
      setForm(f => ({ ...f, amount_paid: '', transaction_code: '' }));
      init();
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || 'Payment submission failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + Number(p.amount_paid), 0);
  const currentBalance = balances.reduce((s, b) => s + Number(b.balance || 0), 0);

  return (
    <Layout role="student" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Fee Payment</h1>
            <p className="page-subtitle">Manage your fee payments and view balances</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Record Payment'}
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef2f2' }}>💳</div>
            <div>
              <div className="stat-value" style={{ color: currentBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                KES {currentBalance.toLocaleString()}
              </div>
              <div className="stat-label">Outstanding Balance</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4' }}>✅</div>
            <div>
              <div className="stat-value">KES {totalPaid.toLocaleString()}</div>
              <div className="stat-label">Total Confirmed Paid</div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1rem' }}>
              📤 Submit Payment Record
            </h3>
            <form onSubmit={handlePay} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Amount Paid (KES)</label>
                <input className="form-input" type="number" min="1" required
                  value={form.amount_paid} onChange={e => setForm({ ...form, amount_paid: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">M-Pesa / Transaction Code</label>
                <input className="form-input" type="text" required placeholder="e.g. QGH4XXXXXX"
                  value={form.transaction_code} onChange={e => setForm({ ...form, transaction_code: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1rem' }}>
            🧾 Payment History
          </h3>
          {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} /> :
            payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💸</div>
                <div className="empty-state-title">No payment records</div>
                <div className="empty-state-desc">Submit your first payment record above.</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction Code</th>
                      <th>Amount (KES)</th>
                      <th>Semester</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.transaction_code}</td>
                        <td style={{ fontWeight: 600 }}>KES {Number(p.amount_paid).toLocaleString()}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.semester_label}</td>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${p.status === 'confirmed' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}`}>
                            {p.status}
                          </span>
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