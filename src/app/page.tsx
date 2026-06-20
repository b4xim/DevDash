export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';
import ProgressBar from '@/components/ProgressBar';
import DashboardCharts from '@/components/DashboardCharts';
import type { Lab, JobApplication, ApplicationStatus } from '@/lib/supabase';

const CATEGORIES = ['linux', 'docker', 'kubernetes', 'aws', 'terraform', 'ci-cd', 'ansible'];

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  linux:      { label: 'Linux',      icon: '🐧' },
  docker:     { label: 'Docker',     icon: '🐳' },
  kubernetes: { label: 'Kubernetes', icon: '⚙️' },
  aws:        { label: 'AWS',        icon: '☁️' },
  terraform:  { label: 'Terraform',  icon: '🏗️' },
  'ci-cd':    { label: 'CI / CD',    icon: '🔄' },
  ansible:    { label: 'Ansible',    icon: '📋' },
};

const JOB_STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  applied:   { label: 'Applied',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  interview: { label: 'Interview', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  offer:     { label: 'Offer',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  rejected:  { label: 'Rejected',  color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
};

export default async function DashboardPage() {
  // Fetch data server-side
  const [labsResult, jobsResult] = await Promise.all([
    supabase.from('labs').select('*'),
    supabase.from('job_applications').select('*'),
  ]);

  const labs: Lab[] = labsResult.data ?? [];
  const jobs: JobApplication[] = jobsResult.data ?? [];

  // Compute per-category stats
  const categoryStats = CATEGORIES.map((cat) => {
    const catLabs = labs.filter((l) => l.category === cat);
    const done = catLabs.filter((l) => l.status === 'done').length;
    const total = catLabs.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { cat, done, total, pct };
  });

  // Overall lab progress
  const totalDone = labs.filter((l) => l.status === 'done').length;
  const totalLabs = labs.length;
  const overallPct = totalLabs > 0 ? Math.round((totalDone / totalLabs) * 100) : 0;

  // Job stats
  const jobStatusCounts = (Object.keys(JOB_STATUS_META) as ApplicationStatus[]).reduce<Record<string, number>>(
    (acc, s) => {
      acc[s] = jobs.filter((j) => j.status === s).length;
      return acc;
    },
    {}
  );

  // Chart data
  const barData = categoryStats.map(({ cat, pct, done, total }) => ({
    category: CATEGORY_META[cat].label,
    percentage: pct,
    done,
    total,
  }));

  const pieData = (Object.entries(jobStatusCounts) as [ApplicationStatus, number][])
    .filter(([, v]) => v > 0)
    .map(([s, v]) => ({
      name: JOB_STATUS_META[s].label,
      value: v,
    }));

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your DevOps journey at a glance</p>
      </div>

      {/* Summary stat bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '24px',
      }}>
        {/* Overall lab progress */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{overallPct}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Labs Complete</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{totalDone}/{totalLabs} done</div>
        </div>

        {Object.entries(JOB_STATUS_META).map(([s, meta]) => (
          <div key={s} className="card" style={{ textAlign: 'center', border: `1px solid ${meta.color}22` }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: meta.color, lineHeight: 1 }}>
              {jobStatusCounts[s] ?? 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>{meta.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>applications</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ marginBottom: '24px' }}>
        <DashboardCharts barData={barData} pieData={pieData} />
      </div>

      {/* Category breakdown cards */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-secondary)' }}>
          Category Breakdown
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {categoryStats.map(({ cat, done, total, pct }) => {
            const meta = CATEGORY_META[cat];
            return (
              <a key={cat} href={`/tools/${cat}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
                      <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{meta.label}</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      color: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--text-muted)',
                    }}>
                      {done}/{total}
                    </span>
                  </div>
                  <ProgressBar percentage={pct} height={5} showLabel={false} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {total === 0
                      ? 'No labs added yet'
                      : pct === 100
                      ? '✓ All complete!'
                      : `${total - done} remaining`}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
