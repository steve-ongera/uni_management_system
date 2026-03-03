import { useState, useEffect } from 'react';
import { studentAPI, coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function UnitRegistration({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const [{ data: dash }] = await Promise.all([studentAPI.getDashboard()]);
      setDashboard(dash);
      const student = dash.student;
      // Fetch available units for current year/semester
      const { data: units } = await coreAPI.getUnits({
        programme: student.programme,
        year_of_study: student.current_year_of_study,
        semester_number: student.current_semester_number,
      });
      setAvailableUnits(units.results || units);
      if (dash.active_semester_id) {
        const { data: regs } = await studentAPI.getRegistrations({ semester: dash.active_semester_id });
        setRegistrations(regs.results || regs);
      }
    } catch (e) {
      setMsg({ text: 'Failed to load units.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const register = async (unitId) => {
    if (!dashboard?.active_semester_id) return;
    setMsg({ text: '', type: '' });
    try {
      await studentAPI.registerUnit({ unit: unitId, semester: dashboard.active_semester_id });
      setMsg({ text: 'Unit registered successfully!', type: 'success' });
      init();
    } catch (e) {
      setMsg({ text: e.response?.data?.error || 'Failed to register unit.', type: 'error' });
    }
  };

  const drop = async (regId) => {
    if (!window.confirm('Drop this unit?')) return;
    try {
      await studentAPI.dropUnit(regId);
      setMsg({ text: 'Unit dropped.', type: 'warning' });
      init();
    } catch {
      setMsg({ text: 'Failed to drop unit.', type: 'error' });
    }
  };

  const registeredUnitIds = registrations.filter(r => r.status === 'registered').map(r => r.unit);
  const canRegister = dashboard?.has_reported && dashboard?.registration_open;

  if (loading) return <Layout role="student" user={user}><div className="skeleton" style={{ height: 400, margin: '2rem', borderRadius: 12 }} /></Layout>;

  return (
    <Layout role="student" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Unit Registration</h1>
            <p className="page-subtitle">
              {dashboard?.active_semester} — Year {dashboard?.student?.current_year_of_study} Sem {dashboard?.student?.current_semester_number}
            </p>
          </div>
          <div className="badge badge-accent">{registeredUnitIds.length} Registered</div>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type === 'error' ? 'error' : msg.type === 'success' ? 'success' : 'warning'}`} style={{ marginBottom: '1.5rem' }}>
            {msg.text}
          </div>
        )}

        {!dashboard?.has_reported && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span> You must report for the semester before registering units. Go to Dashboard.
          </div>
        )}

        {dashboard?.has_reported && !dashboard?.registration_open && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>ℹ️</span> You have reported for this semester, but unit registration is not yet open.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Available Units */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1rem' }}>
              📋 Available Units
            </h3>
            {availableUnits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">No units found</div>
                <div className="empty-state-desc">Units for your programme/semester are not set up yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableUnits.map(unit => {
                  const isRegistered = registeredUnitIds.includes(unit.id);
                  return (
                    <div key={unit.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', background: isRegistered ? 'var(--success-soft)' : 'var(--white)',
                      gap: '0.75rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>{unit.code}</span>
                          {isRegistered && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✓ Registered</span>}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>{unit.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{unit.credit_hours} Credit Hours</div>
                      </div>
                      {!isRegistered && canRegister && (
                        <button className="btn btn-primary btn-sm" onClick={() => register(unit.id)}>
                          Register
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Registered Units */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1rem' }}>
              ✅ My Registered Units
            </h3>
            {registrations.filter(r => r.status === 'registered').length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">No units registered yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {registrations.filter(r => r.status === 'registered').map(reg => (
                  <div key={reg.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)', background: 'var(--white)', gap: '0.75rem'
                  }}>
                    <div>
                      <span className="badge badge-accent" style={{ fontSize: '0.75rem', marginBottom: 4 }}>{reg.unit_code}</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{reg.unit_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{reg.unit_credit_hours} Cr. Hrs</div>
                    </div>
                    {canRegister && (
                      <button className="btn btn-danger btn-sm" onClick={() => drop(reg.id)}>Drop</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}