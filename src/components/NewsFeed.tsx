'use client';

import { useState, useEffect } from 'react';
import type { NewsItem } from '@/app/api/news/route';

const SOURCE_STYLES: Record<string, { bg: string; color: string }> = {
  'Reddit r/devops': { bg: 'rgba(255,69,0,0.12)', color: '#ff6314' },
  'Hacker News':     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'Kubernetes':      { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  'AWS DevOps':      { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'HashiCorp':       { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
};

function getSourceStyle(source: string) {
  return SOURCE_STYLES[source] ?? { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' };
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setItems(data);
      } catch {
        setError('Failed to load news. Check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '16px' }}>
            <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '12px', width: '30%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">⚠️</span>
        <p style={{ fontWeight: 500 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => {
        const style = getSourceStyle(item.source);
        return (
          <a
            key={`${item.link}-${i}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div className="card" style={{
              padding: '14px 18px',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(220,38,38,0.3)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
            }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '0.9rem', fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: '1.4',
                  marginBottom: '8px',
                }}>
                  {item.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    ...style,
                    padding: '2px 8px', borderRadius: '99px',
                    fontSize: '0.7rem', fontWeight: 600,
                  }}>
                    {item.source}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {relativeTime(item.date)}
                  </span>
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>↗</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
