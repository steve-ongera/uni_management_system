import { useState, useEffect, useCallback } from 'react';
import { ictAPI, coreAPI, studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

// ── helpers ──────────────────────────────────────────────────────────────
const gradeColor = {
  A: '#16a34a', 'A-': '#16a34a',
  'B+': '#0284c7', B: '#0284c7', 'B-': '#0284c7',
  'C+': '#d97706', C: '#d97706', 'C-': '#d97706',
  'D+': '#ea580c', D: '#ea580c', 'D-': '#ea580c',
  E: '#dc2626', F: '#dc2626',
};
const gradePassFail = (g) => ['A','A-','B+','B','B-','C+','C','C-'].includes(g) ? 'pass' : 'fail';

// ── Student Detail Drawer ─────────────────────────────────────────────────
function StudentDrawer({ student, programmes, onClose, onUpdated }) {
  const [tab, setTab]           = useState('info');
  const [form, setForm]         = useState(null);
  const [marks, setMarks]       = useState([]);
  const [saving, setSaving]     = useState(false);
  const [resetting, setResetting] = useState(false);
  const [locking, setLocking]   = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [msg, setMsg]           = useState({ text:'', type:'' });

  useEffect(() => {
    if (!student) return;
    setForm({
      first_name: student.first_name || '',
      last_name:  student.last_name  || '',
      middle_name: student.middle_name || '',
      phone: student.phone || '',
      id_number: student.id_number || '',
      programme: student.programme || '',
      current_year_of_study: student.current_year_of_study || 1,
      current_semester_number: student.current_semester_number || 1,
    });
    setMsg({ text:'', type:'' });
    setTab('info');
    // Fetch marks
    api.get('/students/marks/', { params: { student: student.id } })
      .then(r => setMarks(r.data?.results || r.data || []))
      .catch(() => {});
  }, [student]);

  if (!student || !form) return null;

  const initials = `${student.first_name?.[0]||''}${student.last_name?.[0]||''}`.toUpperCase();

  const handleSave = async () => {
    setSaving(true); setMsg({ text:'', type:'' });
    try {
      await api.patch(`/students/profiles/${student.id}/`, form);
      setMsg({ text:'Profile updated successfully.', type:'success' });
      onUpdated();
    } catch(e) {
      setMsg({ text: e.response?.data?.detail || 'Failed to update.', type:'error' });
    } finally { setSaving(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) return;
    setResetting(true); setMsg({ text:'', type:'' });
    try {
      await api.post(`/ict/users/${student.user}/reset-password/`, { password: newPassword });
      setMsg({ text:'Password reset successfully.', type:'success' });
      setNewPassword('');
    } catch(e) {
      setMsg({ text: e.response?.data?.detail || 'Failed to reset password.', type:'error' });
    } finally { setResetting(false); }
  };

  const handleToggleActive = async () => {
    setLocking(true); setMsg({ text:'', type:'' });
    try {
      await api.patch(`/students/profiles/${student.id}/`, { is_active: !student.is_active });
      setMsg({ text: student.is_active ? 'Account locked.' : 'Account unlocked.', type: student.is_active ? 'warning' : 'success' });
      onUpdated();
    } catch {
      setMsg({ text: 'Failed to update account status.', type:'error' });
    } finally { setLocking(false); }
  };

  const avg = marks.length
    ? (marks.reduce((a,m) => a + (parseFloat(m.total_score)||0), 0) / marks.length).toFixed(1)
    : null;
  const passed = marks.filter(m => gradePassFail(m.grade) === 'pass').length;

  const tabStyle = (t) => ({
    padding: '0.5rem 0.875rem',
    border: 'none',
    background: tab === t ? 'var(--white)' : 'transparent',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    boxShadow: tab === t ? 'var(--shadow-xs)' : 'none',
  });

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0,
        background:'rgba(17,24,39,0.4)', backdropFilter:'blur(2px)',
        zIndex:200, animation:'fadeIn 0.18s ease',
      }} />

      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0,
        width: 520, maxWidth:'95vw',
        background:'var(--white)',
        borderLeft:'1px solid var(--border)',
        zIndex:201,
        display:'flex', flexDirection:'column',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.1)',
        animation:'slideInRight 0.25s ease',
      }}>

        {/* Drawer header */}
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
            <div style={{
              width:44, height:44, borderRadius:'var(--radius-md)',
              background:'var(--accent)', color:'white',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:'1rem', flexShrink:0,
            }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'1rem', fontFamily:'var(--font-display)' }}>
                {student.first_name} {student.last_name}
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginTop:1 }}>
                {student.registration_number}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span className={`badge badge-${student.is_active ? 'success' : 'danger'}`}>
                <i className={`bi ${student.is_active ? 'bi-unlock' : 'bi-lock'}`} />
                {student.is_active ? 'Active' : 'Locked'}
              </span>
              <button className="modal-close" onClick={onClose} aria-label="Close">
                <i className="bi bi-x" />
              </button>
            </div>
          </div>

          {/* Mini stats */}
          {marks.length > 0 && (
            <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
              {[
                { label:'Units Taken', value: marks.length },
                { label:'Avg Score', value: avg ? `${avg}%` : '—' },
                { label:'Passed', value: `${passed}/${marks.length}` },
              ].map(s => (
                <div key={s.label} style={{ flex:1, background:'var(--surface)', borderRadius:'var(--radius-sm)', padding:'0.5rem 0.75rem', border:'1px solid var(--border)', textAlign:'center' }}>
                  <div style={{ fontWeight:700, fontSize:'1rem', fontFamily:'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ padding:'0.625rem 1.25rem', borderBottom:'1px solid var(--border)', background:'var(--surface)', flexShrink:0 }}>
          <div style={{ display:'flex', gap:'0.25rem', background:'var(--surface)', borderRadius:'var(--radius-md)', padding:'0.125rem' }}>
            {[
              { key:'info',    icon:'bi-person-lines-fill', label:'Profile' },
              { key:'marks',   icon:'bi-bar-chart-line',    label:'Performance' },
              { key:'account', icon:'bi-shield-lock',       label:'Account' },
            ].map(t => (
              <button key={t.key} style={tabStyle(t.key)} onClick={() => setTab(t.key)}>
                <i className={`bi ${t.icon}`} style={{ marginRight:4 }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ margin:'0.75rem 1.25rem 0', flexShrink:0 }}>
            <i className={`bi ${msg.type==='success'?'bi-check-circle':msg.type==='error'?'bi-exclamation-circle':'bi-exclamation-triangle'}`} />
            {msg.text}
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1.5rem' }}>

          {/* ── Profile tab ── */}
          {tab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                {[
                  { key:'first_name', label:'First Name' },
                  { key:'last_name',  label:'Last Name' },
                  { key:'middle_name',label:'Middle Name' },
                  { key:'phone',      label:'Phone' },
                  { key:'id_number',  label:'ID Number' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" value={form[f.key]||''}
                      onChange={e => setForm({...form,[f.key]:e.target.value})} />
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Programme</label>
                  <select className="form-select" value={form.programme}
                    onChange={e => setForm({...form, programme: e.target.value})}>
                    <option value="">Select...</option>
                    {programmes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Year</label>
                  <input className="form-input" type="number" min="1" max="6"
                    value={form.current_year_of_study}
                    onChange={e => setForm({...form, current_year_of_study: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Semester</label>
                  <input className="form-input" type="number" min="1" max="3"
                    value={form.current_semester_number}
                    onChange={e => setForm({...form, current_semester_number: e.target.value})} />
                </div>
              </div>

              {/* Read-only info */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'0.875rem' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-muted)', marginBottom:'0.625rem' }}>
                  Read-only Information
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem 1rem' }}>
                  {[
                    { label:'Registration No.', value: student.registration_number },
                    { label:'Programme Code',  value: student.programme_code },
                    { label:'Admission Date',  value: student.admission_date || '—' },
                    { label:'Date of Birth',   value: student.date_of_birth || '—' },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600 }}>{f.label}</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:500, marginTop:2 }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Performance tab ── */}
          {tab === 'marks' && (
            <div>
              {marks.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-bar-chart" />
                  <div className="empty-state-title">No marks recorded</div>
                  <div className="empty-state-desc">Marks will appear here once lecturers upload them.</div>
                </div>
              ) : (
                <>
                  {/* Summary row */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem', marginBottom:'1.25rem' }}>
                    {[
                      { label:'Average Score', value:`${avg}%`, color:'var(--accent)' },
                      { label:'Units Passed',  value:`${passed}/${marks.length}`, color:'var(--success)' },
                      { label:'Units Failed',  value:`${marks.length-passed}/${marks.length}`, color: marks.length-passed>0 ? 'var(--danger)' : 'var(--text-muted)' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign:'center', padding:'0.75rem', background:'var(--surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                        <div style={{ fontWeight:800, fontSize:'1.3rem', color:s.color, fontFamily:'var(--font-display)' }}>{s.value}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {marks.map(m => {
                      const pct = m.total_score ? Math.min(100, Math.round((parseFloat(m.total_score)/100)*100)) : 0;
                      const gcolor = gradeColor[m.grade] || 'var(--text-muted)';
                      return (
                        <div key={m.id} style={{ padding:'0.875rem', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'var(--white)' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.625rem' }}>
                            <div>
                              <span className="badge badge-accent" style={{ marginBottom:4 }}>{m.unit_code}</span>
                              <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{m.unit_name}</div>
                              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:1 }}>{m.semester_label}</div>
                            </div>
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <div style={{ fontWeight:800, fontSize:'1.25rem', fontFamily:'var(--font-display)', color:gcolor, lineHeight:1 }}>
                                {m.grade || '—'}
                              </div>
                              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{m.total_score ?? '—'}/100</div>
                            </div>
                          </div>
                          {/* Score bar */}
                          <div style={{ height:5, background:'var(--surface)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:gcolor, borderRadius:3, transition:'width 0.5s ease' }} />
                          </div>
                          <div style={{ display:'flex', gap:'1rem', marginTop:'0.5rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                            <span>CAT: <strong>{m.cat_score ?? '—'}</strong>/30</span>
                            <span>Exam: <strong>{m.exam_score ?? '—'}</strong>/70</span>
                            <span style={{ marginLeft:'auto', color: gradePassFail(m.grade)==='pass'?'var(--success)':'var(--danger)', fontWeight:600 }}>
                              {gradePassFail(m.grade)==='pass' ? '✓ Pass' : '✗ Fail'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Account tab ── */}
          {tab === 'account' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

              {/* Account status */}
              <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
                <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
                  <div className="section-title" style={{ fontSize:'0.8125rem' }}>
                    <i className="bi bi-shield-lock" /> Account Status
                  </div>
                </div>
                <div style={{ padding:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>
                      {student.is_active ? 'Account is Active' : 'Account is Locked'}
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>
                      {student.is_active
                        ? 'Student can log in and access the portal.'
                        : 'Student cannot log in. Unlock to restore access.'}
                    </div>
                  </div>
                  <button
                    className={`btn btn-sm ${student.is_active ? 'btn-danger' : 'btn-success'}`}
                    onClick={handleToggleActive}
                    disabled={locking}
                    style={{ flexShrink:0 }}
                  >
                    {locking
                      ? <><span className="spinner" style={{ width:13,height:13 }} /> Working...</>
                      : student.is_active
                        ? <><i className="bi bi-lock" /> Lock Account</>
                        : <><i className="bi bi-unlock" /> Unlock Account</>
                    }
                  </button>
                </div>
              </div>

              {/* Reset password */}
              <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
                <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
                  <div className="section-title" style={{ fontSize:'0.8125rem' }}>
                    <i className="bi bi-key" /> Reset Password
                  </div>
                </div>
                <div style={{ padding:'1rem' }}>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginBottom:'0.875rem' }}>
                    Set a new password for this student. The student will use this to log in.
                    For students, the default password is their KCSE Index Number.
                  </p>
                  <div className="form-group" style={{ marginBottom:'0.875rem' }}>
                    <label className="form-label">New Password</label>
                    <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                      <input
                        className="form-input"
                        type={showPwd ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password..."
                        style={{ paddingRight:'2.5rem' }}
                      />
                      <button type="button" onClick={() => setShowPwd(v=>!v)}
                        style={{ position:'absolute', right:'0.625rem', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.9rem', display:'flex', alignItems:'center' }}>
                        <i className={`bi ${showPwd?'bi-eye-slash':'bi-eye'}`} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleResetPassword}
                    disabled={resetting || !newPassword.trim()}
                  >
                    {resetting
                      ? <><span className="spinner" style={{ width:13,height:13 }} /> Resetting...</>
                      : <><i className="bi bi-key" /> Reset Password</>
                    }
                  </button>
                </div>
              </div>

              {/* Account info */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'0.875rem 1rem' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-muted)', marginBottom:'0.625rem' }}>Account Information</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                  {[
                    { label:'Username', value: student.registration_number },
                    { label:'Role', value: 'Student' },
                    { label:'Account ID', value: `#${student.user || student.id}` },
                  ].map(f => (
                    <div key={f.label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>{f.label}</span>
                      <span style={{ fontWeight:500, fontFamily: f.label==='Username'||f.label==='Account ID' ? 'var(--font-mono)' : 'inherit', fontSize: f.label==='Account ID'?'0.78rem':'0.8125rem' }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Drawer footer */}
        {tab === 'info' && (
          <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', justifyContent:'flex-end', gap:'0.625rem', background:'var(--white)' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width:14,height:14 }} /> Saving...</>
                : <><i className="bi bi-floppy" /> Save Changes</>
              }
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Students Page ─────────────────────────────────────────────────────
export default function ICTStudents({ user, onLogout }) {
  const [students, setStudents]     = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    registration_number:'', kcse_index:'', first_name:'', last_name:'',
    middle_name:'', programme:'', current_year_of_study:1, current_semester_number:1,
    phone:'', id_number:'',
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState({ text:'', type:'' });
  const [search, setSearch]         = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterProg, setFilterProg] = useState('');

  const init = useCallback(async () => {
    try {
      const [{ data: studs }, { data: progs }] = await Promise.all([
        ictAPI.getAllStudents(), coreAPI.getProgrammes()
      ]);
      setStudents(studs.results || studs);
      setProgrammes(progs.results || progs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg({ text:'', type:'' });
    try {
      await ictAPI.createStudent(form);
      setMsg({ text:'Student created successfully!', type:'success' });
      setShowForm(false);
      setForm({ registration_number:'', kcse_index:'', first_name:'', last_name:'', middle_name:'', programme:'', current_year_of_study:1, current_semester_number:1, phone:'', id_number:'' });
      init();
    } catch(e) {
      setMsg({ text: e.response?.data?.error || 'Failed to create student.', type:'error' });
    } finally { setSubmitting(false); }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.registration_number.toLowerCase().includes(q)
      || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
    const matchYear = !filterYear || String(s.current_year_of_study) === filterYear;
    const matchProg = !filterProg || String(s.programme) === filterProg;
    return matchSearch && matchYear && matchProg;
  });

  const alertIcon = { error:'bi-exclamation-circle', success:'bi-check-circle', warning:'bi-exclamation-triangle' };

  return (
    <Layout role="ict" user={user} onLogout={onLogout}>
      <div className="animate-fade">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">{students.length} enrolled students</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm
              ? <><i className="bi bi-x" /> Cancel</>
              : <><i className="bi bi-person-plus" /> Add Student</>
            }
          </button>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom:'1.25rem' }}>
            <i className={`bi ${alertIcon[msg.type]||'bi-info-circle'}`} />
            {msg.text}
          </div>
        )}

        {/* ── Create form ── */}
        {showForm && (
          <div className="card" style={{ padding:0, marginBottom:'1.5rem', overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.375rem', borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
              <div className="section-title">
                <i className="bi bi-person-plus-fill" /> New Student
              </div>
            </div>
            <form onSubmit={handleCreate} style={{ padding:'1.25rem 1.375rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                <div className="form-group">
                  <label className="form-label">Registration Number *</label>
                  <input className="form-input" required placeholder="SC211/0530/2022"
                    value={form.registration_number} onChange={e => setForm({...form, registration_number:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">KCSE Index (Password) *</label>
                  <input className="form-input" required placeholder="0011/8278/2019"
                    value={form.kcse_index} onChange={e => setForm({...form, kcse_index:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Programme *</label>
                  <select className="form-select" required value={form.programme}
                    onChange={e => setForm({...form, programme:e.target.value})}>
                    <option value="">Select programme...</option>
                    {programmes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" required value={form.first_name}
                    onChange={e => setForm({...form, first_name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" required value={form.last_name}
                    onChange={e => setForm({...form, last_name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Middle Name</label>
                  <input className="form-input" value={form.middle_name}
                    onChange={e => setForm({...form, middle_name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Year</label>
                  <input className="form-input" type="number" min="1" max="6"
                    value={form.current_year_of_study}
                    onChange={e => setForm({...form, current_year_of_study:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Semester</label>
                  <input className="form-input" type="number" min="1" max="3"
                    value={form.current_semester_number}
                    onChange={e => setForm({...form, current_semester_number:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone}
                    onChange={e => setForm({...form, phone:e.target.value})} />
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.625rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting
                    ? <><span className="spinner" style={{ width:14,height:14 }} /> Creating...</>
                    : <><i className="bi bi-person-check" /> Create Student</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Table card ── */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {/* Filters */}
          <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ position:'relative', flex:'1 1 240px', minWidth:200 }}>
              <i className="bi bi-search" style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:'0.85rem', pointerEvents:'none' }} />
              <input className="form-input" placeholder="Search name or reg number..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:'2.25rem' }} />
            </div>
            <select className="form-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}
              style={{ width:'auto', minWidth:130 }}>
              <option value="">All Years</option>
              {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <select className="form-select" value={filterProg} onChange={e => setFilterProg(e.target.value)}
              style={{ width:'auto', minWidth:160 }}>
              <option value="">All Programmes</option>
              {programmes.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
            </select>
            <span className="badge badge-default">{filtered.length} results</span>
          </div>

          {loading ? (
            <div style={{ padding:'1.5rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:44, marginBottom:8 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-person-x" />
              <div className="empty-state-title">No students found</div>
              <div className="empty-state-desc">Try adjusting your search or filters.</div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Reg. Number</th>
                    <th>Full Name</th>
                    <th>Programme</th>
                    <th>Year / Sem</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} style={{ cursor:'pointer' }} onClick={() => setSelectedStudent(s)}>
                      <td>
                        <span className="badge badge-accent" style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem' }}>
                          {s.registration_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                          <div style={{ width:28, height:28, borderRadius:'var(--radius-sm)', background:'var(--accent-soft)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.7rem', flexShrink:0 }}>
                            {`${s.first_name?.[0]||''}${s.last_name?.[0]||''}`.toUpperCase()}
                          </div>
                          <span style={{ fontWeight:500 }}>{s.full_name || `${s.first_name} ${s.last_name}`}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{s.programme_code || '—'}</td>
                      <td><span className="badge badge-default">Y{s.current_year_of_study} S{s.current_semester_number}</span></td>
                      <td><span className={`badge badge-${s.is_active ? 'success':'danger'}`}>{s.is_active ? 'Active':'Locked'}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedStudent(s); }}>
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

      {/* Detail Drawer */}
      {selectedStudent && (
        <StudentDrawer
          student={selectedStudent}
          programmes={programmes}
          onClose={() => setSelectedStudent(null)}
          onUpdated={() => { init(); setSelectedStudent(null); }}
        />
      )}
    </Layout>
  );
}