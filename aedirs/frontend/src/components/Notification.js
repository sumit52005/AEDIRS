import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

let _notify = null;
export function notify(msg, type = 'info') {
  if (_notify) _notify(msg, type);
}

export function NotificationProvider() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    _notify = (msg, type) => {
      const id = Date.now();
      setItems(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 4500);
    };
    return () => { _notify = null; };
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: 'border-l-green-400',
    error:   'border-l-red-400',
    info:    'border-l-blue-400',
    warning: 'border-l-orange-400',
  };

  return createPortal(
    <div className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {items.map(item => (
        <div key={item.id}
             className={`notif-slide pointer-events-auto border-l-4 ${colors[item.type] || colors.info} rounded-xl px-4 py-3 text-sm shadow-2xl`}
             style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeftWidth: 4 }}>
          <span className="mr-2">{icons[item.type]}</span>
          {item.msg}
        </div>
      ))}
    </div>,
    document.body
  );
}
