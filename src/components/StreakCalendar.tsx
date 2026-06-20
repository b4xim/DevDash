'use client';

import React from 'react';
import type { ActivityLog } from '@/lib/supabase';

interface StreakCalendarProps {
  logs: ActivityLog[];
}

export default function StreakCalendar({ logs }: StreakCalendarProps) {
  // Generate last 90 days
  const today = new Date();
  const days = Array.from({ length: 90 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (89 - i));
    return d.toISOString().split('T')[0];
  });

  const logMap = new Map<string, number>();
  logs.forEach(l => logMap.set(l.log_date, l.count));

  const getColor = (count: number) => {
    if (count === 0) return 'var(--bg-elevated)';
    if (count <= 2) return 'rgba(220, 38, 38, 0.3)';
    if (count <= 5) return 'rgba(220, 38, 38, 0.6)';
    return 'var(--accent)';
  };

  const oldestDate = new Date(today);
  oldestDate.setDate(today.getDate() - 89);
  const emptyCells = oldestDate.getDay(); // 0 is Sunday

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-secondary)' }}>
        Activity Streak
      </h2>
      
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(7, 12px)',
          gap: '4px',
          width: 'max-content'
        }}>
          {Array.from({ length: emptyCells }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: '12px', height: '12px' }} />
          ))}
          {days.map(date => {
            const count = logMap.get(date) || 0;
            return (
              <div
                key={date}
                title={`${date}: ${count} actions`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: getColor(count),
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--bg-elevated)' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(220, 38, 38, 0.3)' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(220, 38, 38, 0.6)' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--accent)' }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
