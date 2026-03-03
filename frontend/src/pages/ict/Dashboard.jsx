import { useState, useEffect, useCallback } from 'react';
import { ictAPI } from '../../services/api';
import Layout from '../../components/common/Layout';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';


// ── Mock analytics data (replace with real API endpoints as they become available) ──
const enrollmentTrend = [
  { month: 'Aug', students: 210 },
  { month: 'Sep', students: 245 },
  { month: 'Oct', students: 268 },
  { month: 'Nov', students: 271 },
  { month: 'Dec', students: 260 },
  { month: 'Jan', students: 289 },
  { month: 'Feb', students: 310 },
  { month: 'Mar', students: 324 },
];

const feeCollectionData = [
  { month: 'Sep', collected: 1820000, expected: 2400000 },
  { month: 'Oct', collected: 2100000, expected: 2400000 },
  { month: 'Nov', collected: 1950000, expected: 2400000 },
  { month: 'Dec', collected: 2300000, expected: 2400000 },
  { month: 'Jan', collected: 2150000, expected: 2600000 },
  { month: 'Feb', collected: 2450000, expected: 2600000 },
];

const programmeDistribution = [
  { name: 'BSc IT', value: 38, color: '#1d4ed8' },
  { name: 'Nursing', value: 27, color: '#059669' },
  { name: 'Business', value: 18, color: '#d97706' },
  { name: 'Education', value: 12, color: '#7c3aed' },
  { name: 'Others', value: 5, color: '#6b7280' },
];

const gradeDistribution = [
  { grade: 'A', count: 42 },
  { grade: 'A-', count: 58 },
  { grade: 'B+', count: 91 },
  { grade: 'B', count: 113 },
  { grade: 'B-', count: 87 },
  { grade: 'C+', count: 64 },
  { grade: 'C', count: 45 },
  { grade: 'C-', count: 28 },
  { grade: 'D+', count: 19 },
  { grade: 'F', count: 12 },
];

const unitRegTrend = [
  { week: 'Wk 1', registrations: 84 },
  { week: 'Wk 2', registrations: 210 },
  { week: 'Wk 3', registrations: 312 },
  { week: 'Wk 4', registrations: 356 },
];

// ── Custom tooltip ──
const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem',
      boxShadow: 'var(--shadow-md)', fontSize: '0.8125rem',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Chart card wrapper ──
const ChartCard = ({ title, icon, children, style }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden', ...style }}>
    <div style={{ padding: '1rem 1.375rem', borderBottom: '1px solid var(--border)' }}>
      <div className="section-title">
        <i className={`bi ${icon}`} />
        {title}
      </div>
    </div>
    <div style={{ padding: '1.25rem 1rem 1rem' }}>
      {children}
    </div>
  </div>
);

const LOG_ICONS = {
  create: { icon: 'bi-plus-circle-fill', color: '#059669', bg: '#f0fdf4' },
  approve: { icon: 'bi-check-circle-fill', color: '#0284c7', bg: '#f0f9ff' },
  update: { icon: 'bi-pencil-fill', color: '#d97706', bg: '#fffbeb' },
  delete: { icon: 'bi-trash-fill', color: '#dc2626', bg: '#fef2f2' },
  reject: { icon: 'bi-x-circle-fill', color: '#dc2626', bg: '#fef2f2' },
};

const fmtKES = v => `KES ${(v / 1000000).toFixed(1)}M`;

