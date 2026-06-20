'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface BarData {
  category: string;
  percentage: number;
  done: number;
  total: number;
}

interface PieData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  barData: BarData[];
  pieData: PieData[];
}

const PIE_COLORS: Record<string, string> = {
  Applied:   '#3b82f6',
  Interview: '#f59e0b',
  Offer:     '#22c55e',
  Rejected:  '#dc2626',
};

const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: BarData }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '4px' }}>{d.category}</p>
      <p style={{ color: 'var(--text-muted)' }}>{d.done} / {d.total} completed</p>
      <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{d.percentage}%</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem',
    }}>
      <p style={{ fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: 'var(--text-muted)' }}>{payload[0].value} application{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default function DashboardCharts({ barData, pieData }: DashboardChartsProps) {
  const hasBarData = barData.some((d) => d.total > 0);
  const hasPieData = pieData.some((d) => d.value > 0);

  return (
    <div className="grid-cards-2">
      {/* Bar Chart */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px' }}>
          Lab Progress by Category
        </h3>
        {!hasBarData ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <p style={{ fontSize: '0.875rem' }}>No lab data yet — add some labs to see progress</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="percentage" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px' }}>
          Job Applications by Status
        </h3>
        {!hasPieData ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <p style={{ fontSize: '0.875rem' }}>No job applications yet — start tracking your search</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[entry.name] ?? '#555'}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
