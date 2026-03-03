import { useState, useEffect, useCallback } from 'react';
import { ictAPI, coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

// ── Lecturer Detail / Edit Drawer ─────────────────────────────────────────
function LecturerDrawer({ lecturer, onClose, onUpdated }) {
  const [tab, setTab]             = useState('info');
  const [form, setForm]           = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [units, setUnits]         = useState([]);
  const [allocForm, setAllocForm] = useState({ unit: '', semester: '' });
  const [saving, setSaving]       = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [locking, setLocking]     = useState(false);
  const [newPwd, setNewPwd]       = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [dropping, setDropping]   = useState(null);
  const [msg, setMsg]             = useState({ text:'', type:'' });

  useEffect(() => {
    if (!lecturer) return;
    setForm({
      first_name: lecturer.first_name || '',
      last_name:  lecturer.last_name  || '',
      phone:      lecturer.phone      || '',
    });
    setMsg({ text:'', type:'' });
    setTab('info');
    // Load allocations + semesters + units
    Promise.all([
      api.get('/lecturers/allocations/', { params: { lecturer: lecturer.id } }),
      coreAPI.getSemesters(),
      coreAPI.getUnits(),
    ]).then(([a, s, u]) => {
      setAllocations(a.data?.results || a.data || []);
      setSemesters(s.data?.results  || s.data || []);
      setUnits(u.data?.results      || u.data || []);
    }).catch(() => {});
  }, [lecturer]);

  if (!lecturer || !form) return null;

  const initials = `${lecturer.first_name?.[0]||''}${lecturer.last_name?.[0]||''}`.toUpperCase();

  const save = async () => {
    setSaving(true); setMsg({ text:'', type:'' });
    try {
      await api.patch(`/lecturers/profiles/${lecturer.id}/`, form);
      setMsg({ text:'Profile updated.', type:'success' });
      onUpdated();
    } catch { setMsg({ text:'Failed to update.', type:'error' }); }
    finally { setSaving(false); }
  };

  const resetPwd = async () => {
    if (!newPwd.trim()) return;
    setResetting(true); setMsg({ text:'', type:'' });
    try {
      await api.post(`/ict/users/${lecturer.user}/reset-password/`, { password: newPwd });
      setMsg({ text:'Password reset successfully.', type:'success' });
      setNewPwd('');
    } catch { setMsg({ text:'Failed to reset password.', type:'error' }); }
    finally { setResetting(false); }
  };

  const toggleActive = async () => {
    setLocking(true); setMsg({ text:'', type:'' });
    try {
      await api.patch(`/lecturers/profiles/${lecturer.id}/`, { is_active: !lecturer.is_active });
      setMsg({ text: lecturer.is_active ? 'Account locked.' : 'Account unlocked.', type: lecturer.is_active ? 'warning':'success' });
      onUpdated();
    } catch { setMsg({ text:'Failed.', type:'error' }); }
    finally { setLocking(false); }
  };

  const allocate = async () => {
    if (!allocForm.unit || !allocForm.semester) return;
    setAllocating(true); setMsg({ text:'', type:'' });
    try {
      await ictAPI.createAllocation({ lecturer: lecturer.id, ...allocForm });
      setMsg({ text:'Unit allocated!', type:'success' });
      setAllocForm({ unit:'', semester:'' });
      const r = await api.get('/lecturers/allocations/', { params:{ lecturer: lecturer.id } });
      setAllocations(r.data?.results || r.data || []);
    } catch(e) {
      setMsg({ text: e.response?.data?.non_field_errors?.[0] || e.response?.data?.detail || 'Allocation failed.', type:'error' });
    } finally { setAllocating(false); }
  };

  const removeAlloc = async (id) => {
    if (!window.confirm('Remove this unit allocation?')) return;
    setDropping(id);
    try {
      await ictAPI.deleteAllocation(id);
      setAllocations(prev => prev.filter(a => a.id !== id));
    } catch { setMsg({ text:'Failed to remove.', type:'error' }); }
    finally { setDropping(null); }
  };

  const tabStyle = (t) => ({
    padding:'0.5rem 0.875rem', border:'none',
    background: tab===t ? 'var(--white)' : 'transparent',
    borderRadius:'var(--radius-md)',
    fontFamily:'var(--font-body)', fontSize:'0.8125rem',
    fontWeight: tab===t ? 600 : 400,
    color: tab===t ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor:'pointer', transition:'all var(--transition)',
    boxShadow: tab===t ? 'var(--shadow-xs)' : 'none',
  });

  const alertIcon = { success:'bi-check-circle', error:'bi-exclamation-circle', warning:'bi-exclamation-triangle' };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(17,24,39,0.4)',backdropFilter:'blur(2px)',zIndex:200,animation:'fadeIn 0.18s ease' }} />
      <div style={{ position:'fixed',top:0,right:0,bottom:0,width:520,maxWidth:'95vw',background:'var(--white)',borderLeft:'1px solid var(--border)',zIndex:201,display:'flex',flexDirection:'column',boxShadow:'-8px 0 40px rgba(0,0,0,0.1)',animation:'slideInRight 0.25s ease' }}>

        {/* Drawer header */}
        <div style={{ padding:'1.25rem 1.5rem',borderBottom:'1px solid var(--border)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:'0.875rem' }}>
            <div style={{ width:44,height:44,borderRadius:'var(--radius-md)',background:'#7c3aed',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1rem',flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontWeight:700,fontSize:'1rem',fontFamily:'var(--font-display)' }}>{lecturer.first_name} {lecturer.last_name}</div>
              <div style={{ fontSize:'0.78rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)',marginTop:1 }}>{lecturer.staff_id}</div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'0.5rem' }}>
              <span className={`badge badge-${lecturer.is_active?'success':'danger'}`}>
                <i className={`bi ${lecturer.is_active?'bi-unlock':'bi-lock'}`} />
                {lecturer.is_active ? 'Active':'Locked'}
              </span>
              <button className="modal-close" onClick={onClose}><i className="bi bi-x" /></button>
            </div>
          </div>

          {/* Allocation mini stat */}
          <div style={{ display:'flex',gap:'1rem',marginTop:'1rem' }}>
            {[
              { label:'Allocated Units', value: allocations.length },
              { label:'Phone', value: lecturer.phone || '—' },
            ].map(s => (
              <div key={s.label} style={{ flex:1,background:'var(--surface)',borderRadius:'var(--radius-sm)',padding:'0.5rem 0.75rem',border:'1px solid var(--border)',textAlign:'center' }}>
                <div style={{ fontWeight:700,fontSize:'1rem',fontFamily:'var(--font-display)' }}>{s.value}</div>
                <div style={{ fontSize:'0.7rem',color:'var(--text-muted)',marginTop:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding:'0.625rem 1.25rem',borderBottom:'1px solid var(--border)',background:'var(--surface)',flexShrink:0 }}>
          <div style={{ display:'flex',gap:'0.25rem' }}>
            {[
              { key:'info',    icon:'bi-person-lines-fill', label:'Profile' },
              { key:'units',   icon:'bi-diagram-3',         label:`Units (${allocations.length})` },
              { key:'account', icon:'bi-shield-lock',       label:'Account' },
            ].map(t => (
              <button key={t.key} style={tabStyle(t.key)} onClick={() => setTab(t.key)}>
                <i className={`bi ${t.icon}`} style={{ marginRight:4 }} />{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ margin:'0.75rem 1.25rem 0',flexShrink:0 }}>
            <i className={`bi ${alertIcon[msg.type]||'bi-info-circle'}`} />{msg.text}
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1,overflowY:'auto',padding:'1.25rem 1.5rem' }}>

          {/* ── Profile tab ── */}
          {tab === 'info' && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.875rem' }}>
              {[
                { key:'first_name', label:'First Name' },
                { key:'last_name',  label:'Last Name' },
                { key:'phone',      label:'Phone' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" value={form[f.key]||''} onChange={e => setForm({...form,[f.key]:e.target.value})} />
                </div>
              ))}
              {/* Read-only */}
              <div style={{ gridColumn:'1/-1',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'0.875rem',marginTop:'0.5rem' }}>
                <div style={{ fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:'0.625rem' }}>Read-only</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem 1rem' }}>
                  {[{ label:'Staff ID', value: lecturer.staff_id },{ label:'Full Name', value: `${lecturer.first_name} ${lecturer.last_name}` }].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:600 }}>{f.label}</div>
                      <div style={{ fontSize:'0.85rem',fontWeight:500,marginTop:2 }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Units / Allocations tab ── */}
          {tab === 'units' && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1.25rem' }}>

              {/* Allocate form */}
              <div style={{ border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden' }}>
                <div style={{ padding:'0.875rem 1rem',borderBottom:'1px solid var(--border)',background:'var(--surface)' }}>
                  <div className="section-title" style={{ fontSize:'0.8125rem' }}>
                    <i className="bi bi-plus-circle" /> Allocate Unit
                  </div>
                </div>
                <div style={{ padding:'1rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="form-select" value={allocForm.unit} onChange={e => setAllocForm({...allocForm,unit:e.target.value})}>
                      <option value="">Select unit...</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-select" value={allocForm.semester} onChange={e => setAllocForm({...allocForm,semester:e.target.value})}>
                      <option value="">Select semester...</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>{s.academic_year_name} — Y{s.year_of_study}S{s.semester_number}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <button className="btn btn-primary btn-sm" onClick={allocate} disabled={allocating || !allocForm.unit || !allocForm.semester}>
                      {allocating
                        ? <><span className="spinner" style={{ width:13,height:13 }} /> Allocating...</>
                        : <><i className="bi bi-plus-lg" /> Allocate Unit</>
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Current allocations */}
              {allocations.length === 0 ? (
                <div className="empty-state" style={{ padding:'2rem' }}>
                  <i className="bi bi-journal-x" />
                  <div className="empty-state-title">No units allocated</div>
                  <div className="empty-state-desc">Use the form above to assign units to this lecturer.</div>
                </div>
              ) : (
                <div style={{ display:'flex',flexDirection:'column',gap:'0.5rem' }}>
                  {allocations.map(a => (
                    <div key={a.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem 0.875rem',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',background:'var(--white)',gap:'0.75rem' }}>
                      <div style={{ minWidth:0 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:'0.375rem',flexWrap:'wrap',marginBottom:4 }}>
                          <span className="badge badge-accent">{a.unit_code}</span>
                          <span className="badge badge-default">{a.semester_label || `Sem ${a.semester}`}</span>
                        </div>
                        <div style={{ fontSize:'0.875rem',fontWeight:500 }}>{a.unit_name}</div>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{ flexShrink:0 }} onClick={() => removeAlloc(a.id)} disabled={dropping===a.id}>
                        {dropping===a.id
                          ? <span className="spinner" style={{ width:13,height:13 }} />
                          : <><i className="bi bi-trash3" /> Remove</>
                        }
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Account tab ── */}
          {tab === 'account' && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1.25rem' }}>

              {/* Lock / unlock */}
              <div style={{ border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden' }}>
                <div style={{ padding:'0.875rem 1rem',borderBottom:'1px solid var(--border)',background:'var(--surface)' }}>
                  <div className="section-title" style={{ fontSize:'0.8125rem' }}><i className="bi bi-shield-lock" /> Account Status</div>
                </div>
                <div style={{ padding:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem' }}>
                  <div>
                    <div style={{ fontWeight:600,fontSize:'0.9rem' }}>{lecturer.is_active ? 'Account is Active':'Account is Locked'}</div>
                    <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:2 }}>
                      {lecturer.is_active ? 'Lecturer can log in and access the portal.':'Lecturer cannot log in.'}
                    </div>
                  </div>
                  <button className={`btn btn-sm ${lecturer.is_active?'btn-danger':'btn-success'}`} onClick={toggleActive} disabled={locking} style={{ flexShrink:0 }}>
                    {locking
                      ? <><span className="spinner" style={{ width:13,height:13 }} /> Working...</>
                      : lecturer.is_active
                        ? <><i className="bi bi-lock" /> Lock</>
                        : <><i className="bi bi-unlock" /> Unlock</>
                    }
                  </button>
                </div>
              </div>

              {/* Reset password */}
              <div style={{ border:'1px solid var(--border)',borderRadius:'var(--radius-md)',overflow:'hidden' }}>
                <div style={{ padding:'0.875rem 1rem',borderBottom:'1px solid var(--border)',background:'var(--surface)' }}>
                  <div className="section-title" style={{ fontSize:'0.8125rem' }}><i className="bi bi-key" /> Reset Password</div>
                </div>
                <div style={{ padding:'1rem' }}>
                  <div className="form-group" style={{ marginBottom:'0.875rem' }}>
                    <label className="form-label">New Password</label>
                    <div style={{ position:'relative',display:'flex',alignItems:'center' }}>
                      <input className="form-input" type={showPwd?'text':'password'} value={newPwd}
                        onChange={e=>setNewPwd(e.target.value)} placeholder="Enter new password..."
                        style={{ paddingRight:'2.5rem' }} />
                      <button type="button" onClick={()=>setShowPwd(v=>!v)}
                        style={{ position:'absolute',right:'0.625rem',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'0.9rem',display:'flex',alignItems:'center' }}>
                        <i className={`bi ${showPwd?'bi-eye-slash':'bi-eye'}`} />
                      </button>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={resetPwd} disabled={resetting||!newPwd.trim()}>
                    {resetting ? <><span className="spinner" style={{ width:13,height:13 }} /> Resetting...</> : <><i className="bi bi-key" /> Reset Password</>}
                  </button>
                </div>
              </div>

              {/* Account info */}
              <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'0.875rem 1rem' }}>
                <div style={{ fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:'0.625rem' }}>Account Info</div>
                <div style={{ display:'flex',flexDirection:'column',gap:'0.375rem' }}>
                  {[{ label:'Username', value: lecturer.staff_id },{ label:'Role', value:'Lecturer' },{ label:'Account ID', value:`#${lecturer.user||lecturer.id}` }].map(f => (
                    <div key={f.label} style={{ display:'flex',justifyContent:'space-between',fontSize:'0.8125rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>{f.label}</span>
                      <span style={{ fontWeight:500,fontFamily:f.label==='Username'||f.label==='Account ID'?'var(--font-mono)':'inherit',fontSize:f.label==='Account ID'?'0.78rem':'0.8125rem' }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'info' && (
          <div style={{ padding:'1rem 1.5rem',borderTop:'1px solid var(--border)',flexShrink:0,display:'flex',justifyContent:'flex-end',gap:'0.625rem',background:'var(--white)' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width:14,height:14 }} /> Saving...</> : <><i className="bi bi-floppy" /> Save Changes</>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ICTLecturers({ user, onLogout }) {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [form, setForm] = useState({ staff_id:'', first_name:'', last_name:'', phone:'', password:'' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState({ text:'', type:'' });

  const fetchLecturers = useCallback(async () => {
    try {
      const { data } = await ictAPI.getAllLecturers();
      setLecturers(data.results || data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLecturers(); }, [fetchLecturers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg({ text:'', type:'' });
    try {
      await ictAPI.createLecturer(form);
      setMsg({ text:'Lecturer created successfully!', type:'success' });
      setShowForm(false);
      setForm({ staff_id:'', first_name:'', last_name:'', phone:'', password:'' });
      fetchLecturers();
    } catch(e) {
      setMsg({ text: e.response?.data?.error || 'Failed to create lecturer.', type:'error' });
    } finally { setSubmitting(false); }
  };

  const filtered = lecturers.filter(l => {
    const q = search.toLowerCase();
    return !q || l.staff_id?.toLowerCase().includes(q)
      || `${l.first_name} ${l.last_name}`.toLowerCase().includes(q);
  });

  const alertIcon = { error:'bi-exclamation-circle', success:'bi-check-circle', warning:'bi-exclamation-triangle' };

  return (
    <Layout role="ict" user={user} onLogout={onLogout}>
      <div className="animate-fade">

        <div className="page-header">
          <div>
            <h1 className="page-title">Lecturers</h1>
            <p className="page-subtitle">{lecturers.length} teaching staff</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><i className="bi bi-x" /> Cancel</> : <><i className="bi bi-person-plus" /> Add Lecturer</>}
          </button>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom:'1.25rem' }}>
            <i className={`bi ${alertIcon[msg.type]||'bi-info-circle'}`} />{msg.text}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="card" style={{ padding:0,overflow:'hidden',marginBottom:'1.5rem' }}>
            <div style={{ padding:'1rem 1.375rem',borderBottom:'1px solid var(--border)',background:'var(--surface)' }}>
              <div className="section-title"><i className="bi bi-person-plus-fill" /> New Lecturer</div>
            </div>
            <form onSubmit={handleCreate} style={{ padding:'1.25rem 1.375rem' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem' }}>
                {[
                  { key:'staff_id',   label:'Staff ID *',   req:true,  ph:'e.g. LEC001' },
                  { key:'password',   label:'Password *',   req:true,  type:'password' },
                  { key:'first_name', label:'First Name *', req:true },
                  { key:'last_name',  label:'Last Name *',  req:true },
                  { key:'phone',      label:'Phone' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type||'text'} required={f.req} placeholder={f.ph||''}
                      value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',gap:'0.625rem' }}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner" style={{ width:14,height:14 }} /> Creating...</> : <><i className="bi bi-person-check" /> Create Lecturer</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ padding:'0.875rem 1.25rem',borderBottom:'1px solid var(--border)',display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap' }}>
            <div style={{ position:'relative',flex:'1 1 240px',minWidth:200 }}>
              <i className="bi bi-search" style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'0.85rem',pointerEvents:'none' }} />
              <input className="form-input" placeholder="Search name or staff ID..."
                value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.25rem' }} />
            </div>
            <span className="badge badge-default">{filtered.length} results</span>
          </div>

          {loading ? (
            <div style={{ padding:'1.5rem' }}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:44,marginBottom:8 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="bi bi-person-x" /><div className="empty-state-title">No lecturers found</div></div>
          ) : (
            <div className="table-wrapper" style={{ border:'none',borderRadius:0 }}>
              <table>
                <thead>
                  <tr><th>Staff ID</th><th>Name</th><th>Phone</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id} style={{ cursor:'pointer' }} onClick={()=>setSelected(l)}>
                      <td><span className="badge badge-accent" style={{ fontFamily:'var(--font-mono)',fontSize:'0.72rem' }}>{l.staff_id}</span></td>
                      <td>
                        <div style={{ display:'flex',alignItems:'center',gap:'0.625rem' }}>
                          <div style={{ width:28,height:28,borderRadius:'var(--radius-sm)',background:'#f5f3ff',color:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.7rem',flexShrink:0 }}>
                            {`${l.first_name?.[0]||''}${l.last_name?.[0]||''}`.toUpperCase()}
                          </div>
                          <span style={{ fontWeight:500 }}>{l.full_name || `${l.first_name} ${l.last_name}`}</span>
                        </div>
                      </td>
                      <td style={{ color:'var(--text-secondary)',fontSize:'0.875rem' }}>{l.phone||'—'}</td>
                      <td><span className={`badge badge-${l.is_active?'success':'danger'}`}>{l.is_active?'Active':'Locked'}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setSelected(l);}}>
                          <i className="bi bi-eye" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <LecturerDrawer
          lecturer={selected}
          onClose={()=>setSelected(null)}
          onUpdated={()=>{ fetchLecturers(); setSelected(null); }}
        />
      )}
    </Layout>
  );
}