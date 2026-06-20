'use client';

import React, { useState } from 'react';
import type { DailyFocus as DailyFocusType } from '@/lib/supabase';

interface DailyFocusProps {
  initialFocus: DailyFocusType | null;
}

export default function DailyFocus({ initialFocus }: DailyFocusProps) {
  const [focus, setFocus] = useState<DailyFocusType | null>(initialFocus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFocus = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/focus${force ? '?force=true' : ''}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate focus');
      setFocus(data.focus);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-secondary)' }}>
        Today's Focus
      </h2>
      
      {error && (
        <div style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!focus && !loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <button className="btn btn-primary" onClick={() => generateFocus()}>
            Generate today's focus
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div className="spinner" />
          <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Consulting AI...
          </div>
        </div>
      )}

      {focus && !loading && (
        <div>
          <div style={{
            fontSize: '1rem', 
            lineHeight: 1.6, 
            color: 'var(--text-primary)',
            background: 'var(--bg)',
            padding: '16px',
            borderRadius: 'var(--radius)',
            borderLeft: '3px solid var(--accent)'
          }}>
            {focus.suggestion}
          </div>
          <div style={{ textAlign: 'right', marginTop: '12px' }}>
            <button 
              className="btn-ghost" 
              style={{ fontSize: '0.75rem', padding: '4px 8px', border: 'none', cursor: 'pointer' }}
              onClick={() => generateFocus(true)}
            >
              regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
