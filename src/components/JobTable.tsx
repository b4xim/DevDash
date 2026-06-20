'use client';

import { useState, useEffect } from 'react';
import type { JobApplication, ApplicationStatus } from '@/lib/supabase';
import JobFormModal from './JobFormModal';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  applied: 'badge-applied',
  interview: 'badge-interview',
  offer: 'badge-offer',
  rejected: 'badge-rejected',
};

export default function JobTable() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [activeStatus]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = activeStatus === 'all' ? '/api/jobs' : `/api/jobs?status=${activeStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (saved: JobApplication) => {
    setJobs((prev) => {
      const exists = prev.find((j) => j.id === saved.id);
      if (exists) {
        return prev.map((j) => (j.id === saved.id ? saved : j));
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
    } catch {
      fetchJobs();
    }
  };

  const openAdd = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEdit = (job: JobApplication) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? jobs.length
      : jobs.filter((j) => j.status === tab.value).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="tab-bar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`tab ${activeStatus === tab.value ? 'active' : ''}`}
              onClick={() => setActiveStatus(tab.value)}
            >
              {tab.label}
              {activeStatus === 'all' && tab.value !== 'all' && (
                <span style={{
                  marginLeft: '5px', fontSize: '0.7rem', fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)', borderRadius: '99px',
                  padding: '1px 6px',
                }}>
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Application
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '40px' }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">💼</span>
            <p style={{ fontWeight: 500 }}>No applications yet</p>
            <p style={{ fontSize: '0.875rem' }}>Start tracking your job search</p>
            <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: '8px' }}>
              + Add First Application
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Applied</th>
                <th>Link</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 500 }}>{job.company}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{job.role}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[job.status]}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {job.date_applied
                      ? new Date(job.date_applied + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    {job.link ? (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--accent)', fontSize: '0.8rem',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        ↗ Open
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <span style={{
                      color: 'var(--text-muted)', fontSize: '0.8rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      display: 'block',
                    }}>
                      {job.notes || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(job)}
                        style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(job.id)}
                        style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <JobFormModal
          job={editingJob}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
