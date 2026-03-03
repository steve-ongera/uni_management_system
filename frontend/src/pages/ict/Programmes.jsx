import { useState, useEffect, useCallback } from 'react';
import { coreAPI } from '../../services/api';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

const EMPTY_FORM = { name:'', code:'', department:'', duration_years:4, semesters_per_year:'2', description:'' };

function ProgrammeModal({ mode, prog, departments, onClose, onSaved }) {
  const [form, setForm]     = useState(mode==='edit' && prog ? { ...prog, department: prog.department } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (mode === 'edit') await api.patch(`/auth/programmes/${prog.id}/`, form);
      else await coreAPI.createProgramme(form);
      onSaved();
    } catch(e) {
      setErr(e.response?.data?.detail || Object.values(e.response?.data||{})[0]?.[0] || 'Failed to save.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth:520 }}>
        <div className="modal-header">
          <div className="modal-title">
            <i className={`bi ${mode==='edit'?'bi-pencil':'bi-collection'}`} style={{ marginRight:8,color:'var(--accent)' }} />
            {mode==='edit' ? 'Edit Programme' : 'New Programme'}
          </div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>

        {err && <div className="alert alert-error" style={{ marginBottom:'1rem' }}><i className="bi bi-exclamation-circle" />{err}</div>}

        <form onSubmit={save}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Programme Name *</label>
              <input className="form-input" required placeholder="e.g. Bachelor of Science in IT"
                value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input className="form-input" required placeholder="e.g. BSCIT"
                value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" required value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
                <option value="">Select department...</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Years)</label>
              <input className="form-input" type="number" min="1" max="6"
                value={form.duration_years} onChange={e=>setForm({...form,duration_years:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Semesters per Year</label>
              <select className="form-select" value={form.semesters_per_year} onChange={e=>setForm({...form,semesters_per_year:e.target.value})}>
                <option value="2">2 per year (e.g. BSc IT)</option>
                <option value="3">3 per year (e.g. Nursing)</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Optional description..." style={{ minHeight:72 }}
                value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width:14,height:14 }} /> Saving...</> : <><i className="bi bi-floppy" /> {mode==='edit'?'Save Changes':'Create Programme'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ prog, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/auth/programmes/${prog.id}/`);
      onDeleted();
    } catch { setErr('Failed to delete. It may have students or units linked.'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth:420 }}>
        <div className="modal-header">
          <div className="modal-title" style={{ color:'var(--danger)' }}><i className="bi bi-trash3" style={{ marginRight:8 }} />Delete Programme</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>
        {err && <div className="alert alert-error" style={{ marginBottom:'1rem' }}><i className="bi bi-exclamation-circle" />{err}</div>}
        <p style={{ fontSize:'0.9rem',color:'var(--text-secondary)',marginBottom:'0.5rem' }}>
          Are you sure you want to delete <strong>{prog.code} — {prog.name}</strong>?
        </p>
        <p style={{ fontSize:'0.8125rem',color:'var(--text-muted)' }}>This action cannot be undone. Programmes with linked students or units cannot be deleted.</p>
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

export default function ICTProgrammes({ user, onLogout }) {
  const [programmes, setProgrammes]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null); // { type:'create'|'edit'|'delete', prog? }
  const [msg, setMsg]                 = useState({ text:'', type:'' });
  const [search, setSearch]           = useState('');

  const init = useCallback(async () => {
    try {
      const [{ data:progs }, { data:depts }] = await Promise.all([coreAPI.getProgrammes(), coreAPI.getDepartments()]);
      setProgrammes(progs.results || progs);
      setDepartments(depts.results || depts);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { init(); }, [init]);

  const onSaved = (msg='Programme saved successfully!') => {
    setMsg({ text:msg, type:'success' });
    setModal(null);
    init();
  };
  const onDeleted = () => {
    setMsg({ text:'Programme deleted.', type:'warning' });
    setModal(null);
    init();
  };

  const filtered = programmes.filter(p => {
    const q = search.toLowerCase();
    return !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.department_name?.toLowerCase().includes(q);
  });

  const alertIcon = { success:'bi-check-circle', error:'bi-exclamation-circle', warning:'bi-exclamation-triangle' };

  return (
    <Layout role="ict" user={user} onLogout={onLogout}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Programmes</h1>
            <p className="page-subtitle">{programmes.length} academic programmes</p>
          </div>
          <button className="btn btn-primary" onClick={()=>setModal({ type:'create' })}>
            <i className="bi bi-plus-lg" /> Add Programme
          </button>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom:'1.25rem' }}>
            <i className={`bi ${alertIcon[msg.type]||'bi-info-circle'}`} />{msg.text}
          </div>
        )}

        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ padding:'0.875rem 1.25rem',borderBottom:'1px solid var(--border)',display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap' }}>
            <div style={{ position:'relative',flex:'1 1 240px',minWidth:200 }}>
              <i className="bi bi-search" style={{ position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'0.85rem',pointerEvents:'none' }} />
              <input className="form-input" placeholder="Search programme or department..."
                value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.25rem' }} />
            </div>
            <span className="badge badge-default">{filtered.length} results</span>
          </div>

          {loading ? (
            <div style={{ padding:'1.5rem' }}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:44,marginBottom:8 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><i className="bi bi-collection" /><div className="empty-state-title">No programmes found</div></div>
          ) : (
            <div className="table-wrapper" style={{ border:'none',borderRadius:0 }}>
              <table>
                <thead>
                  <tr><th>Code</th><th>Programme Name</th><th>Department</th><th>Duration</th><th>Semesters/Yr</th><th>Total Sem</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td><span className="badge badge-accent">{p.code}</span></td>
                      <td style={{ fontWeight:500 }}>{p.name}</td>
                      <td style={{ fontSize:'0.85rem',color:'var(--text-secondary)' }}>{p.department_name}</td>
                      <td style={{ color:'var(--text-secondary)',fontSize:'0.875rem' }}>{p.duration_years} yrs</td>
                      <td><span className="badge badge-default">{p.semesters_per_year}/yr</span></td>
                      <td><span className="badge badge-info">{p.total_semesters} sem</span></td>
                      <td>
                        <div style={{ display:'flex',gap:'0.375rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({ type:'edit', prog:p })} title="Edit">
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({ type:'delete', prog:p })} title="Delete"
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
        <ProgrammeModal mode="create" departments={departments} onClose={()=>setModal(null)} onSaved={()=>onSaved('Programme created successfully!')} />
      )}
      {modal?.type === 'edit' && (
        <ProgrammeModal mode="edit" prog={modal.prog} departments={departments} onClose={()=>setModal(null)} onSaved={()=>onSaved('Programme updated successfully!')} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm prog={modal.prog} onClose={()=>setModal(null)} onDeleted={onDeleted} />
      )}
    </Layout>
  );
}