export default function ICTDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: d } = await ictAPI.getDashboard();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return (
    <Layout role="ict" user={user} onLogout={onLogout}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 92 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 240 }} />)}
        </div>
      </div>
    </Layout>
  );

  const stats = [
    {
      icon: 'bi-mortarboard-fill', label: 'Total Students',
      value: data?.total_students ?? 0, bg: '#eff6ff', color: '#1d4ed8',
      sub: 'enrolled',
    },
    {
      icon: 'bi-person-workspace', label: 'Total Lecturers',
      value: data?.total_lecturers ?? 0, bg: '#f5f3ff', color: '#7c3aed',
      sub: 'active staff',
    },
    {
      icon: 'bi-inbox-fill', label: 'Pending Reports',
      value: data?.pending_reports ?? 0, bg: '#fffbeb', color: '#d97706',
      sub: 'awaiting approval',
    },
    {
      icon: 'bi-cash-stack', label: 'Pending Payments',
      value: data?.pending_payments ?? 0, bg: '#fef2f2', color: '#dc2626',
      sub: 'to confirm',
    },
    {
      icon: 'bi-calendar3', label: 'Active Year',
      value: data?.active_year?.name || '—', bg: '#f0fdf4', color: '#059669',
      sub: 'academic year', isText: true,
    },
    {
      icon: 'bi-collection-fill', label: 'Active Semester',
      value: data?.active_year ? 'Running' : 'Not set', bg: '#ecfeff', color: '#0284c7',
      sub: 'current period', isText: true,
    },
  ];

  return (
    <Layout role="ict" user={user} onLogout={onLogout}>
      <div className="animate-fade">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">ICT Admin Dashboard</h1>
            <p className="page-subtitle">
              Academic Year: <strong>{data?.active_year?.name || 'Not set'}</strong>
              &nbsp;·&nbsp; System overview and analytics
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>

        {/* ── 6 Stat Cards ── */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="stat-value" style={{
                  color: s.color,
                  fontSize: s.isText ? '1rem' : '1.625rem',
                  paddingTop: s.isText ? 4 : 0,
                  lineHeight: s.isText ? 1.3 : 1,
                }}>
                  {s.value}
                </div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row 1 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

          {/* Enrollment Trend */}
          <ChartCard title="Student Enrollment Trend" icon="bi-graph-up">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={enrollmentTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="students" name="Students" stroke="#1d4ed8" strokeWidth={2} fill="url(#enrollGrad)" dot={{ r: 3, fill: '#1d4ed8' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Fee Collection */}
          <ChartCard title="Fee Collection vs Expected" icon="bi-cash-coin">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feeCollectionData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000000}M`} />
                <Tooltip content={<ChartTooltip formatter={fmtKES} />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="expected" name="Expected" fill="#e0e7ff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        {/* ── Charts Row 2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

          {/* Programme Distribution Pie */}
          <ChartCard title="Programme Distribution" icon="bi-pie-chart-fill">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={programmeDistribution}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {programmeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem 0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              {programmeDistribution.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                  {p.name} ({p.value}%)
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Grade Distribution */}
          <ChartCard title="Grade Distribution" icon="bi-bar-chart-fill">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeDistribution} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Students" radius={[3, 3, 0, 0]}>
                  {gradeDistribution.map((entry, i) => {
                    const colors = ['#059669','#059669','#1d4ed8','#1d4ed8','#1d4ed8','#d97706','#d97706','#d97706','#dc2626','#dc2626'];
                    return <Cell key={i} fill={colors[i] || '#6b7280'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Unit Registration Trend */}
          <ChartCard title="Unit Registrations" icon="bi-journal-check">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={unitRegTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="registrations" name="Registrations" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        {/* ── Recent Activity ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.375rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="section-title">
              <i className="bi bi-activity" />
              Recent System Activity
            </div>
            <a href="/ict/logs" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
              View all <i className="bi bi-arrow-right" />
            </a>
          </div>
          <div style={{ padding: '0.875rem' }}>
            {(data?.recent_logs || []).length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-clipboard-x" />
                <div className="empty-state-title">No activity yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {(data?.recent_logs || []).map(log => {
                  const meta = LOG_ICONS[log.action] || LOG_ICONS.update;
                  return (
                    <div key={log.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                        background: meta.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>
                        <i className={`bi ${meta.icon}`} style={{ color: meta.color, fontSize: '0.8rem' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {log.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          <strong>{log.performed_by_name}</strong> · {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <span className={`badge badge-${
                        log.action === 'create' ? 'success' :
                        log.action === 'approve' ? 'info' :
                        log.action === 'reject' || log.action === 'delete' ? 'danger' : 'default'
                      }`} style={{ flexShrink: 0 }}>
                        {log.action}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}