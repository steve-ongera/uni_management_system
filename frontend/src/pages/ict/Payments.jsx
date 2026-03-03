import { useState, useEffect } from 'react';
import { ictAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function ICTPayments({ user }) {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await ictAPI.getPayments(filter !== 'all' ? { status: filter } : {});
      setPayments(data.results || data);
    } catch { } finally { setLoading(false); }
  };

  const confirm = async (id) => {
    try { await ictAPI.confirmPayment(id); setMsg('Payment confirmed!'); load(); }
    catch { setMsg('Failed to confirm.'); }
  };
  const reject = async (id) => {
    try { await ictAPI.rejectPayment(id); setMsg('Payment rejected.'); load(); }
    catch { setMsg('Failed.'); }
  };

  const total = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + Number(p.amount_paid), 0);

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Fee Payments</h1>
            <p className="page-subtitle">Confirm or reject student fee payments</p>
          </div>
          {filter === 'confirmed' && (
            <div className="stat-card">
              <div><div className="stat-value" style={{ fontSize: '1.2rem' }}>KES {total.toLocaleString()}</div><div className="stat-label">Confirmed Total</div></div>
            </div>
          )}
        </div>

        {msg && <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {['pending', 'confirmed', 'rejected', 'all'].map(f => (
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
                <tr><th>Reg. No.</th><th>Student</th><th>Amount (KES)</th><th>Transaction Code</th><th>Semester</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payments found.</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.82rem' }}>{p.reg_number}</td>
                    <td>{p.student_name}</td>
                    <td style={{ fontWeight: 600 }}>KES {Number(p.amount_paid).toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.transaction_code}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.semester_label}</td>
                    <td style={{ fontSize: '0.78rem' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${p.status === 'confirmed' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}`}>{p.status}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {p.status === 'pending' && <>
                        <button className="btn btn-success btn-sm" onClick={() => confirm(p.id)}>✓</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(p.id)}>✕</button>
                      </>}
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