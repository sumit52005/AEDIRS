import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/store';
import { notify } from '../../components/Notification';
import Sidebar from '../../components/Sidebar';
import KpiCard from '../../components/KpiCard';
import { PriorityBadge } from '../../components/Badge';

const SIDEBAR = [
  { key: 'overview',  icon: '🏠', label: 'Team Dashboard' },
  { key: 'assigned',  icon: '📌', label: 'Assigned Cases' },
  { key: 'missions',  icon: '✅', label: 'Completed' },
  { key: 'status',    icon: '🔄', label: 'Team Status' },
];

function Overview() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Active Missions"  value={2} color="var(--orange)" icon="🚒" />
        <KpiCard label="Completed"        value={8} color="var(--green)"  icon="✅" />
        <KpiCard label="Team Members"     value={6} color="var(--blue)"   icon="👥" />
        <KpiCard label="Team Status"      value="On Route" color="var(--orange)" icon="📍" />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
           className="rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">🚨 Current Active Mission</h3>
          <PriorityBadge priority="P2" />
        </div>
        <div className="px-4 py-3 rounded-xl mb-3 text-sm flex gap-2"
             style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)' }}>
          ℹ️ <span style={{ color: 'var(--muted)' }}>Vehicle fire on expressway — ETA to site: <strong style={{color:'var(--text)'}}>6 minutes</strong></span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          {[['Location','Mumbai-Pune Expressway'],['Category','Fire'],['Assigned By','AEDIRS Dispatch']].map(([k,v])=>(
            <div key={k}><div className="text-xs mb-1" style={{color:'var(--muted)'}}>{k}</div><div className="font-medium">{v}</div></div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => notify('Status updated to In Progress ✅', 'success')}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition"
                  style={{ background: 'rgba(34,197,94,.15)', color: '#86EFAC' }}>
            Mark In Progress
          </button>
          <button onClick={() => notify('Navigation launched 🗺️', 'info')}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition"
                  style={{ background: 'rgba(59,130,246,.15)', color: '#93C5FD' }}>
            Open Navigation
          </button>
          <button onClick={() => notify('Mission marked complete ✅', 'success')}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition"
                  style={{ background: 'rgba(239,68,68,.15)', color: '#FCA5A5' }}>
            Complete Mission
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-3">🔔 Notifications</h3>
        {[
          { msg: 'New mission assigned: Vehicle fire on Mumbai-Pune Expressway', type: 'info' },
          { msg: 'Previous mission #6 resolved successfully', type: 'success' },
        ].map((n,i) => (
          <div key={i} className="flex gap-2 py-2.5 text-sm border-b last:border-b-0" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            <span>{n.type === 'success' ? '✅' : 'ℹ️'}</span>{n.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignedCases() {
  const assigned = store.incidents.filter(i => i.assignedTeam === 'Fire Team A' && i.status !== 'Resolved');
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Assigned Cases ({assigned.length})</h2>
      {assigned.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>No active assignments!</div>}
      {assigned.map(i => {
        const colors = { P1:'#EF4444', P2:'#F97316', P3:'#EAB308', P4:'#22C55E' };
        return (
          <div key={i.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderLeft:`4px solid ${colors[i.priority]}` }}
               className="rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-sm">#{i.id} — {i.title}</div>
              <PriorityBadge priority={i.priority} />
            </div>
            <div className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>{i.description}</div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              {[['Location', i.location], ['ETA', i.eta + ' min']].map(([k,v]) => (
                <div key={k}><span style={{ color:'var(--muted)' }}>{k}: </span><span className="font-semibold">{v}</span></div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { store.updateIncidentStatus(i.id, 'In Progress'); notify(`Incident #${i.id} marked In Progress`, 'success'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold"
                      style={{ background:'rgba(34,197,94,.15)', color:'#86EFAC' }}>In Progress</button>
              <button onClick={() => { store.updateIncidentStatus(i.id, 'Resolved'); notify(`Incident #${i.id} resolved ✅`, 'success'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold"
                      style={{ background:'rgba(59,130,246,.15)', color:'#93C5FD' }}>Mark Resolved</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Completed() {
  const done = store.incidents.filter(i => i.status === 'Resolved');
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Completed Missions</h2>
      {done.map(i => (
        <div key={i.id} style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">#{i.id} — {i.title}</div>
            <PriorityBadge priority={i.priority} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[['Location', i.location], ['Category', i.category], ['Resolved', i.updatedAt || i.createdAt]].map(([k,v]) => (
              <div key={k}><div style={{ color:'var(--muted)' }}>{k}</div><div className="font-medium mt-0.5">{v}</div></div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background:'rgba(34,197,94,.1)', color:'#86EFAC' }}>
            ✅ Mission completed successfully
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamStatus() {
  const [current, setCurrent] = useState('On Route');
  const members = ['Rajan P.', 'Suresh K.', 'Amit S.', 'Pradeep M.', 'Vijay T.', 'Mahesh R.'];
  const statuses = ['Available', 'Busy', 'On Route', 'Emergency Mode'];
  return (
    <div>
      <h2 className="font-bold text-base mb-5">Team Status</h2>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5 mb-4">
        <h3 className="font-semibold text-sm mb-4">Update Your Team Status</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statuses.map(s => (
            <button key={s} onClick={() => { setCurrent(s); notify(`Status updated to: ${s}`, 'success'); }}
                    className="py-3 rounded-xl text-sm font-bold transition"
                    style={{
                      background: current === s ? 'var(--red)' : 'var(--surface2)',
                      color: current === s ? '#fff' : 'var(--text)',
                      border: '1px solid var(--border)'
                    }}>
              {s}
            </button>
          ))}
        </div>
        <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.2)' }}>
          Current status: <strong>{current}</strong>
        </div>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)' }} className="rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Team Members (6)</h3>
        {members.map((m, i) => (
          <div key={m} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor:'var(--border)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background:'rgba(59,130,246,.15)', color:'#93C5FD' }}>
              {m.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{m}</div>
              <div className="text-xs" style={{ color:'var(--muted)' }}>Firefighter {i < 2 ? 'Grade A' : 'Grade B'}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background:'rgba(34,197,94,.2)', color:'#86EFAC' }}>Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RescueDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <Sidebar items={SIDEBAR} activeTab={tab} onTabChange={setTab}
               header={{ label: 'Rescue Portal', name: user?.name }} />
      <main className="flex-1 overflow-y-auto p-6">
        {tab === 'overview' && <Overview />}
        {tab === 'assigned' && <AssignedCases />}
        {tab === 'missions' && <Completed />}
        {tab === 'status'   && <TeamStatus />}
      </main>
    </div>
  );
}
