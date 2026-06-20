'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Excalidraw must be dynamically imported with ssr: false because it relies on browser APIs
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: '100%', width: '100%', borderRadius: '12px' }} /> }
);

export default function WhiteboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">System Design Whiteboard</h1>
        <p className="page-subtitle">Practice drawing architectures for your technical interviews.</p>
      </div>

      <div style={{ flex: 1, minHeight: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Excalidraw theme="dark" />
      </div>
    </div>
  );
}
