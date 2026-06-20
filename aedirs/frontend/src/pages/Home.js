import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Map, Bell, BarChart2, Shield, Truck } from 'lucide-react';

const FEATURES = [
  { icon: '📱', title: 'Citizen Reporting', desc: 'Submit incidents with GPS, photos, voice and video. Works on any device.', color: '#EF4444' },
  { icon: '🤖', title: 'AI Classification', desc: 'NLP engine auto-classifies incident type and assigns P1–P4 priority in real time.', color: '#3B82F6' },
  { icon: '🗺️', title: 'Live Heatmap', desc: 'Color-coded OpenStreetMap shows all active incidents and rescue teams live.', color: '#22C55E' },
  { icon: '🚒', title: 'Smart Dispatch', desc: 'Nearest matching rescue team auto-assigned using Haversine distance formula.', color: '#F97316' },
  { icon: '📊', title: 'Authority Dashboard', desc: 'Real-time tracking, resource management, and analytics for authorities.', color: '#A855F7' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'SMS, email, and push notifications keep all stakeholders informed instantly.', color: '#EAB308' },
];

const WORKFLOW = [
  { step: '01', title: 'Citizen Reports', desc: 'Via form, voice, or image' },
  { step: '02', title: 'AI Classifies', desc: 'Type, priority assigned' },
  { step: '03', title: 'Team Dispatched', desc: 'Nearest team assigned' },
  { step: '04', title: 'Incident Resolved', desc: 'Status updated live' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0A0F1E 0%,#0D1A2E 55%,#0A0F1E 100%)' }}
               className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #EF4444 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3B82F6 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8"
               style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#F87171' }}>
            <span className="pulse w-2 h-2 bg-red-400 rounded-full inline-block" />
            SYSTEM ACTIVE — 24/7 MONITORING
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span className="text-red-400">AI-Enabled</span> Disaster
            <br />Incident Response
          </h1>
          <p className="text-lg mb-10" style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            Real-time disaster management — citizens report, AI classifies,
            rescue teams respond. From report to resolution in minutes.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/login')}
                    className="px-8 py-3 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-red-900/40">
              🚨 Report Emergency
            </button>
            <button onClick={() => navigate('/login')}
                    className="px-8 py-3 text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Authority Login →
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="grid grid-cols-4" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: '56', label: 'Total Reports', color: '#EF4444' },
          { num: '13', label: 'Active Incidents', color: '#F97316' },
          { num: '43', label: 'Resolved', color: '#22C55E' },
          { num: '12m', label: 'Avg Response Time', color: '#3B82F6' },
        ].map(s => (
          <div key={s.label} className="py-6 text-center" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
            <div className="text-3xl font-extrabold leading-none" style={{ color: s.color }}>{s.num}</div>
            <div className="text-xs mt-1.5 font-medium" style={{ color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Workflow */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>How AEDIRS Works</h2>
        <p className="text-center text-sm mb-10" style={{ color: 'var(--muted)' }}>From report to resolution in minutes</p>
        <div className="grid grid-cols-4 gap-4">
          {WORKFLOW.map((w, i) => (
            <div key={w.step} className="text-center relative">
              <div className="text-4xl font-extrabold mb-3 opacity-20" style={{ color: 'var(--red)', fontFamily: 'Rajdhani, sans-serif' }}>
                {w.step}
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-red-500/40 flex items-center justify-center mx-auto mb-3 bg-red-500/10 text-lg">
                {['📱', '🤖', '🚒', '✅'][i]}
              </div>
              <div className="font-semibold text-sm mb-1">{w.title}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{w.desc}</div>
              {i < WORKFLOW.length - 1 && (
                <div className="absolute top-8 right-0 translate-x-1/2 text-slate-700 font-bold text-lg hidden md:block">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Core Features</h2>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `2px solid ${f.color}` }}
                 className="rounded-xl p-5 hover:translate-y-[-2px] transition-transform">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="font-bold text-sm mb-2">{f.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Ready to respond faster?</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Join citizens, rescue teams, and authorities already using AEDIRS
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition">
              Citizen Login
            </button>
            <button onClick={() => navigate('/login')}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl transition"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              Rescue Team
            </button>
            <button onClick={() => navigate('/login')}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl transition"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              Authority
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 px-6 text-center text-xs" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        © 2025 AEDIRS — AI-Enabled Disaster Incident Response System · MIT School of Computing
      </footer>
    </div>
  );
}
