import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function StudentProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await studentAPI.getProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) return <Layout role="student" user={user}><div className="skeleton" style={{ height: 400, margin: '2rem', borderRadius: 12 }} /></Layout>;

  return (
    <Layout role="student" user={user}>
      <div className="animate-fade">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 1.25rem', fontFamily: 'var(--font-display)'
            }}>
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
              {profile?.full_name}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              {profile?.registration_number}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <span className="badge badge-accent">{profile?.programme_code}</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { label: 'First Name', value: profile?.first_name },
                { label: 'Last Name', value: profile?.last_name },
                { label: 'Registration Number', value: profile?.registration_number },
                { label: 'Programme', value: profile?.programme_name },
                { label: 'Current Year', value: `Year ${profile?.current_year_of_study}` },
                { label: 'Current Semester', value: `Semester ${profile?.current_semester_number}` },
                { label: 'Phone', value: profile?.phone || '—' },
                { label: 'ID Number', value: profile?.id_number || '—' },
                { label: 'Date of Birth', value: profile?.date_of_birth || '—' },
                { label: 'Admission Date', value: profile?.admission_date || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}