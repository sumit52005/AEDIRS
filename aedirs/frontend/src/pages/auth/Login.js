import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/store';
import { notify } from '../../components/Notification';
import { Zap, Eye, EyeOff } from 'lucide-react';

const ROLES = [
  { key: 'citizen', label: '🧑 Citizen', desc: 'Report & track incidents' },
  { key: 'rescue_team', label: '🚒 Rescue Team', desc: 'View & manage missions' },
  { key: 'authority', label: '🏛️ Authority', desc: 'Full system control' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('citizen');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const quickLogin = (r) => {
    const demos = { citizen: 'citizen@demo.com', rescue_team: 'rescue@demo.com', authority: 'auth@demo.com' };
    setRole(r);
    setForm(f => ({ ...f, email: demos[r], password: 'demo123' }));
    setTimeout(() => handleSubmit(demos[r], 'demo123'), 100);
  };

  const handleSubmit = (emailOverride, pwOverride) => {
    const email = emailOverride || form.email.trim();
    const password = pwOverride || form.password;
    setError('');

    if (!email || !password) { setError('Please fill all required fields.'); return; }

    setLoading(true);
    setTimeout(() => {
      if (mode === 'register') {
        if (!form.name) { setError('Please enter your name.'); setLoading(false); return; }
        const user = store.addUser({ name: form.name, email, password, phone: form.phone, role: 'citizen' });
        login(user, 'demo-token-' + user.id);
        notify('Account created! Welcome to AEDIRS 🎉', 'success');
        navigate('/citizen');
      } else {
        const user = store.findUser(email, password);
        if (!user) { setError('Invalid email or password.'); setLoading(false); return; }
        login(user, 'demo-token-' + user.id);
        notify(`Welcome back, ${user.name}! 👋`, 'success');
        const dest = user.role === 'rescue_team' ? '/rescue' : `/${user.role}`;
        navigate(dest);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-500/30">
            <Zap size={22} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {mode === 'login' ? 'Sign in to AEDIRS' : 'Create your account'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? 'Select your role and sign in' : 'Join the disaster response network'}
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
             className="rounded-2xl p-7">

          {/* Role tabs */}
          <div className="grid grid-cols-3 gap-1.5 rounded-xl p-1.5 mb-6"
               style={{ background: 'var(--surface2)' }}>
            {ROLES.map(r => (
              <button key={r.key} onClick={() => setRole(r.key)}
                      className="py-2 rounded-lg text-xs font-bold transition-all text-center"
                      style={{
                        background: role === r.key ? 'var(--red)' : 'transparent',
                        color: role === r.key ? '#fff' : 'var(--muted)',
                      }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Register fields */}
          {mode === 'register' && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                       placeholder="Your full name"
                       className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                       style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                       placeholder="+91 9876543210"
                       className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                       style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Email Address</label>
            <input value={form.email} onChange={e => set('email', e.target.value)}
                   placeholder="your@email.com" type="email"
                   className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                   style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="mb-5 relative">
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>Password</label>
            <input value={form.password} onChange={e => set('password', e.target.value)}
                   placeholder="••••••••" type={showPw ? 'text' : 'password'}
                   className="w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none"
                   style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-8 text-slate-500 hover:text-slate-300 transition">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
                 style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#FCA5A5' }}>
              ❌ {error}
            </div>
          )}

          <button onClick={() => handleSubmit()} disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: 'var(--red)' }}>
            {loading ? '⏳ Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          <div className="text-center mt-4 text-xs" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="text-blue-400 hover:underline">Create one</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-blue-400 hover:underline">Sign in</button>
              </>
            )}
          </div>

          {/* Demo quick login */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-xs text-center font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
              Demo Quick Login
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { r: 'citizen', label: 'Citizen', bg: 'rgba(59,130,246,.15)', color: '#93C5FD' },
                { r: 'rescue_team', label: 'Rescue', bg: 'rgba(249,115,22,.15)', color: '#FDB96B' },
                { r: 'authority', label: 'Authority', bg: 'rgba(239,68,68,.15)', color: '#FCA5A5' },
              ].map(d => (
                <button key={d.r} onClick={() => quickLogin(d.r)}
                        className="py-2 rounded-xl text-xs font-bold transition"
                        style={{ background: d.bg, color: d.color }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
