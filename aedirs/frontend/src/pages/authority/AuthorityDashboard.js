import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/store';
import { dispatchTeam, markerColor } from '../../utils/aiEngine';
import { notify } from '../../components/Notification';
import Sidebar from '../../components/Sidebar';
import KpiCard from '../../components/KpiCard';
import TableCard, { Th, Td } from '../../components/TableCard';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/Badge';
import StatusFlow from '../../components/StatusFlow';

const SIDEBAR = [
  { key: 'overview',   icon: '🏠', label: 'Overview' },
  { key: 'incidents',  icon: '⚠️', label: 'Incidents' },
  { key: 'map',        icon: '🗺️', label: 'Live Heatmap' },
  { key: 'dispatch',   icon: '🚒', label: 'Dispatch' },
  { key: 'analytics',  icon: '📊', label: 'Analytics' },
  { key: 'resources',  icon: '🏥', label: 'Resources' },
  { key: 'users',      icon: '👥', label: 'Users' },
];

const P_COLORS = { P1:'#EF4444', P2:'#F97316', P3:'#EAB308', P4:'#22C55E' };

// ── Overview ──────────────────────────────────────────────────────
function Overview({ setTab }) {
  const s = store.getStats();
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Total Incidents" value={s.total}    color="var(--blue)"   icon="📊" sub="↑ 8 today" />
        <KpiCard label="Active Cases"    value={s.active}   color="var(--orange)" icon="⚡" />
        <KpiCard label="Critical (P1)"   value={s.critical} color="var(--red)"    icon="🔴" />
        <KpiCard label="Teams Available" value={s.available} color="var(--green)" icon="✅" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <TableCard title="🔴 Critical Incidents">
          <thead><tr><Th>#</Th><Th>Title</Th><Th>Status</Th></tr></thead>
          <tbody>
            {store.incidents.filter(i=>i.priority==='P1'&&i.status!=='Resolved').slice(0,4).map(i=>(
              <tr key={i.id} className="hover:bg-white/[.02]">
                <Td className="text-slate-500 font-mono">#{i.id}</Td>
                <Td className="truncate max-w-[160px] font-medium">{i.title}</Td>
                <Td><StatusBadge status={i.status} /></Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">🚒 Rescue Teams</h3>
          {store.teams.map(t => {
            const dot = t.status==='Available' ? '#22C55E' : t.status==='On Route' ? '#F97316' : '#EF4444';
            const bg  = t.status==='Available' ? 'rgba(34,197,94,.2)' : t.status==='On Route' ? 'rgba(249,115,22,.2)' : 'rgba(239,68,68,.2)';
            const c   = t.status==='Available' ? '#86EFAC' : t.status==='On Route' ? '#FDB96B' : '#FCA5A5';
            return (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor:'var(--border)' }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:dot }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{t.name}</div>
                  <div className="text-xs" style={{ color:'var(--muted)' }}>{t.type} · {t.members} members</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background:bg, color:c }}>
                  {t.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <TableCard title="Recent Incident Reports"
                 action={<button onClick={()=>setTab('incidents')} className="text-xs text-blue-400">View All →</button>}>
        <thead><tr><Th>#</Th><Th>Title</Th><Th>Category</Th><Th>Priority</Th><Th>Status</Th><Th>Team</Th><Th>ETA</Th></tr></thead>
        <tbody>
          {store.incidents.slice(0,5).map(i=>(
            <tr key={i.id} className="hover:bg-white/[.02]">
              <Td className="text-slate-500 font-mono">#{i.id}</Td>
              <Td className="truncate max-w-[150px] font-medium">{i.title}</Td>
              <Td><CategoryBadge category={i.category} /></Td>
              <Td><PriorityBadge priority={i.priority} /></Td>
              <Td><StatusBadge status={i.status} /></Td>
              <Td className="text-xs text-slate-400">{i.assignedTeam}</Td>
              <Td className="text-xs">{i.eta > 0 ? i.eta + ' min' : '—'}</Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

// ── Incidents ─────────────────────────────────────────────────────
function Incidents() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [, forceUpdate] = useState(0);

  const filtered = filter === 'all' ? store.incidents
    : filter === 'active'   ? store.incidents.filter(i => i.status !== 'Resolved')
    : store.incidents.filter(i => i.status === 'Resolved');

  const resolve = (id) => {
    store.updateIncidentStatus(id, 'Resolved');
    notify(`Incident #${id} marked Resolved ✅`, 'success');
    forceUpdate(n => n + 1);
  };

  if (selected) {
    const i = store.incidents.find(inc => inc.id === selected);
    return (
      <div>
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs mb-4 px-3 py-1.5 rounded-lg border hover:text-blue-400 transition"
                style={{ borderColor:'var(--border)', color:'var(--muted)' }}>
          ← Back to Incidents
        </button>
        <div style={{ background:'var(--surface)', border:`1px solid var(--border)`, borderLeft:`4px solid ${P_COLORS[i.priority]||'#475569'}` }}
             className="rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Incident #{i.id}: {i.title}</h2>
              <div className="text-xs mt-1" style={{ color:'var(--muted)' }}>{i.location} · Reported {i.createdAt}</div>
            </div>
            <div className="flex gap-2"><PriorityBadge priority={i.priority} /><StatusBadge status={i.status} /></div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div><div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--muted)' }}>Description</div>
              <div className="text-sm leading-relaxed">{i.description}</div></div>
            <div className="space-y-2.5">
              {[['Category',<CategoryBadge key="c" category={i.category}/>],['Priority',<PriorityBadge key="p" priority={i.priority}/>],
                ['Status',<StatusBadge key="s" status={i.status}/>],['Assigned Team',i.assignedTeam],
                ['ETA',i.eta>0?i.eta+' min':'Arrived']].map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color:'var(--muted)' }}>{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <StatusFlow status={i.status} />
          <div className="flex gap-2 mt-4 flex-wrap">
            {['Verified','Assigned','In Progress','Resolved'].map(s=>(
              <button key={s} onClick={()=>{ store.updateIncidentStatus(i.id,s); forceUpdate(n=>n+1); notify(`Status → ${s}`,'success'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition"
                      style={{ background:'rgba(59,130,246,.15)', color:'#93C5FD' }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-base">Incident Management ({store.incidents.length})</h2>
        <div className="flex gap-2">
          {[['all','All'],['active','Active'],['resolved','Resolved']].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold transition"
                    style={{ background: filter===k ? 'var(--red)' : 'var(--surface2)', color: filter===k ? '#fff' : 'var(--muted)', border:'1px solid var(--border)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <TableCard>
        <thead><tr><Th>#</Th><Th>Title</Th><Th>Category</Th><Th>Priority</Th><Th>Status</Th><Th>Team</Th><Th>Time</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {filtered.map(i=>(
            <tr key={i.id} className="hover:bg-white/[.02]">
              <Td className="text-slate-500 font-mono">#{i.id}</Td>
              <Td className="truncate max-w-[140px] font-medium">{i.title}</Td>
              <Td><CategoryBadge category={i.category}/></Td>
              <Td><PriorityBadge priority={i.priority}/></Td>
              <Td><StatusBadge status={i.status}/></Td>
              <Td className="text-xs text-slate-400 truncate max-w-[100px]">{i.assignedTeam}</Td>
              <Td className="text-xs text-slate-500">{i.createdAt}</Td>
              <Td>
                <div className="flex gap-1.5">
                  <button onClick={()=>setSelected(i.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ background:'rgba(59,130,246,.15)', color:'#93C5FD' }}>View</button>
                  {i.status!=='Resolved' && (
                    <button onClick={()=>resolve(i.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold"
                            style={{ background:'rgba(34,197,94,.15)', color:'#86EFAC' }}>Resolve</button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

// ── Live Heatmap ──────────────────────────────────────────────────
function LiveMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([18.52, 73.86], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18
    }).addTo(map);

    store.incidents.forEach(inc => {
      const color = inc.status === 'Resolved' ? '#22C55E' : (P_COLORS[inc.priority] || '#94A3B8');
      L.circleMarker([inc.lat, inc.lng], {
        radius: 14, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.85
      }).addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;font-size:12px;min-width:180px;padding:4px">
          <strong>#${inc.id} — ${inc.title}</strong><br/>
          <span style="color:#666;font-size:11px">${inc.category} · ${inc.priority} · ${inc.status}</span><br/>
          Team: ${inc.assignedTeam}<br/>
          ${inc.eta > 0 ? 'ETA: '+inc.eta+' min' : 'Arrived'}
        </div>`);
    });

    store.teams.forEach(t => {
      const color = t.status==='Available' ? '#22C55E' : t.status==='On Route' ? '#F97316' : '#EF4444';
      L.circleMarker([t.lat, t.lng], {
        radius: 8, fillColor: color, color: '#1D4ED8', weight: 2, opacity: 1, fillOpacity: 0.9
      }).addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;font-size:12px;padding:4px">
          <strong>${t.name}</strong><br/>${t.type} · ${t.status}<br/>Members: ${t.members}
        </div>`);
    });

    mapInstanceRef.current = map;
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base">Live Disaster Heatmap</h2>
      </div>
      <div className="flex gap-4 flex-wrap mb-3">
        {[['#EF4444','P1 Critical'],['#F97316','P2 High'],['#EAB308','P3 Medium'],['#22C55E','Resolved'],['#3B82F6','Rescue Team']].map(([c,l])=>(
          <div key={l} className="flex items-center gap-2 text-xs" style={{ color:'var(--muted)' }}>
            <span className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white/30" style={{ background:c }} />
            {l}
          </div>
        ))}
      </div>
      <div ref={mapRef} style={{ height: 420, borderRadius: 12, overflow:'hidden', border:'1px solid var(--border)' }} />
      <div className="mt-4 text-xs text-center" style={{ color:'var(--muted)' }}>
        Click any marker for incident details · {store.incidents.length} incidents · {store.teams.length} teams shown
      </div>
    </div>
  );
}

// ── Dispatch ──────────────────────────────────────────────────────
function Dispatch() {
  const [selInc, setSelInc] = useState(store.incidents.filter(i=>i.status!=='Resolved')[0]?.id || '');
  const [result, setResult] = useState(null);
  const [, forceUpdate] = useState(0);

  const runDispatch = () => {
    const inc = store.incidents.find(i => i.id === parseInt(selInc));
    if (!inc) return;
    const { team, eta } = dispatchTeam(inc.category, inc.lat, inc.lng, store.teams);
    if (!team) { setResult({ error: 'No available teams for this incident type.' }); return; }
    store.assignTeamToIncident(inc.id, team, eta);
    setResult({ team, eta, inc });
    notify(`${team.name} dispatched → ETA ${eta} min`, 'success');
    forceUpdate(n => n + 1);
  };

  return (
    <div>
      <h2 className="font-bold text-base mb-5">Smart Dispatch Engine</h2>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Auto-Dispatch New Incident</h3>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--muted)' }}>Select Incident</label>
            <select value={selInc} onChange={e=>setSelInc(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}>
              {store.incidents.filter(i=>i.status!=='Resolved').map(i=>(
                <option key={i.id} value={i.id}>#{i.id} — {i.title.slice(0,45)}</option>
              ))}
            </select>
          </div>
          <button onClick={runDispatch}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition"
                  style={{ background:'var(--red)' }}>
            ⚡ Run Smart Dispatch
          </button>
          {result && (
            <div className="mt-4 rounded-xl px-4 py-3 text-xs"
                 style={result.error
                   ? { background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', color:'#FCA5A5' }
                   : { background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', color:'#86EFAC' }}>
              {result.error || `✅ ${result.team.name} dispatched to "${result.inc.title}" — ETA ${result.eta} min`}
            </div>
          )}
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">Dispatch Log</h3>
          {[
            { team:'Flood Rescue A', inc:'#1 Flood near Pune Station', eta:8 },
            { team:'NDRF Team A',    inc:'#2 Building collapse MG Road', eta:12 },
            { team:'Fire Team A',    inc:'#3 Vehicle fire on expressway', eta:6 },
            { team:'Ambulance A',    inc:'#4 Road accident Hinjewadi', eta:5 },
            { team:'Ambulance A',    inc:'#5 Medical emergency Baner', eta:4 },
          ].map((l,i)=>(
            <div key={i} className="text-xs py-2 border-b last:border-b-0 flex gap-2" style={{ borderColor:'var(--border)', color:'var(--muted)' }}>
              <span className="text-green-400">✅</span>
              <span><strong style={{ color:'var(--text)' }}>{l.team}</strong> → {l.inc} — ETA {l.eta} min</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">All Rescue Teams</h3>
        {store.teams.map(t=>{
          const dot = t.status==='Available'?'#22C55E':t.status==='On Route'?'#F97316':'#EF4444';
          const bg  = t.status==='Available'?'rgba(34,197,94,.2)':t.status==='On Route'?'rgba(249,115,22,.2)':'rgba(239,68,68,.2)';
          const tc  = t.status==='Available'?'#86EFAC':t.status==='On Route'?'#FDB96B':'#FCA5A5';
          return (
            <div key={t.id} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor:'var(--border)' }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:dot }}/>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs" style={{ color:'var(--muted)' }}>{t.type} · {t.members} members</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background:bg, color:tc }}>{t.status}</span>
              {t.status!=='Available' && (
                <button onClick={()=>{ store.setTeamStatus(t.id,'Available'); notify(t.name+' is now Available','success'); forceUpdate(n=>n+1); }}
                        className="text-xs px-2.5 py-1 rounded-lg font-bold"
                        style={{ background:'rgba(34,197,94,.15)', color:'#86EFAC' }}>Free</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────
function Analytics() {
  const s = store.getStats();
  const byCat = {};
  store.incidents.forEach(i => { byCat[i.category] = (byCat[i.category]||0)+1; });
  const catColors = { Flood:'#3B82F6', Fire:'#EF4444', 'Road Accident':'#F97316', 'Medical Emergency':'#22C55E', 'Building Collapse':'#A855F7', Unknown:'#94A3B8' };
  const cats = Object.keys(byCat);
  const maxV = Math.max(...Object.values(byCat));
  const respTimes = [14,9,16,8,12,11,10];
  const maxR = Math.max(...respTimes);
  const resRate = Math.round(s.resolved/s.total*100);
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Analytics Dashboard</h2>
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Total Reports"    value={s.total}    icon="📊" />
        <KpiCard label="Resolved"         value={s.resolved} color="var(--green)" icon="✅" />
        <KpiCard label="Avg Response"     value="12m"        color="var(--blue)"  icon="⏱️" />
        <KpiCard label="Resolution Rate"  value={resRate+'%'} color="var(--orange)" icon="📈" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Incidents by Category</h3>
          <div className="flex items-end gap-2" style={{ height:120 }}>
            {cats.map(cat=>(
              <div key={cat} className="flex-1 relative group" style={{ height:'100%', display:'flex', alignItems:'flex-end' }}>
                <div className="bar-grow w-full rounded-t" title={`${cat}: ${byCat[cat]}`}
                     style={{ height:`${Math.round(byCat[cat]/maxV*100)}%`, background:catColors[cat]||'#94A3B8', minWidth:16 }}/>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap">{byCat[cat]}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">{cats.map(c=><div key={c} className="flex-1 text-center text-[10px] truncate" style={{ color:'var(--muted)' }}>{c.split(' ')[0]}</div>)}</div>
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Priority Distribution</h3>
          {['P1','P2','P3','P4'].map(p=>{
            const count = store.incidents.filter(i=>i.priority===p).length;
            const pct = Math.round(count/s.total*100);
            return (
              <div key={p} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">{p}</span>
                  <span style={{ color:'var(--muted)' }}>{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--surface2)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:P_COLORS[p] }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Response Time – Last 7 Days (minutes)</h3>
        <div className="flex items-end gap-3" style={{ height:100 }}>
          {respTimes.map((v,i)=>(
            <div key={i} className="flex-1 relative group" style={{ height:'100%', display:'flex', alignItems:'flex-end' }}>
              <div className="bar-grow w-full rounded-t" style={{ height:`${Math.round(v/maxR*100)}%`, background:'var(--blue)' }}/>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">{v}m</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div key={d} className="flex-1 text-center text-[10px]" style={{ color:'var(--muted)' }}>{d}</div>)}
        </div>
      </div>
    </div>
  );
}

// ── Resources ─────────────────────────────────────────────────────
function Resources() {
  const resources = [
    { name:'Ambulances',  total:12, active:8,  available:4,  icon:'🚑', color:'#22C55E' },
    { name:'Fire Units',  total:8,  active:5,  available:3,  icon:'🚒', color:'#EF4444' },
    { name:'NDRF Teams',  total:4,  active:2,  available:2,  icon:'⛑️', color:'#F97316' },
    { name:'Police Units',total:20, active:14, available:6,  icon:'🚔', color:'#3B82F6' },
    { name:'Hospitals',   total:15, active:15, available:15, icon:'🏥', color:'#22C55E' },
  ];
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Resource Management</h2>
      <div className="grid grid-cols-3 gap-4">
        {resources.map(r=>(
          <div key={r.name} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderLeft:`3px solid ${r.color}` }}
               className="rounded-xl p-5">
            <div className="text-2xl mb-3">{r.icon}</div>
            <div className="font-bold text-sm mb-3">{r.name}</div>
            {[['Total',r.total,'var(--text)'],['Active',r.active,'var(--orange)'],['Available',r.available,r.color]].map(([l,v,c])=>(
              <div key={l} className="flex justify-between text-xs py-1 border-b last:border-b-0" style={{ borderColor:'var(--border)' }}>
                <span style={{ color:'var(--muted)' }}>{l}</span>
                <span className="font-bold" style={{ color:c }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────
function Users() {
  const roleStyle = {
    citizen:     'bg-blue-500/20 text-blue-300',
    rescue_team: 'bg-orange-500/20 text-orange-300',
    authority:   'bg-red-500/20 text-red-300',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-base">User Management ({store.users.length})</h2>
        <button className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background:'rgba(34,197,94,.15)', color:'#86EFAC' }}>+ Add User</button>
      </div>
      <TableCard>
        <thead><tr><Th>#</Th><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Phone</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {store.users.map(u=>(
            <tr key={u.id} className="hover:bg-white/[.02]">
              <Td className="text-slate-500 font-mono">#{u.id}</Td>
              <Td className="font-medium">{u.name}</Td>
              <Td className="text-slate-400 text-xs">{u.email}</Td>
              <Td><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${roleStyle[u.role]}`}>{u.role.replace('_',' ')}</span></Td>
              <Td className="text-slate-400 text-xs">{u.phone || '—'}</Td>
              <Td>
                <button onClick={() => notify('User management action', 'info')}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ background:'rgba(239,68,68,.15)', color:'#FCA5A5' }}>Manage</button>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const s = store.getStats();

  return (
    <div className="flex" style={{ minHeight:'calc(100vh - 56px)' }}>
      <Sidebar items={SIDEBAR.map(i => i.key==='incidents' ? {...i, badge: s.active||undefined} : i)}
               activeTab={tab} onTabChange={setTab}
               header={{ label:'Authority', name: user?.name }} />
      <main className="flex-1 overflow-y-auto p-6">
        {tab==='overview'  && <Overview setTab={setTab} />}
        {tab==='incidents' && <Incidents />}
        {tab==='map'       && <LiveMap />}
        {tab==='dispatch'  && <Dispatch />}
        {tab==='analytics' && <Analytics />}
        {tab==='resources' && <Resources />}
        {tab==='users'     && <Users />}
      </main>
    </div>
  );
}
