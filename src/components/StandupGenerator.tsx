'use client';

import { useState } from 'react';
import type { Lab } from '@/lib/supabase';

export default function StandupGenerator({ labs }: { labs: Lab[] }) {
  const [standup, setStandup] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateStandup = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch('/api/standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labs }),
      });
      const data = await res.json();
      if (res.ok && data.standup) {
        setStandup(data.standup);
      } else {
        alert(data.error || 'Failed to generate standup');
      }
    } catch (err) {
      alert('Error fetching standup');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(standup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-elevated)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Daily Standup Generator</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate a professional update based on your lab progress.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={generateStandup} 
          disabled={loading}
        >
          {loading ? 'Generating...' : '⚡ Generate'}
        </button>
      </div>

      {standup && (
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <pre style={{
            background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px',
            fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
            fontFamily: 'inherit', border: '1px solid var(--border)'
          }}>
            {standup}
          </pre>
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost"
            style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}
