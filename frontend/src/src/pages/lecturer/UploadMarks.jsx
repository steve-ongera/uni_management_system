import { useState, useEffect } from 'react';
import { lecturerAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function LecturerMarks({ user }) {
  const [allocations, setAllocations] = useState([]);
  const [selectedAlloc, setSelectedAlloc] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    lecturerAPI.getDashboard().then(({ data }) => {
      setAllocations(data.allocations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadStudents = async (alloc) => {
    setSelectedAlloc(alloc);
    setMsg({ text: '', type: '' });
    try {
      const [{ data: studs }, { data: existingMarks }] = await Promise.all([
        lecturerAPI.getUnitStudents(alloc.unit, alloc.semester),
        lecturerAPI.getMarks({ unit: alloc.unit, semester: alloc.semester }),
      ]);
      setStudents(studs);
      const marksMap = {};
      (existingMarks.results || existingMarks).forEach(m => {
        marksMap[m.student] = { id: m.id, cat: m.cat_score || '', exam: m.exam_score || '' };
      });
      setMarks(marksMap);
    } catch {
      setMsg({ text: 'Failed to load students.', type: 'error' });
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const saveMarks = async () => {
    if (!selectedAlloc) return;
    setSaving(true);
    setMsg({ text: '', type: '' });
    let errors = 0;
    for (const student of students) {
      const m = marks[student.id] || {};
      if (!m.cat && !m.exam) continue;
      const payload = {
        student: student.id,
        unit: selectedAlloc.unit,
        semester: selectedAlloc.semester,
        cat_score: m.cat || null,
        exam_score: m.exam || null,
      };
      try {
        if (m.id) {
          await lecturerAPI.updateMark(m.id, payload);
        } else {
          const { data: created } = await lecturerAPI.uploadMark(payload);
          setMarks(prev => ({ ...prev, [student.id]: { ...prev[student.id], id: created.id } }));
        }
      } catch { errors++; }
    }
    setSaving(false);
    setMsg({ text: errors > 0 ? `Saved with ${errors} errors.` : 'Marks saved successfully!', type: errors > 0 ? 'error' : 'success' });
  };

  if (loading) return <Layout role="lecturer" user={user}><div className="skeleton" style={{ height: 300, margin: '2rem', borderRadius: 12 }} /></Layout>;

  return (
    <Layout role="lecturer" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <div>
            <h1 className="page-title">Upload Marks</h1>
            <p className="page-subtitle">Select a unit to enter student marks</p>
          </div>
          {selectedAlloc && (
            <button className="btn btn-primary" onClick={saveMarks} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save All Marks'}
            </button>
          )}
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Unit selector */}
          <div className="card" style={{ padding: '1rem', alignSelf: 'start' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              My Units
            </h3>
            {allocations.map(a => (
              <button key={a.id} onClick={() => loadStudents(a)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', marginBottom: 4,
                  background: selectedAlloc?.id === a.id ? 'var(--accent)' : 'transparent',
                  color: selectedAlloc?.id === a.id ? 'white' : 'var(--text-primary)',
                  transition: 'all var(--transition)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                }}>
                <div style={{ fontWeight: 600 }}>{a.unit_code}</div>
                <div style={{ opacity: 0.75, fontSize: '0.8rem', marginTop: 1 }}>{a.unit_name}</div>
              </button>
            ))}
          </div>

          {/* Marks table */}
          <div className="card">
            {!selectedAlloc ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">Select a unit</div>
                <div className="empty-state-desc">Choose a unit from the left to enter marks.</div>
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">No students registered</div>
                <div className="empty-state-desc">No students have registered for {selectedAlloc.unit_code}.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{selectedAlloc.unit_code} — {selectedAlloc.unit_name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{students.length} students</p>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Reg No.</th>
                        <th>Name</th>
                        <th>CAT (max 30)</th>
                        <th>Exam (max 70)</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => {
                        const m = marks[s.id] || {};
                        const total = (Number(m.cat) || 0) + (Number(m.exam) || 0);
                        return (
                          <tr key={s.id}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{idx + 1}</td>
                            <td><span className="badge badge-default" style={{ fontSize: '0.78rem' }}>{s.registration_number}</span></td>
                            <td style={{ fontWeight: 500 }}>{s.full_name || `${s.first_name} ${s.last_name}`}</td>
                            <td>
                              <input type="number" min="0" max="30" step="0.5"
                                className="form-input" style={{ width: 80, padding: '0.375rem 0.5rem', fontSize: '0.875rem' }}
                                value={m.cat || ''}
                                onChange={e => handleMarkChange(s.id, 'cat', e.target.value)} />
                            </td>
                            <td>
                              <input type="number" min="0" max="70" step="0.5"
                                className="form-input" style={{ width: 80, padding: '0.375rem 0.5rem', fontSize: '0.875rem' }}
                                value={m.exam || ''}
                                onChange={e => handleMarkChange(s.id, 'exam', e.target.value)} />
                            </td>
                            <td style={{ fontWeight: 700, color: total >= 40 ? 'var(--success)' : 'var(--danger)' }}>
                              {m.cat || m.exam ? total.toFixed(1) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}