'use client';

import { useState, useEffect, useCallback } from 'react';
import ProgressBar from './ProgressBar';
import type { Lab, LabStatus } from '@/lib/supabase';

const STATUS_CYCLE: LabStatus[] = ['not_started', 'in_progress', 'done'];

const STATUS_ICON: Record<LabStatus, string> = {
  not_started: '',
  in_progress: '◑',
  done: '✓',
};

const STATUS_LABEL: Record<LabStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
};

interface LabChecklistProps {
  slug: string;
  onLabsChange?: (labs: Lab[]) => void;
}

export default function LabChecklist({ slug, onLabsChange }: LabChecklistProps) {
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    if (onLabsChange) {
      onLabsChange(labs);
    }
  }, [labs, onLabsChange]);
  const [loading, setLoading] = useState(true);
  const [newLabName, setNewLabName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/labs?category=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setLabs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch labs', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const cycleStatus = async (lab: Lab) => {
    const currentIndex = STATUS_CYCLE.indexOf(lab.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    // Optimistic update
    setLabs((prev) =>
      prev.map((l) => (l.id === lab.id ? { ...l, status: nextStatus } : l))
    );

    try {
      await fetch('/api/labs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lab.id, status: nextStatus }),
      });
    } catch {
      // Revert on failure
      setLabs((prev) =>
        prev.map((l) => (l.id === lab.id ? { ...l, status: lab.status } : l))
      );
    }
  };

  const addLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim()) return;
    setAdding(true);

    try {
      const res = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: slug, name: newLabName.trim() }),
      });
      const newLab = await res.json();
      setLabs((prev) => [...prev, newLab]);
      setNewLabName('');
    } catch (err) {
      console.error('Failed to add lab', err);
    } finally {
      setAdding(false);
    }
  };

  const deleteLab = async (id: string) => {
    setLabs((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/labs?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete lab', err);
      fetchLabs(); // refetch on failure
    }
  };

  const total = labs.length;
  const done = labs.filter((l) => l.status === 'done').length;
  const percentage = total > 0 ? (done / total) * 100 : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: '52px' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Progress summary */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Progress
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {done} of {total} labs completed
            </div>
          </div>
          <div style={{
            fontSize: '1.75rem', fontWeight: 700,
            color: percentage === 100 ? 'var(--success)' : 'var(--accent)',
          }}>
            {Math.round(percentage)}%
          </div>
        </div>
        <ProgressBar percentage={percentage} showLabel={false} height={8} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
          {Object.entries(STATUS_LABEL).map(([s, label]) => {
            const count = labs.filter((l) => l.status === s).length;
            return (
              <div key={s} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span className={`badge badge-${s}`}>{count} {label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lab list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {labs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔬</span>
            <p style={{ fontWeight: 500 }}>No labs yet</p>
            <p style={{ fontSize: '0.875rem' }}>Add your first lab below</p>
          </div>
        ) : (
          labs.map((lab) => (
            <div key={lab.id} className="lab-row" style={{ position: 'relative' }}>
              {/* Status toggle */}
              <button
                onClick={() => cycleStatus(lab)}
                className={`lab-toggle ${lab.status}`}
                title={`Click to cycle status (currently: ${STATUS_LABEL[lab.status]})`}
              >
                {STATUS_ICON[lab.status]}
              </button>

              {/* Lab name */}
              <span className={`lab-name ${lab.status === 'done' ? 'done' : ''}`}>
                {lab.name}
              </span>

              {/* Status badge */}
              <span className={`badge badge-${lab.status}`} style={{ fontSize: '0.7rem' }}>
                {STATUS_LABEL[lab.status]}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteLab(lab.id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '0.875rem', padding: '4px',
                  opacity: 0, transition: 'opacity 0.15s',
                }}
                className="delete-btn"
                title="Delete lab"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add new lab form */}
      <form onSubmit={addLab} style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input"
          placeholder="Add a new lab (e.g. 'Docker multi-stage builds')…"
          value={newLabName}
          onChange={(e) => setNewLabName(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={adding || !newLabName.trim()}
          style={{ flexShrink: 0 }}
        >
          {adding ? '…' : '+ Add'}
        </button>
      </form>

      <style>{`
        .lab-row:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
