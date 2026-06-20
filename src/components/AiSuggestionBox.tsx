'use client';

import { useState } from 'react';
import type { Lab } from '@/lib/supabase';

interface AiSuggestionBoxProps {
  slug: string;
  labs: Lab[];
}

export default function AiSuggestionBox({ slug, labs }: AiSuggestionBoxProps) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getSuggestion = async () => {
    setLoading(true);
    setError('');
    setSuggestion('');

    const completed = labs.filter((l) => l.status === 'done').map((l) => l.name);
    const pending = labs.filter((l) => l.status !== 'done').map((l) => l.name);

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: slug, completed, pending }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to get suggestion');
      } else {
        setSuggestion(data.suggestion);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>AI Study Guide</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Powered by Gemini — personalised to your progress
          </p>
        </div>
        <span style={{ fontSize: '1.25rem' }}>✨</span>
      </div>

      <button
        className="btn btn-primary"
        onClick={getSuggestion}
        disabled={loading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {loading ? (
          <>
            <span className="spinner" style={{ width: '14px', height: '14px' }} />
            Thinking…
          </>
        ) : (
          <>✨ What should I learn next?</>
        )}
      </button>

      {error && (
        <div style={{
          marginTop: '14px',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 'var(--radius)',
          padding: '12px 14px',
          fontSize: '0.85rem',
          color: 'var(--accent)',
        }}>
          {error}
        </div>
      )}

      {suggestion && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(220,38,38,0.04)',
          border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'flex-start',
            fontSize: '0.875rem', color: 'var(--text-primary)',
            lineHeight: '1.65',
          }}>
            <span style={{ color: 'var(--accent)', marginTop: '1px', flexShrink: 0 }}>✦</span>
            <span style={{ whiteSpace: 'pre-wrap' }}>{suggestion}</span>
          </div>
        </div>
      )}
    </div>
  );
}
