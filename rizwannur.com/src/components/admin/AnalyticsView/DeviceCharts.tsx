'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { DeviceRow, SplitRow } from '@/lib/analytics/aggregate'

const PIE_COLORS = ['#5b8def', '#9a7af1', '#f17a8e', '#f1b07a']

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  minWidth: 0,
  boxSizing: 'border-box',
}

const chartBoxStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  minWidth: 0,
}

export function DeviceCharts({
  devices,
  browsers,
  os,
}: {
  devices: DeviceRow[]
  browsers: SplitRow[]
  os: SplitRow[]
}) {
  return (
    <section
      style={{
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
      }}
    >
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Devices</h3>
        <div style={chartBoxStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={devices} dataKey="visits" nameKey="device" outerRadius={70} label>
                {devices.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Browsers</h3>
        <div style={chartBoxStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={browsers}>
              <XAxis dataKey="key" stroke="var(--theme-elevation-400)" fontSize={11} />
              <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="visits" fill="#5b8def" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>OS</h3>
        <div style={chartBoxStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={os}>
              <XAxis dataKey="key" stroke="var(--theme-elevation-400)" fontSize={11} />
              <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="visits" fill="#9a7af1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
