import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, LogOut, ChevronDown, Zap } from 'lucide-react';

export default function Navbar({ notifications = [] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleBadgeColor = {
    citizen: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    rescue_team: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    authority: 'bg-red-500/20 text-red-300 border border-red-500/30',
  };

  const roleLabel = {
    citizen: 'Citizen',
    rescue_team: 'Rescue Team',
    authority: 'Authority',
  };

  return (
    <nav style={{ background: '#0D1526', borderBottom: '1px solid var(--border)' }}
         className="sticky top-0 z-50 flex items-center justify-between px-6 h-14">

      {/* Logo */}
      <button onClick={() => navigate(user ? `/${user.role === 'rescue_team' ? 'rescue' : user.role}` : '/')}
              className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
          <Zap size={16} className="text-red-400" />
        </div>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>
          <span className="text-red-400">AE</span>
          <span className="text-white">DIRS</span>
        </span>
      </button>

      {/* Center links — only on home */}
      {!user && (
        <div className="hidden md:flex items-center gap-1">
          {[['/', 'Home'], ['/about', 'About'], ['/alerts', 'Live Alerts'], ['/safety', 'Safety']].map(([path, label]) => (
            <button key={path} onClick={() => navigate(path)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                      location.pathname === path
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Right section */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-slate-500" />
              <input placeholder="Search incidents…"
                     className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-32" />
            </div>

            {/* Notifications */}
            <button className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
              <Bell size={15} className="text-slate-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* User */}
            <div className="relative">
              <button onClick={() => setShowDropdown(d => !d)}
                      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/10 transition">
                <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-xs font-bold text-red-300">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm text-slate-300 hidden md:block">{user.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full hidden md:block ${roleBadgeColor[user.role]}`}>
                  {roleLabel[user.role]}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {showDropdown && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                     className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <div className="font-semibold text-sm">{user.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                  </div>
                  <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')}
                    className="px-4 py-1.5 text-sm text-slate-300 hover:text-white transition rounded-lg hover:bg-white/5">
              Login
            </button>
            <button onClick={() => navigate('/login')}
                    className="px-4 py-1.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
              Report Emergency
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
