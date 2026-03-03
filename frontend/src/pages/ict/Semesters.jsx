import { useState, useEffect, useCallback } from 'react';
import { coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

const EMPTY_FORM = { academic_year:'', year_of_study:1, semester_number:1, start_date:'', end_date:'', is_active:false, registration_open:false };

function SemesterModal({ mode, sem, years, onClose, onSaved }) {
  const [form, setForm]     = useState(mode==='edit' && sem ? {
    academic_year: sem.academic_year, year_of_study: sem.year_of_study,
    semester_number: sem.semester_number, start_date: sem.start_date,
    end_date: sem.end_date, is_active: sem.is_active, registration_open: sem.registration_open,
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (mode === 'edit') await coreAPI.updateSemester(sem.id, form);
      else await coreAPI.createSemester(form);
      onSaved();
    } catch(e) {
      const d = e.response?.data;
      setErr(d?.non_field_errors?.[0] || d?.detail || Object.values(d||{})[0]?.[0] || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const CheckRow = ({ field, label, desc }) => (
    <label style={{ display:'flex',alignItems:'flex-start',gap:'0.625rem',padding:'0.75rem',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',cursor:'pointer' }}>
      <input type="checkbox" checked={form[field]} onChange={e=>setForm({...form,[field]:e.target.checked})}
        style={{ marginTop:2,accentColor:'var(--accent)',width:15,height:15,flexShrink:0 }} />
      <div>
        <div style={{ fontWeight:600,fontSize:'0.875rem' }}>{label}</div>
        <div style={{ fontSize:'0.78rem',color:'var(--text-muted)',marginTop:1 }}>{desc}</div>
      </div>
    </label>
  );

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth:520 }}>
        <div className="modal-header">
          <div className="modal-title">
            <i className={`bi ${mode==='edit'?'bi-pencil':'bi-calendar-plus'}`} style={{ marginRight:8,color:'var(--accent)' }} />
            {mode==='edit' ? 'Edit Semester' : 'New Semester'}
          </div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>

        {err && <div className="alert alert-error" style={{ marginBottom:'1rem' }}><i className="bi bi-exclamation-circle" />{err}</div>}

        <form onSubmit={save}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Academic Year *</label>
              <select className="form-select" required value={form.academic_year} onChange={e=>setForm({...form,academic_year:e.target.value})}>
                <option value="">Select academic year...</option>
                {years.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study *</label>
              <input className="form-input" type="number" min="1" max="6" required
                value={form.year_of_study} onChange={e=>setForm({...form,year_of_study:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Semester Number *</label>
              <input className="form-input" type="number" min="1" max="3" required
                value={form.semester_number} onChange={e=>setForm({...form,semester_number:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input className="form-input" type="date" required
                value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input className="form-input" type="date" required
                value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} />
            </div>
            <CheckRow field="is_active" label="Active Semester" desc="Sets this as the current running semester." />
            <CheckRow field="registration_open" label="Registration Open" desc="Allows students to register units." />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width:14,height:14 }} /> Saving...</> : <><i className="bi bi-floppy" /> {mode==='edit'?'Save Changes':'Create Semester'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ sem, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/auth/semesters/${sem.id}/`);
      onDeleted();
    } catch { setErr('Cannot delete — semester may have linked registrations or reports.'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth:420 }}>
        <div className="modal-header">
          <div className="modal-title" style={{ color:'var(--danger)' }}><i className="bi bi-trash3" style={{ marginRight:8 }} />Delete Semester</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>
        {err && <div className="alert alert-error" style={{ marginBottom:'1rem' }}><i className="bi bi-exclamation-circle" />{err}</div>}
        <p style={{ fontSize:'0.9rem',color:'var(--text-secondary)',marginBottom:'0.5rem' }}>
          Delete <strong>{sem.academic_year_name} — Year {sem.year_of_study} Sem {sem.semester_number}</strong>?
        </p>
        <p style={{ fontSize:'0.8125rem',color:'var(--text-muted)' }}>Semesters with linked student reports or registrations cannot be deleted.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={doDelete} disabled={deleting}
            style={{ background:'var(--danger)',color:'white',borderColor:'var(--danger)' }}>
            {deleting ? <><span className="spinner" style={{ width:14,height:14,borderTopColor:'white' }} /> Deleting...</> : <><i className="bi bi-trash3" /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ICTSemesters({ user, onLogout }) {
  const [semesters, setSemesters] = useState([]);
  const [years, setYears]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toggling, setToggling]   = useState(null);
  const [modal, setModal]         = useState(null);
  const [msg, setMsg]             = useState({ text:'', type:'' });
  const [filterYear, setFilterYear] = useState('');

  const init = useCallback(async () => {
    try {
      const [{ data:sems }, { data:ys }] = await Promise.all([coreAPI.getSemesters(), coreAPI.getAcademicYears()]);
      setSemesters(sems.results || sems);
      setYears(ys.results || ys);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { init(); }, [init]);

  const toggleField = async (sem, field) => {
    setToggling(`${sem.id}-${field}`);
    try {
      await coreAPI.updateSemester(sem.id, { [field]: !sem[field] });
      init();
    } catch { setMsg({ text:'Failed to update.', type:'error' }); }
    finally { setToggling(null); }
  };

  const onSaved = (txt='Semester saved.') => { setMsg({ text:txt, type:'success' }); setModal(null); init(); };
  const onDeleted = () => { setMsg({ text:'Semester deleted.', type:'warning' }); setModal(null); init(); };

  const filtered = semesters.filter(s => !filterYear || String(s.academic_year) === filterYear);

  const alertIcon = { success:'bi-check-circle', error:'bi-exclamation-circle', warning:'bi-exclamation-triangle' };

  const ToggleBtn = ({ sem, field, activeLabel, inactiveLabel, activeClass, inactiveClass }) => {
    const key = `${sem.id}-${field}`;
    const busy = toggling === key;
    return (
      <button
        onClick={() => toggleField(sem, field)}
        disabled={busy}
        className={`badge ${sem[field] ? activeClass : inactiveClass}`}
        style={{ border:'1px solid transparent',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'0.25rem',padding:'0.25rem 0.625rem',fontFamily:'var(--font-body)' }}
      >
        {busy
          ? <span className="spinner" style={{ width:10,height:10 }} />
          : <i className={`bi ${sem[field] ? 'bi-toggle-on':'bi-toggle-off'}`} />
        }
        {sem[field] ? activeLabel : inactiveLabel}
      </button>
    );
  };

  return (
    <Layout role="ict" user={user} onLogout={onLogout}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Semesters</h1>
            <p className="page-subtitle">Manage academic semesters and registration windows</p>
          </div>
          <button className="btn btn-primary" onClick={()=>setModal({ type:'create' })}>
            <i className="bi bi-plus-lg" /> Add Semester
          </button>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom:'1.25rem' }}>
            <i className={`bi ${alertIcon[msg.type]||'bi-info-circle'}`} />{msg.text}
          </div>
        )}

        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ padding:'0.875rem 1.25rem',borderBottom:'1px solid var(--border)',display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap' }}>
            <select className="form-select" value={filterYear} onChange={e=>setFilterYear(e.target.value)}
              style={{ width:'auto',minWidth:180 }}>
              <option value="">All Academic Years</option>
              {years.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
            <span className="badge badge-default">{filtered.length} semesters</span>
          </div>

          {loading ? (
            <div style={{ padding:'1.5rem' }}>{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{ height:44,marginBottom:8 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="bi bi-calendar-x" /><div className="empty-state-title">No semesters found</div></div>
          ) : (
            <div className="table-wrapper" style={{ border:'none',borderRadius:0 }}>
              <table>
                <thead>
                  <tr><th>Academic Year</th><th>Year / Sem</th><th>Dates</th><th>Active</th><th>Registration</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><span className="badge badge-accent">{s.academic_year_name}</span></td>
                      <td style={{ fontWeight:500 }}>Year {s.year_of_study} &nbsp;·&nbsp; Semester {s.semester_number}</td>
                      <td style={{ fontSize:'0.8125rem',color:'var(--text-muted)',whiteSpace:'nowrap' }}>
                        <i className="bi bi-calendar3" style={{ marginRight:4 }} />
                        {s.start_date} → {s.end_date}
                      </td>
                      <td>
                        <ToggleBtn sem={s} field="is_active"
                          activeLabel="Active" inactiveLabel="Inactive"
                          activeClass="badge-success" inactiveClass="badge-default" />
                      </td>
                      <td>
                        <ToggleBtn sem={s} field="registration_open"
                          activeLabel="Open" inactiveLabel="Closed"
                          activeClass="badge-info" inactiveClass="badge-default" />
                      </td>
                      <td>
                        <div style={{ display:'flex',gap:'0.375rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({ type:'edit', sem:s })} title="Edit">
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({ type:'delete', sem:s })} title="Delete"
                            style={{ color:'var(--danger)' }}>
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal?.type === 'create' && (
        <SemesterModal mode="create" years={years} onClose={()=>setModal(null)} onSaved={()=>onSaved('Semester created!')} />
      )}
      {modal?.type === 'edit' && (
        <SemesterModal mode="edit" sem={modal.sem} years={years} onClose={()=>setModal(null)} onSaved={()=>onSaved('Semester updated!')} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm sem={modal.sem} onClose={()=>setModal(null)} onDeleted={onDeleted} />
      )}
    </Layout>
  );
}