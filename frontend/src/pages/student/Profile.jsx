import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

const Field = ({ label, value, icon }) => (
  <div>
    <div style={{
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      marginBottom: '0.3rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
    }}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: '0.75rem' }} />}
      {label}
    </div>
    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: value === '—' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
      {value || '—'}
    </div>
  </div>
);

export default function StudentProfile({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await studentAPI.getProfile();
      setProfile(data);
    } catch {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '?';

  if (loading) return (
    <Layout role="student" user={user} onLogout={onLogout}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        <div className="skeleton" style={{ height: 340 }} />
        <div className="skeleton" style={{ height: 340 }} />
      </div>
    </Layout>
  );

  return (
    <Layout role="student" user={user} onLogout={onLogout}>
      <div className="animate-fade">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Your personal and academic details</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-exclamation-circle" />
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Avatar card ── */}
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            {/* Avatar circle */}
            <div style={{
              width: 84,
              height: 84,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'white',
              margin: '0 auto 1.25rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              border: '3px solid var(--accent-soft)',
            }}>
              {initials}
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.2 }}>
              {profile?.full_name}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.3rem', fontFamily: 'var(--font-mono)' }}>
              {profile?.registration_number}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-accent">
                <i className="bi bi-collection" />
                {profile?.programme_code}
              </span>
              <span className="badge badge-default">
                <i className="bi bi-mortarboard" />
                Year {profile?.current_year_of_study} · Sem {profile?.current_semester_number}
              </span>
            </div>

            <div className="divider" />

            {/* Quick contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-telephone" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                {profile?.phone || <span style={{ color: 'var(--text-muted)' }}>No phone on record</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-card-text" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                {profile?.id_number || <span style={{ color: 'var(--text-muted)' }}>No ID on record</span>}
              </div>
            </div>
          </div>

          {/* ── Details card ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Personal Info section */}
            <div style={{ padding: '1rem 1.375rem', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title">
                <i className="bi bi-person-lines-fill" />
                Personal Information
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.375rem',
              padding: '1.375rem',
            }}>
              <Field label="First Name"   icon="bi-person"         value={profile?.first_name} />
              <Field label="Last Name"    icon="bi-person"         value={profile?.last_name} />
              <Field label="ID Number"    icon="bi-card-text"      value={profile?.id_number} />
              <Field label="Phone"        icon="bi-telephone"      value={profile?.phone} />
              <Field label="Date of Birth" icon="bi-calendar-date" value={profile?.date_of_birth} />
              <Field label="Admission Date" icon="bi-calendar-check" value={profile?.admission_date} />
            </div>

            {/* Academic section */}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: '1px solid var(--border)' }}>
                <div className="section-title">
                  <i className="bi bi-mortarboard-fill" />
                  Academic Details
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.375rem',
                padding: '1.375rem',
              }}>
                <Field label="Registration No."  icon="bi-hash"          value={profile?.registration_number} />
                <Field label="Programme"         icon="bi-collection"    value={profile?.programme_name} />
                <Field label="Programme Code"    icon="bi-tag"           value={profile?.programme_code} />
                <Field label="Semesters / Year"  icon="bi-calendar3"     value={profile?.semesters_per_year ? `${profile.semesters_per_year} per year` : undefined} />
                <Field label="Current Year"      icon="bi-layers"        value={profile?.current_year_of_study ? `Year ${profile.current_year_of_study}` : undefined} />
                <Field label="Current Semester"  icon="bi-calendar2-week" value={profile?.current_semester_number ? `Semester ${profile.current_semester_number}` : undefined} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}