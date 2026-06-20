import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/store';
import { classifyIncident, assignPriority, dispatchTeam } from '../../utils/aiEngine';
import { notify } from '../../components/Notification';
import Sidebar from '../../components/Sidebar';
import KpiCard from '../../components/KpiCard';
import TableCard, { Th, Td } from '../../components/TableCard';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/Badge';
import StatusFlow from '../../components/StatusFlow';
import EmergencyStrip from '../../components/EmergencyStrip';

const SIDEBAR_ITEMS = [
  { key: 'overview',   icon: '🏠', label: 'Dashboard' },
  { key: 'report',     icon: '📋', label: 'Report Emergency' },
  { key: 'myreports',  icon: '📁', label: 'My Reports' },
  { key: 'contacts',   icon: '📞', label: 'Emergency Contacts' },
  { key: 'safety',     icon: '🛡️', label: 'Safety Guidelines' },
];

// ── Overview ──────────────────────────────────────────────────────
function Overview({ user }) {
  const myReports = store.incidents.filter(i => i.reportedBy === user.id);
  const stats = store.getStats();
  return (
    <div>
      <EmergencyStrip />
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="My Reports"  value={myReports.length} color="var(--blue)" icon="📋" />
        <KpiCard label="Active"      value={myReports.filter(i => i.status !== 'Resolved').length} color="var(--orange)" icon="⚡" />
        <KpiCard label="Resolved"    value={myReports.filter(i => i.status === 'Resolved').length} color="var(--green)" icon="✅" />
        <KpiCard label="Notifications" value={3} color="var(--red)" icon="🔔" />
      </div>
      <TableCard title="My Recent Reports"
                 action={<span className="text-xs text-blue-400 cursor-pointer">View All →</span>}>
        <thead><tr>
          <Th>ID</Th><Th>Title</Th><Th>Category</Th><Th>Priority</Th><Th>Status</Th>
        </tr></thead>
        <tbody>
          {myReports.slice(0, 4).map(i => (
            <tr key={i.id} className="hover:bg-white/[.02]">
              <Td className="text-slate-500 font-mono">#{i.id}</Td>
              <Td className="font-medium max-w-[180px] truncate">{i.title}</Td>
              <Td><CategoryBadge category={i.category} /></Td>
              <Td><PriorityBadge priority={i.priority} /></Td>
              <Td><StatusBadge status={i.status} /></Td>
            </tr>
          ))}
          {myReports.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No reports yet. Submit your first emergency report!</td></tr>
          )}
        </tbody>
      </TableCard>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
        <div className="font-semibold text-sm mb-3">🔔 Recent Notifications</div>
        {[
          { msg: 'Flood Rescue Team A dispatched to your report #1 — ETA 8 minutes', type: 'info' },
          { msg: 'Report #6 (Waterlogging Kothrud) has been resolved', type: 'success' },
          { msg: 'NDRF Team A assigned to report #2 — ETA 12 minutes', type: 'info' },
        ].map((n, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-b-0 text-sm"
               style={{ borderColor: 'var(--border)' }}>
            <span>{n.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span style={{ color: 'var(--muted)' }}>{n.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Report Form ───────────────────────────────────────────────────
function ReportForm({ user, onSuccess }) {
  const [form, setForm] = useState({ title: '', desc: '', category: '', location: 'Pune, Maharashtra (18.5204, 73.8567)' });
  const [ai, setAi] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'title' || k === 'desc') {
      const combined = (k === 'title' ? v : form.title) + ' ' + (k === 'desc' ? v : form.desc);
      if (combined.trim().length > 5) {
        const cat = classifyIncident(combined);
        const pri = assignPriority(combined);
        const { team } = dispatchTeam(cat, 18.5204, 73.8567, store.teams);
        setAi({ cat, pri, team });
      } else setAi(null);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.desc) { notify('Please fill title and description.', 'error'); return; }
    setSubmitting(true);
    setTimeout(() => {
      const cat = classifyIncident(form.title + ' ' + form.desc);
      const pri = assignPriority(form.title + ' ' + form.desc);
      const { team, eta } = dispatchTeam(cat, 18.5204, 73.8567, store.teams);
      const inc = store.addIncident({
        title: form.title, description: form.desc, category: cat, priority: pri,
        status: 'Reported', lat: 18.5204, lng: 73.8567, location: form.location,
        reportedBy: user.id, assignedTeam: team ? team.name : 'Unassigned', eta,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
      if (team) store.assignTeamToIncident(inc.id, team, eta);
      notify(`Report #${inc.id} submitted! AI classified as ${cat} (${pri})`, 'success');
      notify(team ? `${team.name} dispatched — ETA ${eta} min` : 'No teams available right now', team ? 'info' : 'warning');
      setSubmitting(false);
      onSuccess();
    }, 800);
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
         className="rounded-xl p-7 max-w-2xl">
      <h2 className="text-lg font-bold mb-1">🚨 Report an Emergency</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        Fill out the form below. Our AI will auto-classify and dispatch the nearest team.
      </p>

      {[
        { key: 'title', label: 'Incident Title', placeholder: 'e.g. Flood near Pune Station', type: 'input' },
        { key: 'desc', label: 'Full Description', placeholder: 'Describe the situation — number of people, severity, what you see…', type: 'textarea' },
      ].map(f => (
        <div key={f.key} className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                      rows={4} placeholder={f.placeholder}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          ) : (
            <input value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                   placeholder={f.placeholder}
                   className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                   style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          )}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Category (auto or choose)</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">-- AI will auto-detect --</option>
            {['Flood', 'Fire', 'Road Accident', 'Medical Emergency', 'Building Collapse', 'Unknown'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Location</label>
          <input value={form.location} onChange={e => set('location', e.target.value)}
                 className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                 style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Attach Photos / Videos (optional)</label>
        <label className="flex items-center justify-center gap-2 w-full rounded-xl py-4 text-sm cursor-pointer transition"
               style={{ background: 'var(--surface2)', border: '1px dashed var(--border)', color: 'var(--muted)' }}>
          📎 Click to attach photos or videos
          <input type="file" className="hidden" multiple accept="image/*,video/*" />
        </label>
      </div>

      {/* AI Preview */}
      {ai && (
        <div className="mb-5 rounded-xl px-5 py-4" style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--blue)' }}>🤖 AI Classification Preview</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Category', val: <CategoryBadge category={ai.cat} /> },
              { label: 'Priority', val: <PriorityBadge priority={ai.pri} /> },
              { label: 'Suggested Team', val: <span className="text-xs font-semibold text-slate-300">{ai.team ? ai.team.name : 'None available'}</span> },
            ].map(r => (
              <div key={r.label}>
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{r.label}</div>
                {r.val}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
              style={{ background: 'var(--red)' }}>
        {submitting ? '⏳ Submitting…' : '🚨 Submit Emergency Report'}
      </button>
    </div>
  );
}

// ── My Reports ────────────────────────────────────────────────────
function MyReports({ user }) {
  const myReports = store.incidents.filter(i => i.reportedBy === user.id);
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-base">My Reports ({myReports.length})</h2>
      </div>
      {myReports.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>
          No reports yet. Submit your first emergency report!
        </div>
      )}
      {myReports.map(i => (
        <div key={i.id} style={{
               background: 'var(--surface)',
               border: '1px solid var(--border)',
               borderLeft: `4px solid ${{ P1: '#EF4444', P2: '#F97316', P3: '#EAB308', P4: '#22C55E' }[i.priority] || '#475569'}`
             }} className="rounded-xl p-5 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-semibold text-sm">#{i.id} — {i.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{i.location} · {i.createdAt}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <PriorityBadge priority={i.priority} />
              <StatusBadge status={i.status} />
            </div>
          </div>
          <div className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {i.description.slice(0, 120)}…
          </div>
          <StatusFlow status={i.status} />
          {i.assignedTeam && i.assignedTeam !== 'Unassigned' && (
            <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
              🚒 <strong style={{ color: 'var(--text)' }}>{i.assignedTeam}</strong>
              {i.eta > 0 ? ` · ETA ${i.eta} min` : ' · On site'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Emergency Contacts ─────────────────────────────────────────────
function Contacts() {
  const contacts = [
    { name: 'National Emergency', num: '112',          icon: '🆘', color: '#EF4444' },
    { name: 'Fire Brigade',       num: '101',          icon: '🔥', color: '#F97316' },
    { name: 'Police',             num: '100',          icon: '👮', color: '#3B82F6' },
    { name: 'Ambulance',          num: '108',          icon: '🚑', color: '#22C55E' },
    { name: 'NDMA Helpline',      num: '1078',         icon: '⚠️', color: '#EAB308' },
    { name: 'Ruby Hall Clinic',   num: '020-66455000', icon: '🏥', color: '#3B82F6' },
    { name: 'KEM Hospital',       num: '020-26125600', icon: '🏥', color: '#3B82F6' },
    { name: 'Sassoon Hospital',   num: '020-26128000', icon: '🏥', color: '#3B82F6' },
  ];
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Emergency Contacts</h2>
      <div className="grid grid-cols-3 gap-4">
        {contacts.map(c => (
          <div key={c.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${c.color}` }}
               className="rounded-xl p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-semibold text-sm mb-1">{c.name}</div>
            <div className="text-xl font-extrabold" style={{ color: c.color }}>{c.num}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Safety ─────────────────────────────────────────────────────────
function Safety() {
  const guides = [
    { title: '🌊 During Flood', tips: ['Move to higher ground immediately', 'Don\'t walk through floodwaters', 'Disconnect electrical appliances', 'Call 112 if trapped'] },
    { title: '🔥 During Fire',  tips: ['Activate fire alarm, call 101', 'Crawl low to avoid smoke', 'Use stairs, never elevators', 'Meet at assembly point'] },
    { title: '🏢 Earthquake',   tips: ['Drop, Cover, Hold On', 'Stay away from windows', 'Do not run outside during shaking', 'Check injuries after shaking stops'] },
    { title: '🚗 Road Accident', tips: ['Call 108 (ambulance) and 100 (police)', 'Don\'t move injured unless necessary', 'Turn on hazard lights', 'Keep area clear for emergency vehicles'] },
  ];
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Safety Guidelines</h2>
      <div className="grid grid-cols-2 gap-4">
        {guides.map(g => (
          <div key={g.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div className="font-bold mb-3">{g.title}</div>
            {g.tips.map((t, i) => (
              <div key={i} className="flex gap-2 mb-1.5 text-sm" style={{ color: 'var(--muted)' }}>
                <span className="text-green-400 flex-shrink-0">✓</span> {t}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function CitizenDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const myReports = store.incidents.filter(i => i.reportedBy === user?.id);

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <Sidebar items={SIDEBAR_ITEMS.map(i => i.key === 'myreports' ? { ...i, badge: myReports.filter(r => r.status !== 'Resolved').length || undefined } : i)}
               activeTab={tab} onTabChange={setTab}
               header={{ label: 'Citizen Portal', name: user?.name }} />
      <main className="flex-1 overflow-y-auto p-6">
        {tab === 'overview'  && <Overview user={user} />}
        {tab === 'report'    && <ReportForm user={user} onSuccess={() => setTab('overview')} />}
        {tab === 'myreports' && <MyReports user={user} />}
        {tab === 'contacts'  && <Contacts />}
        {tab === 'safety'    && <Safety />}
      </main>
    </div>
  );
}
