import React from 'react';

export default function Sidebar({ items, activeTab, onTabChange, header }) {
  return (
    <aside style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', flexShrink: 0 }}
           className="flex flex-col min-h-full">
      {header && (
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            {header.label}
          </div>
          <div className="font-semibold text-sm mt-1 truncate">{header.name}</div>
        </div>
      )}
      <nav className="flex-1 py-2">
        {items.map(item => (
          <button key={item.key} onClick={() => onTabChange(item.key)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all"
                  style={{
                    borderLeft: activeTab === item.key ? '3px solid var(--red)' : '3px solid transparent',
                    background: activeTab === item.key ? 'rgba(239,68,68,.08)' : 'transparent',
                    color: activeTab === item.key ? 'var(--text)' : 'var(--muted)',
                  }}>
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
