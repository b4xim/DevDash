import JobTable from '@/components/JobTable';

export const metadata = {
  title: 'Job Tracker — DevDash',
};

export default function JobsPage() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            width: '48px', height: '48px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>💼</span>
          <div>
            <h1 className="page-title">Job Tracker</h1>
            <p className="page-subtitle">Track every application from applied to offer</p>
          </div>
        </div>
      </div>

      <JobTable />
    </div>
  );
}
