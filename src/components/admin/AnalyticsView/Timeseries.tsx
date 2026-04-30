'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Mode = 'visits' | 'unique'

export function Timeseries({
  data,
}: {
  data: { date: string; visits: number; unique: number }[]
}) {
  const [mode, setMode] = useState<Mode>('visits')
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }))

  return (
    <section style={{ marginBottom: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 14 }}>Visits over time</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['visits', 'unique'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid var(--theme-elevation-150)',
                background: mode === m ? 'var(--theme-elevation-100)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {m === 'visits' ? 'Total' : 'Unique'}
            </button>
          ))}
        </div>
      </header>
      <div
        style={{
          width: '100%',
          height: 320,
          minWidth: 0,
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          padding: 12,
          boxSizing: 'border-box',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-100)" />
            <XAxis dataKey="label" stroke="var(--theme-elevation-400)" fontSize={11} />
            <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey={mode} stroke="currentColor" fill="currentColor" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
