'use client';

import { useState, useEffect } from 'react';
import type { JobApplication, ApplicationStatus } from '@/lib/supabase';

interface JobFormModalProps {
  job?: JobApplication | null;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected'];

export default function JobFormModal({ job, onClose, onSave }: JobFormModalProps) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'applied' as ApplicationStatus,
    date_applied: '',
    link: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setForm({
        company: job.company,
        role: job.role,
        status: job.status,
        date_applied: job.date_applied || '',
        link: job.link || '',
        notes: job.notes || '',
      });
    }
  }, [job]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const method = job ? 'PATCH' : 'POST';
      const body = job ? { id: job.id, ...form } : form;

      const res = await fetch('/api/jobs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        return;
      }

      const saved = await res.json();
      onSave(saved);
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {job ? 'Edit Application' : 'Add Application'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label" htmlFor="company">Company *</label>
              <input id="company" name="company" className="input" value={form.company}
                onChange={handleChange} placeholder="Acme Corp" required />
            </div>
            <div>
              <label className="label" htmlFor="role">Role *</label>
              <input id="role" name="role" className="input" value={form.role}
                onChange={handleChange} placeholder="DevOps Engineer" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} style={{ background: 'var(--bg-surface)' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="date_applied">Date Applied</label>
              <input id="date_applied" name="date_applied" type="date" className="input"
                value={form.date_applied} onChange={handleChange}
                style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="link">Job Link</label>
            <input id="link" name="link" type="url" className="input" value={form.link}
              onChange={handleChange} placeholder="https://…" />
          </div>

          <div>
            <label className="label" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" className="input" value={form.notes}
              onChange={handleChange} placeholder="Recruiter contact, interview notes…"
              rows={3} style={{ resize: 'vertical' }} />
          </div>

          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 14px',
              color: 'var(--accent)', fontSize: '0.8rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : job ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
