'use client';

import { useState, useEffect, useCallback } from 'react';
import LabChecklist from '@/components/LabChecklist';
import AiSuggestionBox from '@/components/AiSuggestionBox';
import type { Lab } from '@/lib/supabase';

const CATEGORY_META: Record<string, { label: string; icon: string; description: string }> = {
  linux:      { label: 'Linux',       icon: '🐧', description: 'File systems, processes, permissions, shell scripting & more' },
  docker:     { label: 'Docker',      icon: '🐳', description: 'Containers, images, Compose, registries & best practices' },
  kubernetes: { label: 'Kubernetes',  icon: '⚙️', description: 'Pods, deployments, services, ingress & cluster management' },
  aws:        { label: 'AWS',         icon: '☁️', description: 'EC2, S3, IAM, VPC, Lambda & cloud-native services' },
  terraform:  { label: 'Terraform',   icon: '🏗️', description: 'Infrastructure as Code, state management & modules' },
  'ci-cd':    { label: 'CI / CD',     icon: '🔄', description: 'GitHub Actions, pipelines, testing & deployment automation' },
  ansible:    { label: 'Ansible',     icon: '📋', description: 'Playbooks, roles, inventory & configuration management' },
};

const VALID_SLUGS = Object.keys(CATEGORY_META);

interface ToolPageClientProps {
  slug: string;
}

export default function ToolPageClient({ slug }: ToolPageClientProps) {
  const [labs, setLabs] = useState<Lab[]>([]);

  const meta = CATEGORY_META[slug];

  if (!VALID_SLUGS.includes(slug)) {
    return (
      <div className="empty-state" style={{ paddingTop: '80px' }}>
        <span className="empty-state-icon">🔍</span>
        <p style={{ fontWeight: 600, fontSize: '1rem' }}>Category not found</p>
        <p>Valid categories: {VALID_SLUGS.join(', ')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            width: '48px', height: '48px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>
            {meta.icon}
          </span>
          <div>
            <h1 className="page-title">{meta.label}</h1>
            <p className="page-subtitle">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Main content: 2-col on wide screens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Checklist */}
        <div>
          <LabChecklist slug={slug} onLabsChange={setLabs} />
        </div>

        {/* Right: AI box */}
        <div>
          <AiSuggestionBox slug={slug} labs={labs} />
        </div>
      </div>
    </div>
  );
}
