import { useState, useEffect, useCallback } from 'react';
import { ictAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

const actionIcon = { create: '➕', update: '✏️', delete: '🗑️', approve: '✅', reject: '❌' };
const actionBadge = { create: 'success', update: 'info', delete: 'danger', approve: 'success', reject: 'danger' };

export default function ICTLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await ictAPI.getLogs();
      setLogs(data.results || data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <Layout role="ict" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div><h1 className="page-title">System Logs</h1><p className="page-subtitle">Audit trail of all actions</p></div>
          <div className="badge badge-default">{logs.length} entries</div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
            <table>
              <thead><tr><th>Action</th><th>Model</th><th>Description</th><th>Performed By</th><th>Timestamp</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td><span className={`badge badge-${actionBadge[l.action] || 'default'}`}>{actionIcon[l.action]} {l.action}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.model_name}</td>
                    <td style={{ fontSize: '0.88rem' }}>{l.description}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{l.performed_by_name}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</td>
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