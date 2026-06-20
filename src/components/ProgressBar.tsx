interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  height?: number;
}

export default function ProgressBar({ percentage, showLabel = true, height = 6 }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(percentage)));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        className="progress-track"
        style={{ flex: 1, height: `${height}px` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--text-muted)',
          minWidth: '36px',
          textAlign: 'right',
        }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
