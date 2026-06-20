'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CATEGORIES = [
  { slug: 'linux',      label: 'Linux',       icon: '🐧' },
  { slug: 'docker',     label: 'Docker',      icon: '🐳' },
  { slug: 'kubernetes', label: 'Kubernetes',  icon: '⚙️' },
  { slug: 'aws',        label: 'AWS',         icon: '☁️' },
  { slug: 'terraform',  label: 'Terraform',   icon: '🏗️' },
  { slug: 'ci-cd',      label: 'CI / CD',     icon: '🔄' },
  { slug: 'ansible',    label: 'Ansible',     icon: '📋' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '32px', height: '32px',
            background: 'var(--accent)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0,
          }}>⚡</span>
          <div>
            <div className="sidebar-logo-title">DevDash</div>
            <div className="sidebar-logo-subtitle">DevOps Tracker</div>
          </div>
        </div>
        {/* Mobile close button */}
        <button 
          className="mobile-close-btn"
          onClick={onClose}
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontSize: '1.2rem', cursor: 'pointer', padding: '4px'
          }}
          aria-label="Close menu"
        >
          <span>✕</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard */}
        <Link
          href="/"
          className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}
        >
          <span>📊</span>
          <span>Dashboard</span>
        </Link>

        {/* Tool categories */}
        <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Learning Labs</div>
        {CATEGORIES.map(({ slug, label, icon }) => (
          <Link
            key={slug}
            href={`/tools/${slug}`}
            className={`sidebar-link ${isActive(`/tools/${slug}`) ? 'active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}

        <div className="sidebar-divider" style={{ marginTop: '16px' }} />

        {/* Other links */}
        <div className="sidebar-section-label">Tracking</div>
        <Link
          href="/jobs"
          className={`sidebar-link ${isActive('/jobs') ? 'active' : ''}`}
        >
          <span>💼</span>
          <span>Job Tracker</span>
        </Link>
        <Link
          href="/news"
          className={`sidebar-link ${isActive('/news') ? 'active' : ''}`}
        >
          <span>📰</span>
          <span>Latest in DevOps</span>
        </Link>
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        DevDash v1.0
      </div>
    </aside>
  );
}
