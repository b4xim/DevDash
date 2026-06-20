import NewsFeed from '@/components/NewsFeed';

export const metadata = {
  title: 'Latest in DevOps — DevDash',
};

export default function NewsPage() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            width: '48px', height: '48px',
            background: 'rgba(100,116,139,0.12)',
            border: '1px solid rgba(100,116,139,0.2)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>📰</span>
          <div>
            <h1 className="page-title">Latest in DevOps</h1>
            <p className="page-subtitle">Reddit, Hacker News, Kubernetes, AWS &amp; HashiCorp — refreshed hourly</p>
          </div>
        </div>
      </div>

      <NewsFeed />
    </div>
  );
}
