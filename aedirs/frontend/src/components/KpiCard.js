import React from 'react';

export default function KpiCard({ label, value, color = 'var(--text)', sub, icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
         className="rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-3xl font-extrabold leading-none mt-1" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}
