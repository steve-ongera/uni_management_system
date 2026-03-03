import { useState, useEffect } from 'react';
import { lecturerAPI } from '../../services/api';
import Layout from '../../components/common/Layout';

export default function LecturerProfile({ user }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    lecturerAPI.getProfile().then(({ data }) => setProfile(data));
  }, []);

  if (!profile) return <Layout role="lecturer" user={user}><div className="skeleton" style={{ height: 400, margin: '2rem', borderRadius: 12 }} /></Layout>;

  return (
    <Layout role="lecturer" user={user}>
      <div className="animate-fade">
        <div className="page-header"><h1 className="page-title">My Profile</h1></div>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#7c3aed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 800, color: 'white', margin: '0 auto 1.25rem', fontFamily: 'var(--font-display)'
            }}>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>{profile.full_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>{profile.staff_id}</div>
            <div style={{ marginTop: '0.75rem' }}><span className="badge badge-accent">Lecturer</span></div>
          </div>
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1rem' }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { label: 'First Name', value: profile.first_name },
                { label: 'Last Name', value: profile.last_name },
                { label: 'Staff ID', value: profile.staff_id },
                { label: 'Phone', value: profile.phone || '—' },
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