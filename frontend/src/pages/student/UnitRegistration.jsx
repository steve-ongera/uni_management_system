import { useState, useEffect, useCallback } from 'react';
import { studentAPI, coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function UnitRegistration({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // unitId or regId currently processing
  const [msg, setMsg] = useState({ text: '', type: '' });

  const init = useCallback(async () => {
    try {
      const [{ data: dash }] = await Promise.all([studentAPI.getDashboard()]);
      setDashboard(dash);
      const student = dash.student;
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
    } catch {
      setMsg({ text: 'Failed to load units.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { init(); }, [init]);

  const register = async (unitId) => {
    if (!dashboard?.active_semester_id) return;
    setMsg({ text: '', type: '' });
    setBusy(unitId);
    try {
      await studentAPI.registerUnit({ unit: unitId, semester: dashboard.active_semester_id });
      setMsg({ text: 'Unit registered successfully!', type: 'success' });
      init();
    } catch (e) {
      setMsg({ text: e.response?.data?.error || 'Failed to register unit.', type: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const drop = async (regId) => {
    if (!window.confirm('Are you sure you want to drop this unit?')) return;
    setMsg({ text: '', type: '' });
    setBusy(regId);
    try {
      await studentAPI.dropUnit(regId);
      setMsg({ text: 'Unit dropped successfully.', type: 'warning' });
      init();
    } catch {
      setMsg({ text: 'Failed to drop unit.', type: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const registeredUnitIds = registrations.filter(r => r.status === 'registered').map(r => r.unit);
  const registeredList   = registrations.filter(r => r.status === 'registered');
  const canRegister      = dashboard?.has_reported && dashboard?.registration_open;

  const alertIcon = { error: 'bi-exclamation-circle', success: 'bi-check-circle', warning: 'bi-exclamation-triangle', info: 'bi-info-circle' };

  if (loading) return (
    <Layout role="student" user={user} onLogout={onLogout}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: 56, width: '45%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
          <div className="skeleton" style={{ height: 360 }} />
          <div className="skeleton" style={{ height: 360 }} />
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout role="student" user={user} onLogout={onLogout}>
      <div className="animate-fade">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Unit Registration</h1>
            <p className="page-subtitle">
              {dashboard?.active_semester}&nbsp;·&nbsp;
              Year {dashboard?.student?.current_year_of_study}&nbsp;
              Sem {dashboard?.student?.current_semester_number}
            </p>
          </div>
          <span className="badge badge-accent" style={{ alignSelf: 'flex-start', padding: '0.375rem 0.75rem' }}>
            <i className="bi bi-journal-check" />
            {registeredUnitIds.length} Registered
          </span>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.25rem' }}>
            <i className={`bi ${alertIcon[msg.type] || 'bi-info-circle'}`} />
            {msg.text}
          </div>
        )}

        {/* Status banners */}
        {!dashboard?.has_reported && (
          <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-exclamation-triangle" />
            You must report for the semester before registering units. Go to your Dashboard first.
          </div>
        )}
        {dashboard?.has_reported && !dashboard?.registration_open && (
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-clock" />
            You have reported for this semester, but unit registration is not yet open.
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* ── Available Units ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '1rem 1.375rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div className="section-title">
                <i className="bi bi-list-ul" />
                Available Units
              </div>
              <span className="badge badge-default">{availableUnits.length} units</span>
            </div>

            <div style={{ padding: '0.875rem' }}>
              {availableUnits.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox" />
                  <div className="empty-state-title">No units found</div>
                  <div className="empty-state-desc">Units for your programme and semester have not been set up yet.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {availableUnits.map(unit => {
                    const isRegistered = registeredUnitIds.includes(unit.id);
                    const isBusy = busy === unit.id;
                    return (
                      <div
                        key={unit.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.875rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isRegistered ? '#bbf7d0' : 'var(--border)'}`,
                          background: isRegistered ? 'var(--success-soft)' : 'var(--white)',
                          gap: '0.75rem',
                          transition: 'background var(--transition)',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-accent">{unit.code}</span>
                            {isRegistered && (
                              <span className="badge badge-success">
                                <i className="bi bi-check-circle-fill" />
                                Registered
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: 5, color: 'var(--text-primary)' }}>
                            {unit.name}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <i className="bi bi-clock" />
                            {unit.credit_hours} Credit Hours
                          </div>
                        </div>
                        {!isRegistered && canRegister && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => register(unit.id)}
                            disabled={isBusy}
                            style={{ flexShrink: 0 }}
                          >
                            {isBusy
                              ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Adding...</>
                              : <><i className="bi bi-plus-lg" /> Register</>
                            }
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── My Registered Units ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '1rem 1.375rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div className="section-title">
                <i className="bi bi-journal-check" />
                My Registered Units
              </div>
              <span className="badge badge-success">{registeredList.length} active</span>
            </div>

            <div style={{ padding: '0.875rem' }}>
              {registeredList.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-journal-x" />
                  <div className="empty-state-title">No units registered yet</div>
                  <div className="empty-state-desc">Register units from the list on the left.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {registeredList.map(reg => {
                    const isBusy = busy === reg.id;
                    return (
                      <div
                        key={reg.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.875rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--white)',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <span className="badge badge-accent" style={{ marginBottom: 5 }}>{reg.unit_code}</span>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {reg.unit_name}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <i className="bi bi-clock" />
                            {reg.unit_credit_hours} Cr. Hrs
                          </div>
                        </div>
                        {canRegister && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => drop(reg.id)}
                            disabled={isBusy}
                            style={{ flexShrink: 0 }}
                          >
                            {isBusy
                              ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Dropping...</>
                              : <><i className="bi bi-trash3" /> Drop</>
                            }
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}